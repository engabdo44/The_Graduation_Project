const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanOrphans() {
    console.log("Checking for orphaned database records...");
    
    try {
        const citizenFix = await prisma.$executeRawUnsafe(`
            UPDATE users 
            SET citizen_id = NULL 
            WHERE citizen_id IS NOT NULL 
              AND citizen_id NOT IN (SELECT citizen_id FROM citizens);
        `);
        console.log(`Cleaned ${citizenFix} orphaned citizen_id references in users table.`);

        const residentFix = await prisma.$executeRawUnsafe(`
            UPDATE users 
            SET resident_id = NULL 
            WHERE resident_id IS NOT NULL 
              AND resident_id NOT IN (SELECT resident_id FROM residents);
        `);
        console.log(`Cleaned ${residentFix} orphaned resident_id references in users table.`);

        const employeeFix = await prisma.$executeRawUnsafe(`
            UPDATE users 
            SET employee_id = NULL 
            WHERE employee_id IS NOT NULL 
              AND employee_id NOT IN (SELECT employee_id FROM employees);
        `);
        console.log(`Cleaned ${employeeFix} orphaned employee_id references in users table.`);

    } catch (err) {
        console.error("Error during cleanup:");
        console.error(err.message);
    } finally {
        await prisma.$disconnect();
    }
}

cleanOrphans();
