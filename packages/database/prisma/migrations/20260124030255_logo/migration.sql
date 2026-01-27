/*
  Warnings:

  - You are about to drop the column `logo` on the `Website` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Website" DROP COLUMN "logo",
ADD COLUMN     "logoRectangle" TEXT,
ADD COLUMN     "logoSquare" TEXT;
