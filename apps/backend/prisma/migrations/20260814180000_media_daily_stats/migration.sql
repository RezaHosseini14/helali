-- CreateTable
CREATE TABLE "media_daily_stats" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_daily_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_media_daily_stats_date" ON "media_daily_stats"("date");

-- CreateIndex
CREATE INDEX "idx_media_daily_stats_type_date" ON "media_daily_stats"("entity_type", "date");

-- CreateIndex
CREATE UNIQUE INDEX "uq_media_daily_stats_entity_date" ON "media_daily_stats"("entity_type", "entity_id", "date");
