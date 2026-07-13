const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

const frontendDir = path.join(__dirname, '..', 'frontend');
if (fs.existsSync(frontendDir)) {
    const files = walk(frontendDir).filter(f => f.endsWith('.jsx') || f.endsWith('.js'));
    console.log(`Checking ${files.length} frontend files...`);
    files.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        // Search for fetch calls
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
            if (line.includes('fetch(') || line.includes('localStorage.get')) {
                console.log(`${path.basename(file)}:${idx+1}: ${line.trim()}`);
            }
        });
    });
} else {
    console.log('Frontend directory not found at', frontendDir);
}
