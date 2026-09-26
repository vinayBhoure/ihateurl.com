-- AlterTable
ALTER TABLE "Collection" ALTER COLUMN "publicId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Collection_publicId_key" ON "Collection"("publicId");
