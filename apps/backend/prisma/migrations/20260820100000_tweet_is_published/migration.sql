-- AlterTable
ALTER TABLE "tweet" ADD COLUMN "is_published" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "idx_tweet_published_at" ON "tweet"("is_published", "published_at" DESC);
