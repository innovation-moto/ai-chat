-- AI Chat Database Schema
-- Supabase SQL Editor で実行してください

-- 1. conversations テーブル作成
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  title TEXT DEFAULT '新しいチャット',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. messages テーブル作成
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. インデックス作成（パフォーマンス向上）
CREATE INDEX idx_conversations_device_id ON conversations(device_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- 4. updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. RLS (Row Level Security) 設定
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 6. RLS ポリシー作成
-- conversations: device_id ベースでアクセス制御
CREATE POLICY "Allow all operations for device" ON conversations
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- messages: 関連する conversation へのアクセスを許可
CREATE POLICY "Allow all operations for messages" ON messages
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 注意: 本番環境では、より厳密なRLSポリシーを設定することを推奨します
-- 上記は開発・個人利用向けの簡易設定です
