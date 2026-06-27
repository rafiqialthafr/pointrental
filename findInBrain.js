const fs = require('fs');
const path = require('path');
const os = require('os');

function searchBrain(dir) {
    if (!fs.existsSync(dir)) return;
    try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const p = path.join(dir, file);
            try {
                const stat = fs.statSync(p);
                if (stat.isDirectory()) {
                    if (file === '.system_generated' || file === 'logs' || file.startsWith('0') || file.startsWith('1') || file.startsWith('2') || file.startsWith('3') || file.match(/^[0-9a-f]{8}-/)) {
                        searchBrain(p);
                    }
                } else if (file.endsWith('.txt') || file.endsWith('.md') || file.endsWith('.json')) {
                    if (stat.size < 5000000) { // skip massive files
                        const content = fs.readFileSync(p, 'utf8');
                        if (content.includes('41319') || content.includes('AdminDashboard') || content.includes('src/app/admin')) {
                            console.log(`Found reference in: ${p}`);
                        }
                    }
                }
            } catch (e) { }
        }
    } catch (e) { }
}

console.log("Searching Agent Logs for the file...");
searchBrain(path.join(os.homedir(), '.gemini', 'antigravity', 'brain'));
