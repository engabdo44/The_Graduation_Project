const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    try {
        const username = 'police1';
        const rawPassword = 'password123';
        const email = 'police1@gateway.so';
        
        console.log(`Creating user: ${username} with password: ${rawPassword}...`);
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(rawPassword, salt);
        
        // Create user
        const user = await prisma.users.create({
            data: {
                username: username,
                password_hash: hashedPassword,
                email: email,
                account_type: 'Police_Officer',
                is_active: true,
                account_status: 'Active'
            }
        });
        
        console.log('\n✅ User created successfully!');
        console.log('---------------------------');
        console.log(`Username     : ${user.username}`);
        console.log(`Password     : ${rawPassword}`);
        console.log(`Account Type : Police Officer`);
        console.log('---------------------------\n');

    } catch (e) {
         if(e.code === 'P2002') {
             console.log('\n⚠️ Error: A user with this username or email already exists!');
         } else {
             console.error('\n❌ Error creating user:', e.message);
         }
    } finally {
        await prisma.$disconnect();
    }
}

main();
