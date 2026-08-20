-- AlterTable
ALTER TABLE "tweet" ADD COLUMN "image_urls" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "tweet" ADD COLUMN "video_poster_urls" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "tweet" ADD COLUMN "has_video" BOOLEAN NOT NULL DEFAULT false;
