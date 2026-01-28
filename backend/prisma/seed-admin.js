import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating test admin user...');

  // Hash password
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Create or update admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dancesuite.com' },
    update: {
      role: 'ADMIN',
      password: hashedPassword
    },
    create: {
      email: 'admin@dancesuite.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN'
    }
  });

  console.log('Admin user created/updated:');
  console.log(`  Email: ${admin.email}`);
  console.log(`  Password: admin123`);
  console.log(`  Role: ${admin.role}`);
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
