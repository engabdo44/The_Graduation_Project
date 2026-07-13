const fs = require('fs');
const content = fs.readFileSync('server.js', 'utf8');
const lines = content.split('\n');
let out = '';
lines.forEach((line, idx) => {
    if (line.includes('change-password') || line.includes('changePassword') || line.includes('setup-password')) {
        out += `${idx+1}: ${line.trim()}\n`;
    }
});
fs.writeFileSync('search_results.txt', out);
console.log('Done!');
