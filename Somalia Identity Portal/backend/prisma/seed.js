const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding data based on new schema...');

    // 1. Create a Citizen
    const citizen = await prisma.citizen.upsert({
        where: { national_number: 'ID12345678' },
        update: {},
        create: {
            national_number: 'ID12345678',
            full_name: 'Ahmed Mohamed',
            dob: new Date('1990-01-01'),
            gender: 'male',
            nationality: 'Somali',
            marital_status: 'single',
            address: 'Near Benadir Hospital, Mogadishu',
            phone: '+252611223344',
            email: 'ahmed@example.so',
            status: 'active'
        }
    });

    // 2. Create User accounts linked to that citizen
    await prisma.user.upsert({
        where: { username: 'citizen' },
        update: {},
        create: {
            username: 'citizen',
            email: 'citizen@example.so',
            password_hash: 'citizen',
            account_type: 'citizen',
            citizen_id: citizen.citizen_id
        }
    });

    // 3. Create an Employee
    const employee = await prisma.employee.create({
        data: {
            full_name: 'Admin User',
            role: 'System Administrator',
            department: 'IT',
            status: 'active'
        }
    });

    // 4. Create User account for Admin
    await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            email: 'admin@somalia.gov.so',
            password_hash: 'admin',
            account_type: 'employee',
            employee_id: employee.employee_id
        }
    });

    console.log('Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
