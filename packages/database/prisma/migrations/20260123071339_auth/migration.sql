-- AlterTable
ALTER TABLE "account" ADD COLUMN     "idToken" TEXT;

-- AlterTable
ALTER TABLE "verification" ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL;
