/*
  Warnings:

  - The primary key for the `Analysis` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `gapSummary` on the `Analysis` table. All the data in the column will be lost.
  - You are about to drop the column `recommendations` on the `Analysis` table. All the data in the column will be lost.
  - The primary key for the `JobRole` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `LearningResource` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `analysisId` on the `LearningResource` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `LearningResource` table. All the data in the column will be lost.
  - The primary key for the `Resume` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `filename` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `mimetype` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `path` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `Resume` table. All the data in the column will be lost.
  - The primary key for the `RoleSkill` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `weight` on the `RoleSkill` table. All the data in the column will be lost.
  - The primary key for the `Skill` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `description` on the `Skill` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserSkill` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `level` on the `UserSkill` table. All the data in the column will be lost.
  - Added the required column `skillId` to the `LearningResource` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileName` to the `Resume` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileUrl` to the `Resume` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- DropForeignKey
ALTER TABLE "Analysis" DROP CONSTRAINT "Analysis_resumeId_fkey";

-- DropForeignKey
ALTER TABLE "Analysis" DROP CONSTRAINT "Analysis_roleId_fkey";

-- DropForeignKey
ALTER TABLE "Analysis" DROP CONSTRAINT "Analysis_userId_fkey";

-- DropForeignKey
ALTER TABLE "LearningResource" DROP CONSTRAINT "LearningResource_analysisId_fkey";

-- DropForeignKey
ALTER TABLE "Resume" DROP CONSTRAINT "Resume_userId_fkey";

-- DropForeignKey
ALTER TABLE "RoleSkill" DROP CONSTRAINT "RoleSkill_roleId_fkey";

-- DropForeignKey
ALTER TABLE "RoleSkill" DROP CONSTRAINT "RoleSkill_skillId_fkey";

-- DropForeignKey
ALTER TABLE "UserSkill" DROP CONSTRAINT "UserSkill_skillId_fkey";

-- DropForeignKey
ALTER TABLE "UserSkill" DROP CONSTRAINT "UserSkill_userId_fkey";

-- AlterTable
ALTER TABLE "Analysis" DROP CONSTRAINT "Analysis_pkey",
DROP COLUMN "gapSummary",
DROP COLUMN "recommendations",
ADD COLUMN     "aiRecommendations" TEXT,
ADD COLUMN     "matchScore" DOUBLE PRECISION,
ADD COLUMN     "matchedSkills" JSONB,
ADD COLUMN     "missingSkills" JSONB,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "resumeId" SET DATA TYPE TEXT,
ALTER COLUMN "roleId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Analysis_id_seq";

-- AlterTable
ALTER TABLE "JobRole" DROP CONSTRAINT "JobRole_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "JobRole_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "JobRole_id_seq";

-- AlterTable
ALTER TABLE "LearningResource" DROP CONSTRAINT "LearningResource_pkey",
DROP COLUMN "analysisId",
DROP COLUMN "provider",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "skillId" TEXT NOT NULL,
ADD COLUMN     "type" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "LearningResource_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "LearningResource_id_seq";

-- AlterTable
ALTER TABLE "Resume" DROP CONSTRAINT "Resume_pkey",
DROP COLUMN "filename",
DROP COLUMN "mimetype",
DROP COLUMN "path",
DROP COLUMN "text",
ADD COLUMN     "extractedText" TEXT,
ADD COLUMN     "fileName" TEXT NOT NULL,
ADD COLUMN     "fileUrl" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Resume_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Resume_id_seq";

-- AlterTable
ALTER TABLE "RoleSkill" DROP CONSTRAINT "RoleSkill_pkey",
DROP COLUMN "weight",
ADD COLUMN     "importanceLevel" INTEGER,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "roleId" SET DATA TYPE TEXT,
ALTER COLUMN "skillId" SET DATA TYPE TEXT,
ADD CONSTRAINT "RoleSkill_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "RoleSkill_id_seq";

-- AlterTable
ALTER TABLE "Skill" DROP CONSTRAINT "Skill_pkey",
DROP COLUMN "description",
ADD COLUMN     "category" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Skill_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Skill_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AlterTable
ALTER TABLE "UserSkill" DROP CONSTRAINT "UserSkill_pkey",
DROP COLUMN "level",
ADD COLUMN     "confidenceScore" DOUBLE PRECISION,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "skillId" SET DATA TYPE TEXT,
ADD CONSTRAINT "UserSkill_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "UserSkill_id_seq";

-- CreateIndex
CREATE INDEX "Analysis_userId_idx" ON "Analysis"("userId");

-- CreateIndex
CREATE INDEX "Analysis_resumeId_idx" ON "Analysis"("resumeId");

-- CreateIndex
CREATE INDEX "Analysis_roleId_idx" ON "Analysis"("roleId");

-- CreateIndex
CREATE INDEX "LearningResource_skillId_idx" ON "LearningResource"("skillId");

-- CreateIndex
CREATE INDEX "Resume_userId_idx" ON "Resume"("userId");

-- CreateIndex
CREATE INDEX "RoleSkill_skillId_idx" ON "RoleSkill"("skillId");

-- CreateIndex
CREATE INDEX "UserSkill_skillId_idx" ON "UserSkill"("skillId");

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkill" ADD CONSTRAINT "UserSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkill" ADD CONSTRAINT "UserSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleSkill" ADD CONSTRAINT "RoleSkill_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "JobRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleSkill" ADD CONSTRAINT "RoleSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "JobRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningResource" ADD CONSTRAINT "LearningResource_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
