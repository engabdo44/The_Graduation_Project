const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const users = await prisma.user.findMany({
        include: { 
            citizen: true,
            resident: true,
            employee: true
        }
    });
    console.log(JSON.stringify(users, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));
}
main().finally(() => prisma.$disconnect());
