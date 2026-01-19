import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const instructorPassword = await bcrypt.hash('instructor123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@dancesuite.com' },
    update: {},
    create: {
      email: 'admin@dancesuite.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN'
    }
  });

  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@dancesuite.com' },
    update: {},
    create: {
      email: 'instructor@dancesuite.com',
      password: instructorPassword,
      firstName: 'Jane',
      lastName: 'Instructor',
      role: 'INSTRUCTOR'
    }
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@dancesuite.com' },
    update: {},
    create: {
      email: 'student@dancesuite.com',
      password: studentPassword,
      firstName: 'John',
      lastName: 'Student',
      role: 'STUDENT'
    }
  });

  console.log('Users created:', { admin, instructor, student });

  // Create classes
  const balletClass = await prisma.class.create({
    data: {
      name: 'Ballet Basics',
      description: 'Introduction to classical ballet for beginners',
      instructorId: instructor.id,
      maxCapacity: 15,
      schedules: {
        create: [
          {
            dayOfWeek: 1, // Monday
            startTime: '10:00',
            endTime: '11:30'
          },
          {
            dayOfWeek: 3, // Wednesday
            startTime: '10:00',
            endTime: '11:30'
          }
        ]
      }
    }
  });

  const hipHopClass = await prisma.class.create({
    data: {
      name: 'Hip Hop Dance',
      description: 'High-energy hip hop choreography',
      instructorId: instructor.id,
      maxCapacity: 20,
      schedules: {
        create: [
          {
            dayOfWeek: 2, // Tuesday
            startTime: '18:00',
            endTime: '19:30'
          },
          {
            dayOfWeek: 4, // Thursday
            startTime: '18:00',
            endTime: '19:30'
          }
        ]
      }
    }
  });

  const contemporaryClass = await prisma.class.create({
    data: {
      name: 'Contemporary Dance',
      description: 'Modern contemporary dance techniques',
      instructorId: instructor.id,
      maxCapacity: 12,
      schedules: {
        create: [
          {
            dayOfWeek: 5, // Friday
            startTime: '16:00',
            endTime: '17:30'
          }
        ]
      }
    }
  });

  console.log('Classes created:', { balletClass, hipHopClass, contemporaryClass });

  // Create enrollments
  const enrollment1 = await prisma.enrollment.create({
    data: {
      userId: student.id,
      classId: balletClass.id,
      status: 'ACTIVE'
    }
  });

  const enrollment2 = await prisma.enrollment.create({
    data: {
      userId: student.id,
      classId: hipHopClass.id,
      status: 'ACTIVE'
    }
  });

  console.log('Enrollments created:', { enrollment1, enrollment2 });

  // Create payments
  const payment1 = await prisma.payment.create({
    data: {
      userId: student.id,
      amount: 99.99,
      description: 'Monthly subscription - January',
      status: 'COMPLETED',
      paymentDate: new Date()
    }
  });

  const payment2 = await prisma.payment.create({
    data: {
      userId: student.id,
      amount: 99.99,
      description: 'Monthly subscription - February',
      status: 'PENDING'
    }
  });

  console.log('Payments created:', { payment1, payment2 });

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
