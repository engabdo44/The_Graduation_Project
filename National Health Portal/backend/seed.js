const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Ministry Health Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  let adminEmployee = await prisma.employees.findFirst({
    where: { full_name: 'Dr. Jama Mohamed' }
  });
  
  if (!adminEmployee) {
    adminEmployee = await prisma.employees.create({
      data: {
        full_name: 'Dr. Jama Mohamed',
        role: 'Ministry Health Admin',
        department: 'MOG-HQ-PRIMARY',
        email: 'dr.jama@health.gov.so'
      }
    });
  }

  const admin = await prisma.users.upsert({
    where: { username: 'admin' },
    update: {
      password_hash: adminPassword,
      employee_id: adminEmployee.employee_id,
      account_type: 'Ministry Health Admin'
    },
    create: {
      username: 'admin',
      email: 'admin@health.gov.so',
      password_hash: adminPassword,
      account_type: 'Ministry Health Admin',
      employee_id: adminEmployee.employee_id,
      is_active: true
    }
  });
  console.log('✅ Created Ministry Health Admin:', admin.username);

  // Create Sector Authorized user
  const sectorPassword = await bcrypt.hash('sector123', 10);
  
  let sectorEmployee = await prisma.employees.findFirst({
    where: { full_name: 'Ahmed Hassan' }
  });
  
  if (!sectorEmployee) {
    sectorEmployee = await prisma.employees.create({
      data: {
        full_name: 'Ahmed Hassan',
        role: 'Sector Authorized',
        department: 'HGS-BANADIR',
        email: 'ahmed.hassan@health.gov.so'
      }
    });
  }

  const sector = await prisma.users.upsert({
    where: { username: 'sector' },
    update: {
      password_hash: sectorPassword,
      employee_id: sectorEmployee.employee_id
    },
    create: {
      username: 'sector',
      email: 'sector@health.gov.so',
      password_hash: sectorPassword,
      account_type: 'admin',
      employee_id: sectorEmployee.employee_id,
      is_active: true
    }
  });
  console.log('✅ Created Sector Authorized user:', sector.username);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
