/*
  Warnings:

  - You are about to drop the column `skills` on the `Job` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Job" DROP COLUMN "skills",
ADD COLUMN     "sourceUrl" TEXT;
