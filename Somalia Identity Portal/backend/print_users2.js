const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.users.findMany({
            select: {
                username: true,
                password_hash: true,
                account_type: true
            }
        });
        console.log('Registered Users with passwords JSON:');
        console.log(JSON.stringify(users, null, 2));
    } catch (err) {
        console.error('Error querying database:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
