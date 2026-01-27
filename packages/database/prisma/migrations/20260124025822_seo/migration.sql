/*
  Warnings:

  - You are about to drop the column `canonicalUrl` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `isIndexable` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `keywords` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `metaDescription` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `metaTitle` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `ogDescription` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `ogImage` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `ogTitle` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `structuredData` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `ogImage` on the `Website` table. All the data in the column will be lost.
  - You are about to drop the column `robotsTxt` on the `Website` table. All the data in the column will be lost.
  - You are about to drop the column `seoDescription` on the `Website` table. All the data in the column will be lost.
  - You are about to drop the column `seoTitle` on the `Website` table. All the data in the column will be lost.
  - You are about to drop the column `twitterHandle` on the `Website` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TwitterCard" AS ENUM ('summary', 'summary_large_image', 'app', 'player');

-- CreateEnum
CREATE TYPE "RobotsValue" AS ENUM ('index, follow', 'noindex, follow', 'index, nofollow', 'noindex, nofollow');

-- CreateEnum
CREATE TYPE "OgType" AS ENUM ('website', 'article', 'profile', 'book', 'video_movie', 'video_episode');

-- AlterTable
ALTER TABLE "Article" DROP COLUMN "canonicalUrl",
DROP COLUMN "isIndexable",
DROP COLUMN "keywords",
DROP COLUMN "metaDescription",
DROP COLUMN "metaTitle",
DROP COLUMN "ogDescription",
DROP COLUMN "ogImage",
DROP COLUMN "ogTitle",
DROP COLUMN "structuredData";

-- AlterTable
ALTER TABLE "Website" DROP COLUMN "ogImage",
DROP COLUMN "robotsTxt",
DROP COLUMN "seoDescription",
DROP COLUMN "seoTitle",
DROP COLUMN "twitterHandle";

-- CreateTable
CREATE TABLE "article_seo" (
    "id" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "keywords" TEXT[],
    "author" TEXT,
    "language" TEXT DEFAULT 'English',
    "robots" "RobotsValue" NOT NULL DEFAULT 'index, follow',
    "canonicalUrl" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "ogUrl" TEXT,
    "ogSiteName" TEXT,
    "ogType" "OgType" NOT NULL DEFAULT 'article',
    "ogPublishedTime" TIMESTAMP(3),
    "ogAuthor" TEXT,
    "twitterCard" "TwitterCard" NOT NULL DEFAULT 'summary_large_image',
    "twitterTitle" TEXT,
    "twitterDescription" TEXT,
    "twitterImage" TEXT,
    "twitterCreator" TEXT,
    "twitterUrl" TEXT,
    "structuredData" JSONB,
    "articleId" TEXT NOT NULL,

    CONSTRAINT "article_seo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "website_seo" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "keywords" TEXT,
    "author" TEXT,
    "robots" TEXT DEFAULT 'index, follow',
    "canonicalUrl" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "ogUrl" TEXT,
    "ogType" TEXT DEFAULT 'website',
    "twitterCard" TEXT DEFAULT 'summary_large_image',
    "twitterTitle" TEXT,
    "twitterDescription" TEXT,
    "twitterImage" TEXT,
    "twitterHandle" TEXT,
    "websiteId" TEXT NOT NULL,

    CONSTRAINT "website_seo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "article_seo_articleId_key" ON "article_seo"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "website_seo_websiteId_key" ON "website_seo"("websiteId");

-- AddForeignKey
ALTER TABLE "article_seo" ADD CONSTRAINT "article_seo_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "website_seo" ADD CONSTRAINT "website_seo_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;
