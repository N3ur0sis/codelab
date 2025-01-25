/*
  Warnings:

  - You are about to drop the `StageStatus` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StageStatus" DROP CONSTRAINT "StageStatus_stageId_fkey";

-- DropForeignKey
ALTER TABLE "StageStatus" DROP CONSTRAINT "StageStatus_userId_fkey";

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "testValidated" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "StageStatus";
