-- CreateEnum
CREATE TYPE "WebsiteStatus" AS ENUM ('PUBLISHED', 'DRAFT', 'MAINTENANCE');

-- AlterTable
ALTER TABLE "Website" ADD COLUMN     "status" "WebsiteStatus" NOT NULL DEFAULT 'DRAFT';
