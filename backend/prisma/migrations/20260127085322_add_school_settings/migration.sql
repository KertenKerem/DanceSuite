-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "profilePicture" TEXT;

-- CreateTable
CREATE TABLE "school_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "schoolName" TEXT NOT NULL DEFAULT 'DanceSuite',
    "motto" TEXT,
    "logo" TEXT,
    "primaryColor" TEXT DEFAULT '#a855f7',
    "theme" "Theme" NOT NULL DEFAULT 'LIGHT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_settings_pkey" PRIMARY KEY ("id")
);
