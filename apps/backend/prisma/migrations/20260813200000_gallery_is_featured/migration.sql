-- AlterTable
ALTER TABLE "public"."gallery" ADD COLUMN "is_featured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "idx_gallery_is_featured" ON "public"."gallery"("is_featured");
