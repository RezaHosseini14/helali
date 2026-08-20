-- CreateTable
CREATE TABLE "tweet" (
    "id" SERIAL NOT NULL,
    "external_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "published_at" TIMESTAMP(3) NOT NULL,
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tweet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tweet_external_id_key" ON "tweet"("external_id");

-- CreateIndex
CREATE INDEX "idx_tweet_username_published" ON "tweet"("username", "published_at" DESC);
