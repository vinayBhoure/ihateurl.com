-- CreateTable
CREATE TABLE "SavedCollection" (
    "userId" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedCollection_pkey" PRIMARY KEY ("userId","collectionId")
);

-- CreateIndex
CREATE INDEX "SavedCollection_collectionId_idx" ON "SavedCollection"("collectionId");

-- AddForeignKey
ALTER TABLE "SavedCollection" ADD CONSTRAINT "SavedCollection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedCollection" ADD CONSTRAINT "SavedCollection_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
