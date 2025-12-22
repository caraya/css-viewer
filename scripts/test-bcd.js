import bcd from '@mdn/browser-compat-data' with { type: "json" };

function checkSupport(feature, type) {
    // Map W3C type to MDN path
    let mdnData = null;
    
    if (type === 'property') {
        mdnData = bcd.css.properties[feature];
    } else if (type === 'at-rule') {
        // Remove @ from name for lookup if needed, MDN usually stores as "media", "supports" etc under at-rules
        const name = feature.startsWith('@') ? feature.substring(1) : feature;
        mdnData = bcd.css['at-rules'][name];
    } else if (type === 'value' || type === 'function') {
        // Values and functions are tricky in MDN. 
        // They can be under css.types, css.properties.PROP.values, etc.
        // For global types/functions:
        const name = feature.replace('()', '');
        
        // Check top-level types first
        mdnData = bcd.css.types[name];
        
        // If not found, check inside color type (special case for color functions)
        if (!mdnData && bcd.css.types.color[name]) {
            mdnData = bcd.css.types.color[name];
        }
        
        // If not found in types, it might be a function like calc()
        if (!mdnData && type === 'function') {
             // Sometimes functions are listed directly? No, usually under types.
        }
    }

    if (!mdnData || !mdnData.__compat) {
        return { supported: false, browsers: 0, flagged: false };
    }

    const support = mdnData.__compat.support;
    const browsers = ['chrome', 'firefox', 'safari'];
    let supportedCount = 0;
    let isFlagged = false;

    browsers.forEach(browser => {
        const browserSupport = support[browser];
        if (!browserSupport) return;

        // browserSupport can be an array or object
        const supportItems = Array.isArray(browserSupport) ? browserSupport : [browserSupport];
        
        // Check if any entry indicates support
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
        }
    });

    return {
        supported: supportedCount >= 2,
        browsers: supportedCount,
        flagged: isFlagged
    };
}

// Test some known items
console.log('color:', checkSupport('color', 'property'));
console.log('display:', checkSupport('display', 'property'));
console.log('@media:', checkSupport('@media', 'at-rule'));
console.log('calc():', checkSupport('calc()', 'function'));
console.log('rgb():', checkSupport('rgb()', 'function'));
console.log('cos():', checkSupport('cos()', 'function')); // Newer
console.log('if():', checkSupport('if()', 'function')); // Very new
