import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cssDataPath = path.join(__dirname, '../public/css-data.json');
const cssData = JSON.parse(fs.readFileSync(cssDataPath, 'utf8'));

const specName = 'css-color-3';
const specData = cssData[specName];

if (specData) {
    console.log(`Found data for ${specName}`);
    console.log('Keys:', Object.keys(specData));
    
    if (specData.properties) {
        console.log(`Properties (${specData.properties.length}):`, specData.properties.map(p => p.name));
    } else {
        console.log('No properties found in spec data');
    }

    if (specData.values) {
         console.log(`Values/Functions (${specData.values.length}):`, specData.values.map(v => v.name));
    }
} else {
    console.log(`No data found for ${specName}`);
}

// Check for 'color' property across all specs
console.log('\nSearching for "color" property...');
Object.entries(cssData).forEach(([name, data]) => {
    if (data.properties) {
        const colorProp = data.properties.find(p => p.name === 'color');
        if (colorProp) {
            console.log(`Found "color" in ${name}`);
        }
    }
});
