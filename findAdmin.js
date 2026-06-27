const fs = require('fs');
const path = require('path');
const os = require('os');

function searchHistory(historyDir) {
    if (!fs.existsSync(historyDir)) return;
    const entries = fs.readdirSync(historyDir);
    for (const folder of entries) {
        const folderPath = path.join(historyDir, folder);
        try {
            if (fs.statSync(folderPath).isDirectory()) {
                const subFiles = fs.readdirSync(folderPath);
                for (const file of subFiles) {
                    const filePath = path.join(folderPath, file);
                    try {
                        const stat = fs.statSync(filePath);
                        if (stat.size >= 41300 && stat.size <= 41400) {
                            console.log(`FOUND EXACT SIZE MATCH in ${historyDir}: ${filePath} size: ${stat.size}`);
                            fs.copyFileSync(filePath, path.join(process.cwd(), 'recovered_admin_' + Date.now() + '.js'));
                        }
                    } catch (e) { }
                }
            }
        } catch (e) { }
    }
}

console.log("Searching Code History...");
searchHistory(path.join(os.homedir(), 'AppData', 'Roaming', 'Code', 'User', 'History'));
console.log("Searching Cursor History...");
searchHistory(path.join(os.homedir(), 'AppData', 'Roaming', 'Cursor', 'User', 'History'));
console.log("Search complete.");
