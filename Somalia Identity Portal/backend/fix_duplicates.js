const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function removeDuplicates() {
    console.log('Fetching print queue...');
    const queue = await prisma.print_queue.findMany({
        orderBy: { print_id: 'asc' }
    });

    const seen = new Set();
    const toDelete = [];

    for (const item of queue) {
        const key = item.request_number ? "req_" + item.request_number : "doc_" + item.document_number + "_" + item.document_type;
        
        if (seen.has(key)) {
            toDelete.push(item.print_id);
            console.log("Duplicate found: " + key + " (ID: " + item.print_id + ")");
        } else {
            seen.add(key);
        }
    }

    if (toDelete.length > 0) {
        console.log("Deleting " + toDelete.length + " duplicates...");
        const result = await prisma.print_queue.deleteMany({
            where: { print_id: { in: toDelete } }
        });
        console.log("Deleted " + result.count + " duplicate records.");
    } else {
        console.log('No duplicates found in print_queue.');
    }
}

removeDuplicates()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
