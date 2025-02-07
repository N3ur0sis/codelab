/*
  Warnings:

  - Added the required column `language` to the `Challenge` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Language" AS ENUM ('C', 'PYTHON', 'JAVA');

-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "language" "Language" NOT NULL;
