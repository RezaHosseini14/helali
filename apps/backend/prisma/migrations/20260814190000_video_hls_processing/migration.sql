-- CreateEnum
CREATE TYPE "VideoProcessingStatus" AS ENUM ('pending', 'processing', 'ready', 'failed');

-- AlterTable
ALTER TABLE "video" ADD COLUMN "processing_status" "VideoProcessingStatus" NOT NULL DEFAULT 'ready';
ALTER TABLE "video" ADD COLUMN "hls_master_key" TEXT;
ALTER TABLE "video" ADD COLUMN "hls_prefix" TEXT;
ALTER TABLE "video" ADD COLUMN "duration_sec" DOUBLE PRECISION;
ALTER TABLE "video" ADD COLUMN "processing_error" TEXT;
ALTER TABLE "video" ADD COLUMN "processed_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "idx_video_processing_status" ON "video"("processing_status");
