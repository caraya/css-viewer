import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import process from 'node:process';
import bcd from '@mdn/browser-compat-data' with { type: "json" };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../public');
const OUTPUT_FILE = path.join(DATA_DIR, 'css-data.json');
const SPECS_FILE = path.join(DATA_DIR, 'specs.json');

const BASE_URL = 'https://raw.githubusercontent.com/w3c/webref/curated/ed';
const SPECS_URL = `${BASE_URL}/index.json`;

function checkSupport(feature, type) {
    let mdnData = null;
    
    if (type === 'property') {
        mdnData = bcd.css.properties[feature];
    } else if (type === 'at-rule') {
        const name = feature.startsWith('@') ? feature.substring(1) : feature;
        mdnData = bcd.css['at-rules'][name];
    } else if (type === 'value' || type === 'function') {
        const name = feature.replace('()', '');
        mdnData = bcd.css.types[name];
        if (!mdnData && bcd.css.types.color && bcd.css.types.color[name]) {
            mdnData = bcd.css.types.color[name];
        }
    }

    if (!mdnData || !mdnData.__compat) {
        return { supported: false, browsers: 0, flagged: false };
    }

    const support = mdnData.__compat.support;
    const browsers = ['chrome', 'firefox', 'safari'];
    let supportedCount = 0;
    let isFlagged = false;
    const supportDetails = {};

    browsers.forEach(browser => {
        const browserSupport = support[browser];
        if (!browserSupport) {
            supportDetails[browser] = false;
            return;
        }

        const supportItems = Array.isArray(browserSupport) ? browserSupport : [browserSupport];
        
        const hasSupport = supportItems.some(item => {
            if (item.version_added && item.version_added !== false) {
                if (item.flags) {
                    isFlagged = true;
                }
                return true;
            }
            return false;
        });

        if (hasSupport) {
            supportedCount++;
            supportDetails[browser] = true;
        } else {
            supportDetails[browser] = false;
        }
    });

    return {
        supported: supportedCount >= 2,
        browsers: supportedCount,
        flagged: isFlagged,
        support: supportDetails
    };
}

async function fetchData() {
  try {
    console.log('Fetching index.json...');
    const indexResponse = await axios.get(SPECS_URL);
    const indexData = indexResponse.data;

    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(SPECS_FILE, JSON.stringify(indexData, null, 2));
    console.log(`Saved specs to ${SPECS_FILE}`);

    const cssData = {};
    const specs = indexData.results;
    let count = 0;

    console.log(`Processing ${specs.length} specs...`);

    // Process in chunks to avoid rate limiting or overwhelming connections
    const CHUNK_SIZE = 10;
    for (let i = 0; i < specs.length; i += CHUNK_SIZE) {
      const chunk = specs.slice(i, i + CHUNK_SIZE);
      await Promise.all(chunk.map(async (spec) => {
        let shortname = spec.shortname;
        let fetchName = shortname;
        
        // Handle known aliases/mismatches
        if (shortname === 'css-color-4') {
            fetchName = 'css-color';
        } else if (shortname === 'css-easing-2') {
            fetchName = 'css-easing';
        }
        
        const url = `${BASE_URL}/css/${fetchName}.json`;

        try {
          const response = await axios.get(url);
          cssData[shortname] = response.data; // Store under the original shortname (e.g. css-color-4)
          
          // Add note for css-color-4
          if (shortname === 'css-color-4') {
              cssData[shortname].note = "Current work is being done in css-color-4, but the recommendation is css-color-3.";
          }

          count++;
          process.stdout.write('.');
        } catch (err) {
          if (err.response && err.response.status === 404) {
            // Not all specs have CSS definitions, this is expected
          } else {
            console.error(`\nError fetching ${shortname}: ${err.message}`);
          }
        }
      }));
    }

    console.log(`\nFetched CSS data for ${count} specs.`);

    // Filter and annotate with BCD
    console.log('\nAnnotating with browser compatibility data...');
    
    Object.keys(cssData).forEach(specName => {
        const specData = cssData[specName];
        
        ['properties', 'atrules', 'values'].forEach(type => {
            if (!specData[type]) return;
            
            // Annotate items
            specData[type].forEach(item => {
                // Map W3C type to our checkSupport type
                let checkType = 'property';
                if (type === 'atrules') checkType = 'at-rule';
                if (type === 'values') {
                    checkType = item.type === 'function' ? 'function' : 'value';
                }

                const compat = checkSupport(item.name, checkType);
                item.compatibility = compat;
            });
        });
    });

    // Inject missing items
    const missingItems = {
        'css-values-5': [
            {
                name: 'if()',
                href: 'https://drafts.csswg.org/css-values-5/#funcdef-if',
                type: 'value',
                value: 'if( <boolean-condition> , <value> , <value>? )'
            }
        ]
    };

    Object.entries(missingItems).forEach(([specName, items]) => {
        if (cssData[specName]) {
            if (!cssData[specName].values) {
                cssData[specName].values = [];
            }
            items.forEach(item => {
                // Check if it already exists to avoid duplicates
                if (!cssData[specName].values.find(v => v.name === item.name)) {
                    cssData[specName].values.push(item);
                    console.log(`Injected ${item.name} into ${specName}`);
                }
            });
        }
    });

    // Apply manual patches for missing hrefs
    const manualPatches = {
        'mediaqueries-5': {
            '@media': { href: 'https://drafts.csswg.org/mediaqueries-5/#at-ruledef-media' }
        },
        'compat': {
            '@media': { href: 'https://compat.spec.whatwg.org/#css-media-queries' }
        },
        'css-sizing-4': {
            'width': { href: 'https://drafts.csswg.org/css-sizing-4/#propdef-width' },
            'height': { href: 'https://drafts.csswg.org/css-sizing-4/#propdef-height' },
            'min-width': { href: 'https://drafts.csswg.org/css-sizing-4/#propdef-min-width' },
            'min-height': { href: 'https://drafts.csswg.org/css-sizing-4/#propdef-min-height' },
            'max-width': { href: 'https://drafts.csswg.org/css-sizing-4/#propdef-max-width' },
            'max-height': { href: 'https://drafts.csswg.org/css-sizing-4/#propdef-max-height' },
        },
        'css-grid-3': {
            'display': { href: 'https://drafts.csswg.org/css-grid-3/#propdef-display' }
        },
        'css-overflow-5': {
            'continue': { href: 'https://drafts.csswg.org/css-overflow-5/#propdef-continue' }
        },
        'css-anchor-position-2': {
            '@container': { href: 'https://drafts.csswg.org/css-anchor-position-2/#at-ruledef-container' }
        },
        'mathml-core': {
            'display': { href: 'https://w3c.github.io/mathml-core/#propdef-display' }
        }
    };

    Object.entries(manualPatches).forEach(([specName, patches]) => {
        if (cssData[specName]) {
            ['properties', 'atrules', 'values'].forEach(type => {
                if (cssData[specName][type]) {
                    cssData[specName][type].forEach(item => {
                        if (patches[item.name] && !item.href) {
                            item.href = patches[item.name].href;
                        }
                    });
                }
            });
        }
    });

    await fs.writeFile(OUTPUT_FILE, JSON.stringify(cssData, null, 2));
    console.log(`Saved CSS data to ${OUTPUT_FILE}`);

  } catch (error) {
    console.error('Error in fetchData:', error);
    process.exit(1);
  }
}

fetchData();
