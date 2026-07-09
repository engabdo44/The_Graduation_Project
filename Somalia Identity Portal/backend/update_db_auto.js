const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS print_queue (
            print_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            document_type VARCHAR(50) NOT NULL,
            document_number VARCHAR(50) NOT NULL,
            applicant_name VARCHAR(200) NOT NULL,
            request_number VARCHAR(50),
            request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            status ENUM('pending', 'printed') DEFAULT 'pending',
            printed_by VARCHAR(200),
            print_date DATE,
            print_time VARCHAR(50)
        ) ENGINE=InnoDB;
        `);
        console.log("Created print_queue table");

        await prisma.$executeRawUnsafe(`
            ALTER TABLE applications MODIFY status ENUM('submitted','under_review','approved','rejected','printing_queue','printed','completed') DEFAULT 'submitted';
        `);
        console.log("Updated applications table status enum");
    } catch(e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
run();
