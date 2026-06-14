const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Adding columns...");
    try { 
        await prisma.$executeRawUnsafe('ALTER TABLE citizens ADD COLUMN photo LONGTEXT;'); 
        console.log("Added photo to citizens"); 
    } catch(e) { console.log("citizen photo already exists or error: " + e.message); }
    
    try { 
        await prisma.$executeRawUnsafe('ALTER TABLE residents ADD COLUMN photo LONGTEXT;'); 
        console.log("Added photo to residents"); 
    } catch(e) { console.log("resident photo already exists or error: " + e.message); }
    
    try { 
        await prisma.$executeRawUnsafe('ALTER TABLE applications ADD COLUMN personal_photo LONGTEXT;'); 
        console.log("Added personal_photo to applications"); 
    } catch(e) { console.log("application photo already exists or error: " + e.message); }
    
    console.log("Done.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
