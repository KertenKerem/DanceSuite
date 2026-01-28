import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating office worker user...');

  // Get the first branch
  const branch = await prisma.branch.findFirst();

  if (!branch) {
    console.log('❌ No branches found. Please create a branch first.');
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash('office123', 10);

  // Create or update office worker user
  const officeWorker = await prisma.user.upsert({
    where: { email: 'office@dancesuite.com' },
    update: {
      role: 'OFFICE_WORKER',
      branchId: branch.id,
      password: hashedPassword
    },
    create: {
      email: 'office@dancesuite.com',
      password: hashedPassword,
      firstName: 'Office',
      lastName: 'Worker',
      role: 'OFFICE_WORKER',
      branchId: branch.id
    }
  });

  console.log('Office worker created/updated:');
  console.log(`  Email: ${officeWorker.email}`);
  console.log(`  Password: office123`);
  console.log(`  Role: ${officeWorker.role}`);
  console.log(`  Branch: ${branch.name} (ID: ${branch.id})`);
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
