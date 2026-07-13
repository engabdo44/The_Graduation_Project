const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'server.js');
let code = fs.readFileSync(filePath, 'utf8');

console.log('Original code size:', code.length);

// 1. Prisma Client Top level Model Name Replacements
// We map singular/camelCase models to plural/snake_case ones
const modelReplacements = [
    { from: /\bprisma\.user\b/g, to: 'prisma.users' },
    { from: /\bprisma\.systemLog\b/g, to: 'prisma.system_logs' },
    { from: /\bprisma\.citizenIdCard\b/g, to: 'prisma.citizen_id_cards' },
    { from: /\bprisma\.residentIdCard\b/g, to: 'prisma.resident_id_cards' },
    { from: /\bprisma\.printQueue\b/g, to: 'prisma.print_queue' },
    { from: /\bprisma\.notification\b/g, to: 'prisma.notifications' },
    { from: /\bprisma\.citizen\b/g, to: 'prisma.citizens' },
    { from: /\bprisma\.resident\b/g, to: 'prisma.residents' },
    { from: /\bprisma\.passport\b/g, to: 'prisma.passports' },
    { from: /\bprisma\.application\b/g, to: 'prisma.applications' },
    { from: /\bprisma\.criminalRecord\b/g, to: 'prisma.criminal_records' },
    { from: /\bprisma\.residentCriminalRecord\b/g, to: 'prisma.resident_criminal_records' },
];

console.log('\n--- Applying Model Replacements ---');
modelReplacements.forEach(({ from, to }) => {
    const matchesCount = (code.match(from) || []).length;
    console.log(`Replacing ${from} with ${to}: found ${matchesCount} matches`);
    code = code.replace(from, to);
});

// 2. Relation property accesses (citizen, resident, employee) in query includes
// We need to change includes and destructuring from singular to plural relation names.
// Note: we need to be careful to only replace relation references, not other variables.
// Let's list some specific patterns:
const relationReplacements = [
    // Includes inside prisma queries:
    { from: /\bcitizen:\s*true\b/g, to: 'citizens: true' },
    { from: /\bresident:\s*true\b/g, to: 'residents: true' },
    { from: /\bemployee:\s*true\b/g, to: 'employees: true' },
    { from: /\bcitizen:\s*\{\s*select:\s*\{\s*full_name:\s*true\s*\}\s*\}/g, to: 'citizens: { select: { full_name: true } }' },
    { from: /\bresident:\s*\{\s*select:\s*\{\s*full_name:\s*true\s*\}\s*\}/g, to: 'residents: { select: { full_name: true } }' },
    { from: /\bemployee:\s*\{\s*select:\s*\{\s*full_name:\s*true\s*\}\s*\}/g, to: 'employees: { select: { full_name: true } }' },

    // Destructuring: { citizen, resident, employee }
    { from: /const\s*\{\s*password_hash,\s*citizen,\s*resident,\s*employee,\s*\.\.\.userRest\s*\}\s*=\s*user/g, to: 'const { password_hash, citizens, residents, employees, ...userRest } = user' },
    { from: /const\s*\{\s*password_hash,\s*citizen,\s*resident,\s*employee,\s*\.\.\.rest\s*\}\s*=\s*user/g, to: 'const { password_hash, citizens, residents, employees, ...rest } = user' },
    { from: /const\s*\{\s*password_hash,\s*citizen,\s*resident,\s*\.\.\.userRest\s*\}\s*=\s*newUser/g, to: 'const { password_hash, citizens, residents, ...userRest } = newUser' },
    { from: /const\s*\{\s*password_hash,\s*citizen,\s*resident,\s*employee,\s*\.\.\.rest\s*\}\s*=\s*u/g, to: 'const { password_hash, citizens, residents, employees, ...rest } = u' },

    // Variable property accesses:
    // application.citizen -> application.citizens
    // application.resident -> application.residents
    { from: /\bapplication\.citizen\b/g, to: 'application.citizens' },
    { from: /\bapplication\.resident\b/g, to: 'application.residents' },
    
    // user.citizen or user.resident or user.employee
    { from: /\b(citizen\s*\|\|\s*resident\s*\|\|\s*employee)\b/g, to: 'citizens || residents || employees' },
    { from: /\b(citizen\s*\|\|\s*resident)\b/g, to: 'citizens || residents' },
    
    // u.citizen or u.resident or u.employee
    { from: /\bcitizen\?\.full_name\b/g, to: 'citizens?.full_name' },
    { from: /\bresident\?\.full_name\b/g, to: 'residents?.full_name' },
    { from: /\bemployee\?\.full_name\b/g, to: 'employees?.full_name' },
];

console.log('\n--- Applying Relation Replacements ---');
relationReplacements.forEach(({ from, to }) => {
    const matchesCount = (code.match(from) || []).length;
    console.log(`Replacing ${from} with ${to}: found ${matchesCount} matches`);
    code = code.replace(from, to);
});

// Let's do some manual checks/fixes for parts that might have been custom:
// Line 909-947 (inside signup route):
// citizen: { create: ... } or resident: { create: ... }
// Let's verify matches for citizen: { create: ... } & resident: { create: ... } in signup.
// In prisma, nested write relation names are also pluralized if they are one-to-one/one-to-many.
// In the schema, users has citizens and residents relation fields, so they should be citizens: { create: ... } and residents: { create: ... }!
const signupReplacements = [
    { from: /\bcitizen:\s*\{\s*create:\s*\{/g, to: 'citizens: { create: {' },
    { from: /\bresident:\s*\{\s*create:\s*\{/g, to: 'residents: { create: {' }
];

console.log('\n--- Applying Signup Replacements ---');
signupReplacements.forEach(({ from, to }) => {
    const matchesCount = (code.match(from) || []).length;
    console.log(`Replacing ${from} with ${to}: found ${matchesCount} matches`);
    code = code.replace(from, to);
});

// Let's also check for includes in signup:
// include: { citizen: true }
// include: { resident: true }
// They should be citizens or residents. In relationReplacements we replaced citizen: true and resident: true, but let's verify if they match.
// Yes, relationReplacements has /citizen:\s*true/ which will match.

// Write back to server.js
fs.writeFileSync(filePath, code, 'utf8');
console.log('\nSuccessfully patched server.js!');
