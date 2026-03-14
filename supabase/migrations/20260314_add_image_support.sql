-- マルチモーダル対応: messagesテーブルにimage_urlカラムを追加
ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Supabase Storage: chat-imagesバケットを作成（公開バケット）
-- ※ Supabaseダッシュボードの Storage > New Bucket から手動で作成してください:
--   バケット名: chat-images
--   Public: ON（公開）
--
-- または以下のSQLをSupabase SQL Editorで実行してください:
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO NOTHING;

-- ストレージポリシー: 誰でもアップロード・閲覧可能（デバイス識別子で管理）
CREATE POLICY "Anyone can upload chat images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-images');

CREATE POLICY "Anyone can view chat images"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-images');
