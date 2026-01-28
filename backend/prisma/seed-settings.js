import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding school settings...');

  // Create or update default school settings
  const settings = await prisma.schoolSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      schoolName: 'DanceSuite Academy',
      motto: 'Where passion meets excellence',
      primaryColor: '#a855f7',
      theme: 'LIGHT'
    }
  });

  console.log('School settings created:', settings);

  // Check if admin user exists
  const adminCount = await prisma.user.count({
    where: { role: 'ADMIN' }
  });

  console.log(`Found ${adminCount} admin user(s)`);

  if (adminCount === 0) {
    console.log('\nNo admin user found. Please create one using the registration page.');
    console.log('After registration, update the user role to ADMIN in the database.');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
