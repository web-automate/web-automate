/*
  Warnings:

  - Added the required column `category` to the `Article` table without a default value. This is not possible if the table is not empty.
  - Added the required column `keywords` to the `Article` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topic` to the `Article` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "ArticleStatus" ADD VALUE 'BUILDING';

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "keywords" TEXT NOT NULL,
ADD COLUMN     "subCategory" TEXT,
ADD COLUMN     "topic" TEXT NOT NULL,
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "slug" DROP NOT NULL,
ALTER COLUMN "content" DROP NOT NULL;
