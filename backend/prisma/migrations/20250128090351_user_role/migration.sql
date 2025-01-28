/*
  Warnings:

  - Added the required column `user_role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('TEACHER', 'ADMIN', 'STUDENT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "user_role" "UserRole" NOT NULL;
