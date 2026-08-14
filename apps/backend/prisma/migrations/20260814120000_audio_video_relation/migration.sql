-- AlterTable
ALTER TABLE "audio" ADD COLUMN "related_video_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "audio_related_video_id_key" ON "audio"("related_video_id");

-- AddForeignKey
ALTER TABLE "audio" ADD CONSTRAINT "audio_related_video_id_fkey" FOREIGN KEY ("related_video_id") REFERENCES "video"("id") ON DELETE SET NULL ON UPDATE CASCADE;
