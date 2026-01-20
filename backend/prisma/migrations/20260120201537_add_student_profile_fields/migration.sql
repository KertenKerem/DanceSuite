-- AlterTable
ALTER TABLE "users" ADD COLUMN     "address" TEXT,
ADD COLUMN     "birthday" TIMESTAMP(3),
ADD COLUMN     "parentEmail" TEXT,
ADD COLUMN     "parentName" TEXT,
ADD COLUMN     "parentPhone" TEXT,
ADD COLUMN     "phone" TEXT;
