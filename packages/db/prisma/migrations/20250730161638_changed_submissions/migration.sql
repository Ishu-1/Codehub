/*
  Warnings:

  - You are about to drop the column `compileOutput` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `memory` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `stderr` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `stdout` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `Submission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "compileOutput",
DROP COLUMN "memory",
DROP COLUMN "message",
DROP COLUMN "stderr",
DROP COLUMN "stdout",
DROP COLUMN "time";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "username" SET DEFAULT 'anonymous_username';

-- AlterTable
ALTER TABLE "submissionTestCaseResults" ADD COLUMN     "compileOutput" TEXT,
ADD COLUMN     "memory" INTEGER,
ADD COLUMN     "message" TEXT,
ADD COLUMN     "statusDescription" TEXT,
ADD COLUMN     "statusId" INTEGER,
ADD COLUMN     "stderr" TEXT,
ADD COLUMN     "stdout" TEXT,
ADD COLUMN     "time" TEXT;
