-- CreateTable
CREATE TABLE "_AuthorToWebsite" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AuthorToWebsite_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AuthorToWebsite_B_index" ON "_AuthorToWebsite"("B");

-- AddForeignKey
ALTER TABLE "_AuthorToWebsite" ADD CONSTRAINT "_AuthorToWebsite_A_fkey" FOREIGN KEY ("A") REFERENCES "author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AuthorToWebsite" ADD CONSTRAINT "_AuthorToWebsite_B_fkey" FOREIGN KEY ("B") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;
