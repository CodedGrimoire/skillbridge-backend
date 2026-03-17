-- CreateEnum
CREATE TYPE "MissingSkillStatus" AS ENUM ('pending', 'in_progress', 'done');

-- CreateTable
CREATE TABLE "CapabilityAnalysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resumeId" TEXT,
    "primaryRole" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "suggestedRoles" JSONB NOT NULL,
    "userSkills" JSONB NOT NULL,
    "missingSkills" JSONB NOT NULL,
    "missingSoftSkills" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CapabilityAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissingSkill" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "MissingSkillStatus" NOT NULL DEFAULT 'pending',
    "analysisId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MissingSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MentorRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeComment" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResumeComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CapabilityAnalysis_userId_idx" ON "CapabilityAnalysis"("userId");

-- CreateIndex
CREATE INDEX "CapabilityAnalysis_resumeId_idx" ON "CapabilityAnalysis"("resumeId");

-- CreateIndex
CREATE INDEX "MissingSkill_userId_idx" ON "MissingSkill"("userId");

-- CreateIndex
CREATE INDEX "MissingSkill_analysisId_idx" ON "MissingSkill"("analysisId");

-- CreateIndex
CREATE INDEX "ResumeComment_resumeId_idx" ON "ResumeComment"("resumeId");

-- CreateIndex
CREATE INDEX "ResumeComment_mentorId_idx" ON "ResumeComment"("mentorId");

-- AddForeignKey
ALTER TABLE "CapabilityAnalysis" ADD CONSTRAINT "CapabilityAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapabilityAnalysis" ADD CONSTRAINT "CapabilityAnalysis_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissingSkill" ADD CONSTRAINT "MissingSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissingSkill" ADD CONSTRAINT "MissingSkill_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "CapabilityAnalysis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorRequest" ADD CONSTRAINT "MentorRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorRequest" ADD CONSTRAINT "MentorRequest_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeComment" ADD CONSTRAINT "ResumeComment_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeComment" ADD CONSTRAINT "ResumeComment_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
