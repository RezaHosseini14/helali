-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_audio_created_at" ON "public"."audio"("created_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_video_created_at" ON "public"."video"("created_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_gallery_created_at" ON "public"."gallery"("created_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_audio_comments_audio_status" ON "public"."audio_comments"("audio_id", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_gallery_comments_gallery_status" ON "public"."gallery_comments"("gallery_id", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_video_comments_video_status" ON "public"."video_comments"("video_id", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_category_title" ON "public"."category"("title");
