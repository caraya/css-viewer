import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function runScript(scriptName) {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, scriptName);
        console.log(`\n--- Running ${scriptName} ---`);
        
        const child = spawn('node', [scriptPath], { stdio: 'inherit' });

        child.on('close', (code) => {
            if (code === 0) {
                console.log(`--- ${scriptName} completed successfully ---`);
                resolve();
            } else {
                console.error(`--- ${scriptName} failed with code ${code} ---`);
                reject(new Error(`${scriptName} failed`));
            }
        });

        child.on('error', (err) => {
            console.error(`Failed to start ${scriptName}:`, err);
            reject(err);
        });
    });
}

async function main() {
    try {
        // Step 1: Fetch and update data
        await runScript('update-data.js');

        // Step 2: Validate data integrity
        // We run this to ensure the generated data is valid, even though update-data.js succeeded
        await runScript('check-hrefs.js');

        console.log('\n✅ Data preparation complete!');
    } catch (error) {
        console.error('\n❌ Data preparation failed:', error.message);
        process.exit(1);
    }
}

main();
