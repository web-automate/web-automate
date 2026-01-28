-- CreateEnum
CREATE TYPE "BuildTypeWebsitePayload" AS ENUM ('INIT_WEBSITE', 'BUILD_WEBSITE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "WebsiteStatus" ADD VALUE 'READY';
ALTER TYPE "WebsiteStatus" ADD VALUE 'BUILDING';
ALTER TYPE "WebsiteStatus" ADD VALUE 'FAILED';
ALTER TYPE "WebsiteStatus" ADD VALUE 'SUCCESS';

-- CreateTable
CREATE TABLE "website_logs" (
    "id" TEXT NOT NULL,
    "status" "WebsiteStatus" NOT NULL,
    "message" TEXT NOT NULL,
    "details" TEXT,
    "websiteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "website_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "website_logs_websiteId_idx" ON "website_logs"("websiteId");

-- AddForeignKey
ALTER TABLE "website_logs" ADD CONSTRAINT "website_logs_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;
