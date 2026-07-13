const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'server.js');
const code = fs.readFileSync(filePath, 'utf8');

// Find all matches for prisma.<something>
const matches = [...code.matchAll(/prisma\.([a-zA-Z0-9_$]+)/g)].map(m => m[1]);
const uniqueMatches = [...new Set(matches)];

console.log('Found prisma matches in server.js:');
console.log(uniqueMatches);
