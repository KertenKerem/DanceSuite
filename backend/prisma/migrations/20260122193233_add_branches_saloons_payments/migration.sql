-- CreateEnum
CREATE TYPE "InstructorPaymentType" AS ENUM ('MONTHLY_SALARY', 'PER_LESSON', 'PERCENTAGE');

-- AlterTable
ALTER TABLE "classes" ADD COLUMN     "branchId" TEXT,
ADD COLUMN     "fee" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "schedules" ADD COLUMN     "saloonId" TEXT;

-- CreateTable
CREATE TABLE "branches" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "operatingStart" TEXT NOT NULL DEFAULT '09:00',
    "operatingEnd" TEXT NOT NULL DEFAULT '23:00',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saloons" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saloons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instructor_payment_configs" (
    "id" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "paymentType" "InstructorPaymentType" NOT NULL,
    "monthlySalary" DOUBLE PRECISION,
    "perLessonRate" DOUBLE PRECISION,
    "percentageRate" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instructor_payment_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "instructor_payment_configs_instructorId_key" ON "instructor_payment_configs"("instructorId");

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_saloonId_fkey" FOREIGN KEY ("saloonId") REFERENCES "saloons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saloons" ADD CONSTRAINT "saloons_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instructor_payment_configs" ADD CONSTRAINT "instructor_payment_configs_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
