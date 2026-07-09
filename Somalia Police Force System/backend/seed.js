const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Police System database seed...');

  // Create Police Officer user
  const policePassword = await bcrypt.hash('police123', 10);
  const police = await prisma.users.upsert({
    where: { username: 'police' },
    update: {},
    create: {
      username: 'police',
      email: 'police@spf.gov.so',
      password_hash: policePassword,
      account_type: 'police_officer',
      is_active: true
    }
  });
  console.log('✅ Created Police Officer:', police.username);

  // Create Admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.users.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@spf.gov.so',
      password_hash: adminPassword,
      account_type: 'admin',
      is_active: true
    }
  });
  console.log('✅ Created Admin user:', admin.username);

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
