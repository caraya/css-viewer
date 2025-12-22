import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '../public/css-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
let missingHref = [];
Object.entries(data).forEach(([spec, content]) => {
  ['properties', 'atrules', 'values'].forEach(type => {
    if (content[type]) {
      content[type].forEach(item => {
        if (!item.href) {
          missingHref.push({spec, name: item.name, type});
        }
      });
    }
  });
});
console.log('Items missing href:', missingHref.length);
console.log(missingHref.slice(0, 10));
