import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive seed...\n');

  // Clear existing data (except settings)
  console.log('Clearing existing data...');
  await prisma.attendance.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.class.deleteMany();
  await prisma.instructorPaymentConfig.deleteMany();
  await prisma.saloon.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing data\n');

  // Create password hash
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Admin User
  console.log('Creating admin user...');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@dancesuite.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      phone: '+90 555 100 0001',
      address: 'İstanbul, Turkey'
    }
  });
  console.log(`✅ Created admin: ${admin.email}`);

  // 2. Create Instructors
  console.log('\nCreating instructors...');
  const instructors = await Promise.all([
    prisma.user.create({
      data: {
        email: 'ayse.yilmaz@dancesuite.com',
        password: hashedPassword,
        firstName: 'Ayşe',
        lastName: 'Yılmaz',
        role: 'INSTRUCTOR',
        phone: '+90 555 200 0001',
        address: 'Kadıköy, İstanbul'
      }
    }),
    prisma.user.create({
      data: {
        email: 'mehmet.demir@dancesuite.com',
        password: hashedPassword,
        firstName: 'Mehmet',
        lastName: 'Demir',
        role: 'INSTRUCTOR',
        phone: '+90 555 200 0002',
        address: 'Beşiktaş, İstanbul'
      }
    }),
    prisma.user.create({
      data: {
        email: 'zeynep.kaya@dancesuite.com',
        password: hashedPassword,
        firstName: 'Zeynep',
        lastName: 'Kaya',
        role: 'INSTRUCTOR',
        phone: '+90 555 200 0003',
        address: 'Şişli, İstanbul'
      }
    }),
    prisma.user.create({
      data: {
        email: 'ahmet.celik@dancesuite.com',
        password: hashedPassword,
        firstName: 'Ahmet',
        lastName: 'Çelik',
        role: 'INSTRUCTOR',
        phone: '+90 555 200 0004',
        address: 'Üsküdar, İstanbul'
      }
    })
  ]);
  console.log(`✅ Created ${instructors.length} instructors`);

  // 3. Create Students
  console.log('\nCreating students...');
  const studentData = [
    { firstName: 'Elif', lastName: 'Arslan', email: 'elif.arslan@example.com', age: 22 },
    { firstName: 'Can', lastName: 'Öztürk', email: 'can.ozturk@example.com', age: 19 },
    { firstName: 'Selin', lastName: 'Yıldız', email: 'selin.yildiz@example.com', age: 25 },
    { firstName: 'Deniz', lastName: 'Şahin', email: 'deniz.sahin@example.com', age: 21 },
    { firstName: 'Ece', lastName: 'Aydın', email: 'ece.aydin@example.com', age: 23 },
    { firstName: 'Burak', lastName: 'Koç', email: 'burak.koc@example.com', age: 20 },
    { firstName: 'İrem', lastName: 'Türk', email: 'irem.turk@example.com', age: 24 },
    { firstName: 'Emre', lastName: 'Polat', email: 'emre.polat@example.com', age: 22 },
    { firstName: 'Merve', lastName: 'Güneş', email: 'merve.gunes@example.com', age: 26 },
    { firstName: 'Kaan', lastName: 'Doğan', email: 'kaan.dogan@example.com', age: 18 },
    { firstName: 'Aylin', lastName: 'Eren', email: 'aylin.eren@example.com', age: 21 },
    { firstName: 'Berk', lastName: 'Kurt', email: 'berk.kurt@example.com', age: 23 },
    { firstName: 'Çağla', lastName: 'Acar', email: 'cagla.acar@example.com', age: 20 },
    { firstName: 'Eren', lastName: 'Öz', email: 'eren.oz@example.com', age: 19 },
    { firstName: 'Gizem', lastName: 'Tan', email: 'gizem.tan@example.com', age: 25 },
    { firstName: 'Hakan', lastName: 'Balcı', email: 'hakan.balci@example.com', age: 22 },
    { firstName: 'İpek', lastName: 'Sarı', email: 'ipek.sari@example.com', age: 24 },
    { firstName: 'Kerem', lastName: 'Uzun', email: 'kerem.uzun@example.com', age: 21 },
    { firstName: 'Lale', lastName: 'Keskin', email: 'lale.keskin@example.com', age: 23 },
    { firstName: 'Mert', lastName: 'Aslan', email: 'mert.aslan@example.com', age: 20 }
  ];

  const students = await Promise.all(
    studentData.map((data, index) => {
      const birthYear = new Date().getFullYear() - data.age;
      return prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'STUDENT',
          phone: `+90 555 300 ${String(index + 1).padStart(4, '0')}`,
          address: `İstanbul, Turkey`,
          birthday: new Date(`${birthYear}-06-15`)
        }
      });
    })
  );
  console.log(`✅ Created ${students.length} students`);

  // 4. Create Branches
  console.log('\nCreating branches...');
  const branches = await Promise.all([
    prisma.branch.create({
      data: {
        name: 'Kadıköy Branch',
        address: 'Kadıköy, İstanbul',
        phone: '+90 216 555 1000',
        operatingStart: '09:00',
        operatingEnd: '22:00'
      }
    }),
    prisma.branch.create({
      data: {
        name: 'Beşiktaş Branch',
        address: 'Beşiktaş, İstanbul',
        phone: '+90 212 555 2000',
        operatingStart: '10:00',
        operatingEnd: '21:00'
      }
    })
  ]);
  console.log(`✅ Created ${branches.length} branches`);

  // 5. Create Saloons
  console.log('\nCreating saloons...');
  const saloons = await Promise.all([
    // Kadıköy Branch
    prisma.saloon.create({
      data: {
        name: 'Main Studio A',
        capacity: 25,
        branchId: branches[0].id
      }
    }),
    prisma.saloon.create({
      data: {
        name: 'Studio B',
        capacity: 20,
        branchId: branches[0].id
      }
    }),
    prisma.saloon.create({
      data: {
        name: 'Practice Room',
        capacity: 15,
        branchId: branches[0].id
      }
    }),
    // Beşiktaş Branch
    prisma.saloon.create({
      data: {
        name: 'Grand Studio',
        capacity: 30,
        branchId: branches[1].id
      }
    }),
    prisma.saloon.create({
      data: {
        name: 'Small Studio',
        capacity: 15,
        branchId: branches[1].id
      }
    })
  ]);
  console.log(`✅ Created ${saloons.length} saloons`);

  // 6. Create Instructor Payment Configs
  console.log('\nCreating instructor payment configs...');
  await Promise.all([
    prisma.instructorPaymentConfig.create({
      data: {
        instructorId: instructors[0].id,
        paymentType: 'MONTHLY_SALARY',
        monthlySalary: 15000
      }
    }),
    prisma.instructorPaymentConfig.create({
      data: {
        instructorId: instructors[1].id,
        paymentType: 'PER_LESSON',
        perLessonRate: 500
      }
    }),
    prisma.instructorPaymentConfig.create({
      data: {
        instructorId: instructors[2].id,
        paymentType: 'PERCENTAGE',
        percentageRate: 40
      }
    }),
    prisma.instructorPaymentConfig.create({
      data: {
        instructorId: instructors[3].id,
        paymentType: 'MONTHLY_SALARY',
        monthlySalary: 12000
      }
    })
  ]);
  console.log('✅ Created instructor payment configs');

  // 7. Create Classes
  console.log('\nCreating classes...');
  const classes = await Promise.all([
    // Ballet Classes
    prisma.class.create({
      data: {
        name: 'Ballet Basics',
        description: 'Introduction to classical ballet for beginners',
        instructorId: instructors[0].id,
        branchId: branches[0].id,
        maxCapacity: 20,
        fee: 800,
        recurrence: 'WEEKLY'
      }
    }),
    prisma.class.create({
      data: {
        name: 'Advanced Ballet',
        description: 'Advanced techniques for experienced dancers',
        instructorId: instructors[0].id,
        branchId: branches[0].id,
        maxCapacity: 15,
        fee: 1200,
        recurrence: 'WEEKLY'
      }
    }),
    // Contemporary Dance
    prisma.class.create({
      data: {
        name: 'Contemporary Dance',
        description: 'Modern contemporary dance techniques',
        instructorId: instructors[1].id,
        branchId: branches[0].id,
        maxCapacity: 20,
        fee: 900,
        recurrence: 'WEEKLY'
      }
    }),
    // Hip Hop
    prisma.class.create({
      data: {
        name: 'Hip Hop Fundamentals',
        description: 'Learn basic hip hop moves and choreography',
        instructorId: instructors[2].id,
        branchId: branches[1].id,
        maxCapacity: 25,
        fee: 750,
        recurrence: 'WEEKLY'
      }
    }),
    prisma.class.create({
      data: {
        name: 'Hip Hop Advanced',
        description: 'Advanced hip hop choreography and freestyle',
        instructorId: instructors[2].id,
        branchId: branches[1].id,
        maxCapacity: 20,
        fee: 950,
        recurrence: 'WEEKLY'
      }
    }),
    // Latin Dance
    prisma.class.create({
      data: {
        name: 'Salsa & Bachata',
        description: 'Latin dance styles for couples and singles',
        instructorId: instructors[3].id,
        branchId: branches[1].id,
        maxCapacity: 20,
        fee: 850,
        recurrence: 'WEEKLY'
      }
    }),
    // Jazz
    prisma.class.create({
      data: {
        name: 'Jazz Dance',
        description: 'Energetic jazz dance techniques',
        instructorId: instructors[1].id,
        branchId: branches[0].id,
        maxCapacity: 18,
        fee: 800,
        recurrence: 'WEEKLY'
      }
    }),
    // Kids Class
    prisma.class.create({
      data: {
        name: 'Kids Dance Workshop',
        description: 'Fun dance class for children',
        instructorId: instructors[0].id,
        branchId: branches[0].id,
        maxCapacity: 15,
        fee: 600,
        recurrence: 'WEEKLY'
      }
    })
  ]);
  console.log(`✅ Created ${classes.length} classes`);

  // 8. Create Schedules for Classes
  console.log('\nCreating class schedules...');
  const schedules = await Promise.all([
    // Ballet Basics - Monday & Thursday (Main Studio A)
    prisma.schedule.create({
      data: {
        classId: classes[0].id,
        saloonId: saloons[0].id,
        dayOfWeek: 1, // Monday
        startTime: '18:00',
        endTime: '19:30'
      }
    }),
    prisma.schedule.create({
      data: {
        classId: classes[0].id,
        saloonId: saloons[0].id,
        dayOfWeek: 4, // Thursday
        startTime: '18:00',
        endTime: '19:30'
      }
    }),
    // Advanced Ballet - Tuesday & Friday (Main Studio A)
    prisma.schedule.create({
      data: {
        classId: classes[1].id,
        saloonId: saloons[0].id,
        dayOfWeek: 2,
        startTime: '19:00',
        endTime: '20:30'
      }
    }),
    prisma.schedule.create({
      data: {
        classId: classes[1].id,
        saloonId: saloons[0].id,
        dayOfWeek: 5,
        startTime: '19:00',
        endTime: '20:30'
      }
    }),
    // Contemporary - Monday & Wednesday (Studio B)
    prisma.schedule.create({
      data: {
        classId: classes[2].id,
        saloonId: saloons[1].id,
        dayOfWeek: 1,
        startTime: '20:00',
        endTime: '21:30'
      }
    }),
    prisma.schedule.create({
      data: {
        classId: classes[2].id,
        saloonId: saloons[1].id,
        dayOfWeek: 3,
        startTime: '20:00',
        endTime: '21:30'
      }
    }),
    // Hip Hop Fundamentals - Tuesday & Thursday (Grand Studio)
    prisma.schedule.create({
      data: {
        classId: classes[3].id,
        saloonId: saloons[3].id,
        dayOfWeek: 2,
        startTime: '17:00',
        endTime: '18:30'
      }
    }),
    prisma.schedule.create({
      data: {
        classId: classes[3].id,
        saloonId: saloons[3].id,
        dayOfWeek: 4,
        startTime: '17:00',
        endTime: '18:30'
      }
    }),
    // Hip Hop Advanced - Wednesday & Friday (Grand Studio)
    prisma.schedule.create({
      data: {
        classId: classes[4].id,
        saloonId: saloons[3].id,
        dayOfWeek: 3,
        startTime: '19:00',
        endTime: '20:30'
      }
    }),
    prisma.schedule.create({
      data: {
        classId: classes[4].id,
        saloonId: saloons[3].id,
        dayOfWeek: 5,
        startTime: '19:00',
        endTime: '20:30'
      }
    }),
    // Salsa & Bachata - Saturday (Small Studio)
    prisma.schedule.create({
      data: {
        classId: classes[5].id,
        saloonId: saloons[4].id,
        dayOfWeek: 6,
        startTime: '15:00',
        endTime: '17:00'
      }
    }),
    // Jazz - Monday & Wednesday (Practice Room)
    prisma.schedule.create({
      data: {
        classId: classes[6].id,
        saloonId: saloons[2].id,
        dayOfWeek: 1,
        startTime: '17:00',
        endTime: '18:30'
      }
    }),
    prisma.schedule.create({
      data: {
        classId: classes[6].id,
        saloonId: saloons[2].id,
        dayOfWeek: 3,
        startTime: '17:00',
        endTime: '18:30'
      }
    }),
    // Kids Workshop - Saturday & Sunday (Practice Room)
    prisma.schedule.create({
      data: {
        classId: classes[7].id,
        saloonId: saloons[2].id,
        dayOfWeek: 6,
        startTime: '10:00',
        endTime: '11:00'
      }
    }),
    prisma.schedule.create({
      data: {
        classId: classes[7].id,
        saloonId: saloons[2].id,
        dayOfWeek: 0, // Sunday
        startTime: '10:00',
        endTime: '11:00'
      }
    })
  ]);
  console.log(`✅ Created ${schedules.length} schedules`);

  // 9. Create Enrollments (distribute students among classes)
  console.log('\nCreating enrollments...');
  const enrollments = [];

  // Enroll 8-12 students per class
  for (let i = 0; i < classes.length; i++) {
    const numStudents = 8 + Math.floor(Math.random() * 5);
    const classStudents = students.slice(i * 3, i * 3 + numStudents);

    for (const student of classStudents) {
      const daysAgo = Math.floor(Math.random() * 60);
      const enrollmentDate = new Date();
      enrollmentDate.setDate(enrollmentDate.getDate() - daysAgo);

      const enrollment = await prisma.enrollment.create({
        data: {
          userId: student.id,
          classId: classes[i].id,
          status: 'ACTIVE',
          createdAt: enrollmentDate
        }
      });
      enrollments.push(enrollment);
    }
  }
  console.log(`✅ Created ${enrollments.length} enrollments`);

  // 10. Create Payments
  console.log('\nCreating payments...');
  let paymentCount = 0;
  for (const enrollment of enrollments) {
    // Create 2-4 payments per enrollment
    const numPayments = 2 + Math.floor(Math.random() * 3);

    for (let i = 0; i < numPayments; i++) {
      const daysAgo = 30 * i + Math.floor(Math.random() * 20);
      const paymentDate = new Date();
      paymentDate.setDate(paymentDate.getDate() - daysAgo);

      const classInfo = classes.find(c => c.id === enrollment.classId);
      const statuses = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'PENDING'];

      await prisma.payment.create({
        data: {
          userId: enrollment.userId,
          amount: classInfo.fee,
          description: `Payment for ${classInfo.name}`,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          paymentDate: paymentDate
        }
      });
      paymentCount++;
    }
  }
  console.log(`✅ Created ${paymentCount} payments`);

  // 11. Create Attendance Records
  console.log('\nCreating attendance records...');
  let attendanceCount = 0;

  // Create attendance for the last 4 weeks
  for (let weekAgo = 0; weekAgo < 4; weekAgo++) {
    for (const classItem of classes) {
      const classEnrollments = enrollments.filter(e => e.classId === classItem.id);
      const classSchedules = schedules.filter(s => s.classId === classItem.id);

      for (const schedule of classSchedules) {
        const attendanceDate = new Date();
        attendanceDate.setDate(attendanceDate.getDate() - (weekAgo * 7));

        // Adjust to the correct day of week
        const currentDay = attendanceDate.getDay();
        const targetDay = schedule.dayOfWeek;
        const dayDiff = targetDay - currentDay;
        attendanceDate.setDate(attendanceDate.getDate() + dayDiff);

        for (const enrollment of classEnrollments) {
          // 80% attendance rate
          const statuses = ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'ABSENT'];

          await prisma.attendance.create({
            data: {
              enrollmentId: enrollment.id,
              date: attendanceDate,
              status: statuses[Math.floor(Math.random() * statuses.length)]
            }
          });
          attendanceCount++;
        }
      }
    }
  }
  console.log(`✅ Created ${attendanceCount} attendance records`);

  // 12. Create Expenses
  console.log('\nCreating expenses...');
  const expenseCategories = [
    { category: 'RENT', vendor: 'Property Management', description: 'Monthly rent payment', amount: 25000 },
    { category: 'UTILITIES', vendor: 'Electric Company', description: 'Electricity bill', amount: 3500 },
    { category: 'UTILITIES', vendor: 'Water Company', description: 'Water and sewage', amount: 800 },
    { category: 'SALARIES', vendor: 'Staff Salaries', description: 'Monthly staff salaries', amount: 45000 },
    { category: 'EQUIPMENT', vendor: 'Dance Equipment Store', description: 'Dance equipment and mirrors', amount: 8000 },
    { category: 'MARKETING', vendor: 'Social Media Ads', description: 'Facebook and Instagram ads', amount: 4000 },
    { category: 'SUPPLIES', vendor: 'Office Supplies', description: 'Office and administrative supplies', amount: 1500 },
    { category: 'MAINTENANCE', vendor: 'Cleaning Service', description: 'Studio cleaning and maintenance', amount: 3000 },
    { category: 'INSURANCE', vendor: 'Insurance Company', description: 'Business liability insurance', amount: 5000 }
  ];

  let expenseCount = 0;
  // Create expenses for last 3 months
  for (let month = 0; month < 3; month++) {
    for (const expenseData of expenseCategories) {
      const expenseDate = new Date();
      expenseDate.setMonth(expenseDate.getMonth() - month);
      expenseDate.setDate(5); // 5th of each month

      await prisma.expense.create({
        data: {
          category: expenseData.category,
          description: expenseData.description,
          amount: expenseData.amount + Math.floor(Math.random() * 1000),
          vendor: expenseData.vendor,
          date: expenseDate
        }
      });
      expenseCount++;
    }
  }
  console.log(`✅ Created ${expenseCount} expenses`);

  console.log('\n🎉 Seed completed successfully!\n');

  // Print summary
  console.log('📊 Summary:');
  console.log(`   Users: 1 admin + ${instructors.length} instructors + ${students.length} students = ${1 + instructors.length + students.length} total`);
  console.log(`   Branches: ${branches.length}`);
  console.log(`   Saloons: ${saloons.length}`);
  console.log(`   Classes: ${classes.length}`);
  console.log(`   Schedules: ${schedules.length}`);
  console.log(`   Enrollments: ${enrollments.length}`);
  console.log(`   Payments: ${paymentCount}`);
  console.log(`   Attendance Records: ${attendanceCount}`);
  console.log(`   Expenses: ${expenseCount}`);
  console.log('\n📧 Login Credentials:');
  console.log('   Admin: admin@dancesuite.com / password123');
  console.log('   Instructors: [email] / password123');
  console.log('   Students: [email] / password123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error during seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
