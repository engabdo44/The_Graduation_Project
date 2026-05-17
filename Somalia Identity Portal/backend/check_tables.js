const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    try {
        const tables = await prisma.$queryRawUnsafe('SHOW TABLES');
        console.log('Tables in database:', tables);
    } catch (e) {
        console.error('Error fetching tables:', e);
    }
}
main().finally(() => prisma.$disconnect());
