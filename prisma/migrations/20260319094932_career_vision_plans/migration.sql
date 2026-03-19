-- CreateTable
CREATE TABLE "CareerVisionPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "roadmap" JSONB NOT NULL,
    "analysis" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerVisionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CareerVisionPlan_userId_idx" ON "CareerVisionPlan"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CareerVisionPlan_userId_role_key" ON "CareerVisionPlan"("userId", "role");

-- AddForeignKey
ALTER TABLE "CareerVisionPlan" ADD CONSTRAINT "CareerVisionPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
