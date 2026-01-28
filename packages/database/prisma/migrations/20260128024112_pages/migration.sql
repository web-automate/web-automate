-- CreateTable
CREATE TABLE "StaticPage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaticPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaticPageSeo" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "keywords" TEXT,
    "ogImage" TEXT,
    "canonicalUrl" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "staticPageId" TEXT NOT NULL,

    CONSTRAINT "StaticPageSeo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StaticPage_websiteId_idx" ON "StaticPage"("websiteId");

-- CreateIndex
CREATE UNIQUE INDEX "StaticPage_websiteId_slug_key" ON "StaticPage"("websiteId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "StaticPageSeo_staticPageId_key" ON "StaticPageSeo"("staticPageId");

-- AddForeignKey
ALTER TABLE "StaticPage" ADD CONSTRAINT "StaticPage_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaticPageSeo" ADD CONSTRAINT "StaticPageSeo_staticPageId_fkey" FOREIGN KEY ("staticPageId") REFERENCES "StaticPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
