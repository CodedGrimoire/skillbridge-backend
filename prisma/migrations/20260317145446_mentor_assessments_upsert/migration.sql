-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('pending', 'confirmed', 'cancelled');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "githubUrl" TEXT,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "portfolioUrl" TEXT,
ADD COLUMN     "resumeUrl" TEXT;

-- CreateTable
CREATE TABLE "MentorAssessment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "resumeRating" INTEGER,
    "linkedinRating" INTEGER,
    "githubRating" INTEGER,
    "portfolioRating" INTEGER,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MentorAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorMeeting" (
    "id" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "menteeId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "meetLink" TEXT NOT NULL,
    "note" TEXT,
    "status" "MeetingStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MentorMeeting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MentorAssessment_userId_idx" ON "MentorAssessment"("userId");

-- CreateIndex
CREATE INDEX "MentorAssessment_mentorId_idx" ON "MentorAssessment"("mentorId");

-- CreateIndex
CREATE UNIQUE INDEX "MentorAssessment_mentorId_userId_key" ON "MentorAssessment"("mentorId", "userId");

-- CreateIndex
CREATE INDEX "MentorMeeting_mentorId_idx" ON "MentorMeeting"("mentorId");

-- CreateIndex
CREATE INDEX "MentorMeeting_menteeId_idx" ON "MentorMeeting"("menteeId");

-- AddForeignKey
ALTER TABLE "MentorAssessment" ADD CONSTRAINT "MentorAssessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorAssessment" ADD CONSTRAINT "MentorAssessment_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorMeeting" ADD CONSTRAINT "MentorMeeting_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorMeeting" ADD CONSTRAINT "MentorMeeting_menteeId_fkey" FOREIGN KEY ("menteeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
