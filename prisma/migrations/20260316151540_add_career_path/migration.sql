-- CreateTable
CREATE TABLE "CareerPath" (
    "id" TEXT NOT NULL,
    "fromRoleId" TEXT NOT NULL,
    "toRoleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareerPath_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CareerPath_fromRoleId_idx" ON "CareerPath"("fromRoleId");

-- CreateIndex
CREATE INDEX "CareerPath_toRoleId_idx" ON "CareerPath"("toRoleId");

-- AddForeignKey
ALTER TABLE "CareerPath" ADD CONSTRAINT "CareerPath_fromRoleId_fkey" FOREIGN KEY ("fromRoleId") REFERENCES "JobRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerPath" ADD CONSTRAINT "CareerPath_toRoleId_fkey" FOREIGN KEY ("toRoleId") REFERENCES "JobRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
