-- CreateEnum
CREATE TYPE "ClassRecurrence" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'BIANNUAL', 'YEARLY');

-- AlterTable
ALTER TABLE "classes" ADD COLUMN     "recurrence" "ClassRecurrence" NOT NULL DEFAULT 'WEEKLY';

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
