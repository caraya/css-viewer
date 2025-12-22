import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const specsPath = path.join(__dirname, '../public/specs.json');
const specsData = JSON.parse(fs.readFileSync(specsPath, 'utf8'));

const completedSpecs = specsData.results.filter(spec => 
    spec.release && 
    spec.release.status === 'Recommendation' &&
    spec.groups &&
    spec.groups.some(g => g.name === 'Cascading Style Sheets (CSS) Working Group')
);

console.log(`Total specs: ${specsData.results.length}`);
console.log(`Completed CSS specs: ${completedSpecs.length}`);

const css2 = specsData.results.find(s => s.shortname === 'CSS2');
if (css2) {
    console.log('CSS2 found:');
    console.log('Status:', css2.release ? css2.release.status : 'No release');
    console.log('Groups:', css2.groups ? css2.groups.map(g => g.name) : 'No groups');
    
    const isRec = css2.release && css2.release.status === 'Recommendation';
    const hasGroup = css2.groups && css2.groups.some(g => g.name === 'Cascading Style Sheets (CSS) Working Group');
    
    console.log('Is Recommendation:', isRec);
    console.log('Has CSS Group:', hasGroup);
} else {
    console.log('CSS2 not found in results');
}

const allGroups = new Set();
specsData.results.forEach(spec => {
    if (spec.release && spec.release.status === 'Recommendation' && spec.groups) {
        spec.groups.forEach(g => allGroups.add(g.name));
    }
});

console.log('\nAll Groups in Recommendations:');
allGroups.forEach(g => console.log(`- ${g}`));

const cssStatuses = {};
specsData.results.forEach(spec => {
    if (spec.groups && spec.groups.some(g => g.name === 'Cascading Style Sheets (CSS) Working Group')) {
        const status = spec.release ? spec.release.status : 'No Release';
        cssStatuses[status] = (cssStatuses[status] || 0) + 1;
    }
});

console.log('\nCSS WG Spec Statuses:');
console.log(cssStatuses);
