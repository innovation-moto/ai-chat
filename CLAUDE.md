# AI Chat - プロジェクト仕様書

## プロジェクト概要

個人利用向けの汎用AIチャットボットアプリケーション。
無料サービスを活用し、コストをかけずにAIチャット機能を実現する。

## 技術スタック

### フロントエンド
- **フレームワーク**: Next.js (App Router)
- **UIライブラリ**: shadcn/ui
- **スタイリング**: Tailwind CSS
- **言語**: TypeScript

### バックエンド
- **API**: Next.js API Routes (Route Handlers)
- **データベース**: Supabase (PostgreSQL)
- **AIモデル**: Google Gemini API (gemini-1.5-flash)

### インフラ
- **ホスティング**: Vercel
- **データベース**: Supabase (無料枠: 500MB, 5万行)

## 機能要件

### 必須機能
- [x] AIとのチャット機能
- [x] ストリーミング応答（リアルタイム表示）
- [x] 会話履歴の保存・表示
- [x] 新規チャットの作成
- [x] 過去のチャット一覧表示・選択

### UI要件
- [x] メッセンジャー風のチャットUI
- [x] 日本語専用のUI設計
- [x] レスポンシブデザイン（モバイル対応）

### 認証
- 認証なし（デバイス単位での履歴管理）
- デバイス識別用のUUIDをlocalStorageに保存

## データベース設計

### テーブル構成

#### `conversations` テーブル
| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | uuid | 主キー |
| device_id | text | デバイス識別子 |
| title | text | 会話タイトル（最初のメッセージから自動生成） |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |

#### `messages` テーブル
| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | uuid | 主キー |
| conversation_id | uuid | 会話ID（外部キー） |
| role | text | 'user' または 'assistant' |
| content | text | メッセージ内容 |
| created_at | timestamp | 作成日時 |

## ディレクトリ構成

```
ai-chat/
├── app/
│   ├── layout.tsx          # ルートレイアウト
│   ├── page.tsx             # メインページ
│   ├── globals.css          # グローバルスタイル
│   └── api/
│       ├── chat/
│       │   └── route.ts     # AIチャットAPI
│       └── conversations/
│           └── route.ts     # 会話CRUD API
├── components/
│   ├── ui/                  # shadcn/uiコンポーネント
│   ├── chat/
│   │   ├── ChatContainer.tsx    # チャットメインコンテナ
│   │   ├── MessageList.tsx      # メッセージ一覧
│   │   ├── MessageBubble.tsx    # メッセージバブル
│   │   ├── ChatInput.tsx        # 入力エリア
│   │   └── ConversationList.tsx # 会話履歴サイドバー
│   └── layout/
│       ├── Header.tsx       # ヘッダー
│       └── Sidebar.tsx      # サイドバー
├── lib/
│   ├── supabase.ts          # Supabaseクライアント
│   ├── gemini.ts            # Google Gemini API
│   └── utils.ts             # ユーティリティ関数
├── hooks/
│   ├── useChat.ts           # チャットロジック
│   ├── useConversations.ts  # 会話管理
│   └── useDeviceId.ts       # デバイスID管理
├── types/
│   └── index.ts             # 型定義
└── public/
    └── ...                  # 静的ファイル
```

## 環境変数

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini API
GOOGLE_API_KEY=your_google_api_key
GOOGLE_MODEL=gemini-1.5-flash
```

## API設計

### POST /api/chat
AIにメッセージを送信し、ストリーミング応答を取得

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "こんにちは" }
  ],
  "conversationId": "uuid"
}
```

**Response:** Server-Sent Events (SSE) でストリーミング

### GET /api/conversations
会話一覧を取得

### POST /api/conversations
新規会話を作成

### GET /api/conversations/[id]
特定の会話とメッセージを取得

### DELETE /api/conversations/[id]
会話を削除

## UI設計方針

### レイアウト
- モバイル: フルスクリーンチャット、ハンバーガーメニューで履歴表示
- デスクトップ: 左サイドバーに履歴、右にチャットエリア

### カラースキーム
- ライトモードをデフォルト
- 将来的にダークモード対応可能な設計

### メッセージバブル
- ユーザー: 右寄せ、プライマリカラー背景
- AI: 左寄せ、グレー背景

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番起動
npm run start

# Lint
npm run lint
```

## セットアップ手順

1. リポジトリをクローン
2. `npm install` で依存関係インストール
3. Supabaseプロジェクトを作成し、テーブルを作成
4. Google AI StudioでAPIキー取得（https://aistudio.google.com/app/apikey）
5. `.env.local` に環境変数を設定
6. `npm run dev` で開発開始

詳細は `docs/SETUP.md` を参照

## 今後の拡張候補

- [ ] ダークモード対応
- [ ] Markdown表示対応
- [ ] コードブロックのシンタックスハイライト
- [ ] 会話のエクスポート機能
- [ ] 複数AIモデルの切り替え
- [ ] 音声入力対応
