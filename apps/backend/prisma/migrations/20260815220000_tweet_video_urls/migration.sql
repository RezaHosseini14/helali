-- AlterTable
ALTER TABLE "tweet" ADD COLUMN "video_urls" TEXT[] DEFAULT ARRAY[]::TEXT[];
