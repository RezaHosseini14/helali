-- CreateTable
CREATE TABLE "tweet_profile" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "avatar_url" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tweet_profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tweet_profile_username_key" ON "tweet_profile"("username");
