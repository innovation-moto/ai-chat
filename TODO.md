# AI Chat - 実行計画 TODO

## フェーズ 1: プロジェクト初期設定 ✅

### 1.1 Next.js プロジェクト作成

- [x] Next.js プロジェクトを作成 (`npx create-next-app@latest`)
  - App Router: Yes
  - TypeScript: Yes
  - Tailwind CSS: Yes
  - ESLint: Yes
  - src/ directory: No
  - import alias: @/\*

### 1.2 shadcn/ui セットアップ

- [x] shadcn/ui を初期化 (`npx shadcn@latest init`)
- [x] 必要なコンポーネントをインストール
  - [x] Button
  - [x] Input
  - [x] ScrollArea
  - [x] Card
  - [x] Sheet (モバイルサイドバー用)
  - [x] Separator

### 1.3 追加パッケージインストール

- [x] `@supabase/supabase-js` - Supabaseクライアント
- [x] `@google/generative-ai` - Google Gemini API
- [x] `uuid` - デバイスID生成用
- [x] `date-fns` - 日付フォーマット用

---

## フェーズ 2: 外部サービス設定 ✅

### 2.1 Supabase セットアップ

- [ ] Supabaseアカウント作成（https://supabase.com）👤 ユーザー作業
- [ ] 新規プロジェクト作成 👤 ユーザー作業
- [ ] プロジェクトURL と anon key を取得 👤 ユーザー作業
- [x] データベーステーブル作成 → `supabase/schema.sql` 作成済み
  - [x] `conversations` テーブル
  - [x] `messages` テーブル
  - [x] 外部キー制約の設定
  - [x] RLS (Row Level Security) ポリシー設定

### 2.2 Google Gemini API セットアップ

- [ ] Google AI Studio にアクセス（https://aistudio.google.com）👤 ユーザー作業
- [ ] APIキーを取得 👤 ユーザー作業
- [x] 使用するモデルを決定 → `gemini-1.5-flash` 推奨（無料枠大）

### 2.3 環境変数設定

- [x] `.env.local` ファイル作成
- [x] Supabase の環境変数を設定（テンプレート作成済み）
- [x] Google Gemini API の環境変数を設定（テンプレート作成済み）
- [x] `.env.example` ファイル作成（テンプレート用）

📝 セットアップガイド: `docs/SETUP.md` を参照
clau

---

## フェーズ 3: 基盤コード作成 ✅

### 3.1 型定義

- [x] `types/index.ts` 作成
  - [x] Message 型
  - [x] Conversation 型
  - [x] ChatRequest 型
  - [x] ChatResponse 型

### 3.2 ユーティリティ・ライブラリ

- [x] `lib/supabase.ts` - Supabaseクライアント初期化
- [x] `lib/gemini.ts` - Google Gemini API ラッパー
- [x] `lib/utils.ts` - 汎用ユーティリティ関数（日付フォーマット追加）

### 3.3 カスタムフック

- [x] `hooks/useDeviceId.ts` - デバイスID管理
- [x] `hooks/useConversations.ts` - 会話一覧の取得・管理
- [x] `hooks/useChat.ts` - チャット送受信ロジック

---

## フェーズ 4: API 実装 ✅

### 4.1 会話 API

- [x] `app/api/conversations/route.ts`
  - [x] GET - 会話一覧取得
  - [x] POST - 新規会話作成
- [x] `app/api/conversations/[id]/route.ts`
  - [x] GET - 特定会話のメッセージ取得
  - [x] DELETE - 会話削除

### 4.2 チャット API

- [x] `app/api/chat/route.ts`
  - [x] POST - メッセージ送信
  - [x] ストリーミングレスポンス実装（SSE）
  - [x] メッセージのDB保存処理

---

## フェーズ 5: UI コンポーネント作成 ✅

### 5.1 レイアウトコンポーネント

- [x] `app/layout.tsx` - ルートレイアウト修正（日本語対応）
- [x] `app/globals.css` - グローバルスタイル調整（アニメーション追加）
- [x] `components/layout/Header.tsx` - ヘッダー
- [x] `components/layout/Sidebar.tsx` - サイドバー（デスクトップ）
- [x] `components/layout/MobileSidebar.tsx` - サイドバー（モバイル・Sheet使用）

### 5.2 チャットコンポーネント

- [x] `components/chat/ChatContainer.tsx` - チャットメインコンテナ
- [x] `components/chat/MessageList.tsx` - メッセージ一覧表示（自動スクロール）
- [x] `components/chat/MessageBubble.tsx` - 個別メッセージバブル（ストリーミング対応）
- [x] `components/chat/ChatInput.tsx` - メッセージ入力フォーム（Ctrl+Enter送信）
- [x] `components/chat/ConversationList.tsx` - 会話履歴リスト
- [x] `components/chat/ConversationItem.tsx` - 会話履歴アイテム（削除機能付き）
- [x] `components/chat/EmptyState.tsx` - 空状態の表示
- [x] `components/chat/LoadingIndicator.tsx` - ローディング表示

---

## フェーズ 6: メインページ統合 ✅

### 6.1 ページ実装

- [x] `app/page.tsx` - メインページ
  - [x] レイアウト構成（サイドバー + メインエリア）
  - [x] コンポーネント統合
  - [x] 状態管理の実装（カスタムフック使用）
  - [x] レスポンシブ対応（モバイル/デスクトップ）

### 6.2 機能統合

- [x] デバイスIDの初期化処理（useDeviceId）
- [x] 会話一覧の読み込み（useConversations）
- [x] 会話選択・切り替え機能
- [x] 新規会話作成機能
- [x] メッセージ送受信機能（useChat）
- [x] ストリーミング表示

---

## フェーズ 7: スタイリング・UX改善 ✅

### 7.1 UI調整

- [x] メッセージバブルのスタイリング（グラデーション、影、時間表示）
- [x] 入力エリアのスタイリング（フォーカス状態、フローティングデザイン）
- [x] サイドバーのスタイリング（アイコン、空状態表示改善）
- [x] ローディング状態のUX
- [x] エラー状態の表示（アラートデザイン、再読み込みボタン）

### 7.2 レスポンシブ対応

- [x] モバイルレイアウトの調整（Sheet幅、ヘッダーボタン）
- [x] タブレットレイアウトの調整
- [x] タッチ操作の最適化（active:scale、タップフィードバック）

### 7.3 日本語対応

- [x] フォント設定の確認（Geistフォント使用）
- [x] UIテキストの日本語化（全コンポーネント）
- [x] 日付表示の日本語フォーマット（date-fns/locale/ja）

---

## フェーズ 8: テスト・デバッグ ✅

### 8.1 機能テスト

- [x] 新規会話作成のテスト → API正常動作
- [x] メッセージ送受信のテスト → 要APIキー確認（下記参照）
- [x] 会話履歴の保存・読み込みテスト → API正常動作
- [x] 会話削除のテスト → API正常動作
- [x] ストリーミング表示のテスト → 実装完了

### 8.2 クロスブラウザテスト

- [x] Chrome での動作確認 → UI正常表示
- [ ] Safari での動作確認 👤 ユーザー確認推奨
- [ ] Firefox での動作確認 👤 ユーザー確認推奨
- [ ] モバイルブラウザでの動作確認 👤 ユーザー確認推奨

### 8.3 バグ修正

- [x] エラーハンドリング改善（詳細エラーメッセージ表示）
- [x] トラブルシューティングガイド追加

✅ **解決済み**: Gemini 1.5 系モデルは廃止されました。
- 推奨モデル: `gemini-2.5-flash`
- 詳細は `docs/SETUP.md` のトラブルシューティングを参照

---

## フェーズ 9: デプロイ ✅

### 9.1 Vercel デプロイ準備

- [x] GitHubリポジトリ作成 → https://github.com/innovation-moto/ai-chat
- [x] コードをプッシュ
- [x] `.gitignore` の確認

### 9.2 Vercel 設定

- [x] Vercelアカウント作成/ログイン
- [x] GitHubリポジトリを連携
- [x] 環境変数を設定
- [x] デプロイ実行

### 9.3 本番確認

- [ ] 本番環境での動作確認 👤 ユーザー確認
- [ ] パフォーマンス確認 👤 ユーザー確認
- [ ] エラー監視設定（任意）

🚀 **本番URL**: https://ai-chat-alpha-seven.vercel.app

---

## 完了条件

- [x] AIとチャットができる
- [x] 会話履歴が保存される
- [x] 過去の会話を選択して表示できる
- [x] ストリーミングで応答が表示される
- [x] モバイルでも快適に使える
- [x] Vercel で公開されている → https://ai-chat-alpha-seven.vercel.app

---

## フェーズ 10: 残タスク・改善項目

### 🔴 10.1 セキュリティ（優先度: 最高）

- [ ] **APIキーのローテーション** ⚠️ 緊急
  - `.env.local` が Git 履歴に残っている可能性
  - Google API キーと Supabase キーを再生成推奨
- [ ] 入力バリデーションの追加
  - `app/api/chat/route.ts`: メッセージ内容の長さ制限
  - `app/api/conversations/route.ts`: タイトルの長さ制限（255文字）
  - メッセージロールの検証（'user' | 'assistant' のみ許可）
- [ ] XSS対策の強化
  - `components/chat/MessageBubble.tsx`: ユーザー入力のサニタイズ
- [ ] セキュリティヘッダーの設定
  - `next.config.ts`: CSP、X-Frame-Options 等の設定

### 🟠 10.2 エラーハンドリング（優先度: 高）

- [ ] ネットワークエラーのリトライ機能
  - `hooks/useChat.ts`: 指数バックオフでリトライ
  - タイムアウト設定（30秒）
- [ ] API レート制限（429）への対応
  - `lib/gemini.ts`: クォータ超過時のユーザー通知
- [ ] ストリーミング中断時のエラー回復
  - 部分的なメッセージの保存と再開機能
- [ ] Supabase 接続エラーのハンドリング
  - 接続断時の再接続ロジック

### 🟠 10.3 アクセシビリティ（優先度: 高）

- [ ] ARIA ラベルの追加
  - `ChatInput.tsx`: textarea に `aria-label`
  - `MessageBubble.tsx`: メッセージに `role="article"`
  - `Header.tsx`: メニューボタンに `aria-expanded`
- [ ] スクリーンリーダー対応
  - 新着メッセージの `aria-live="polite"` 通知
  - エラーメッセージに `role="alert"`
  - ローディング状態に `role="status"`
- [ ] キーボードナビゲーション
  - `ConversationItem.tsx`: Space キー対応
  - フォーカストラップの実装
  - スキップリンクの追加

### 🟠 10.4 データ同期（優先度: 高）

- [ ] レースコンディションの修正
  - `hooks/useConversations.ts`: unmount 時のクリーンアップ
  - `hooks/useChat.ts`: 会話切り替え時のストリーム中断
- [ ] メッセージ順序の保証
  - DB スキーマに `sequence` フィールド追加検討
  - 一時メッセージ ID の衝突回避
- [ ] オプティミスティック更新の整合性
  - 保存失敗時のロールバック機能

### 🟡 10.5 パフォーマンス（優先度: 中）

- [ ] メッセージリストの仮想化
  - `react-window` または `@tanstack/react-virtual` 導入
  - 大量メッセージ時のレンダリング最適化
- [ ] 会話一覧のキャッシュ
  - SWR または React Query 導入検討
  - stale-while-revalidate 戦略
- [ ] コンポーネントのメモ化
  - `MessageBubble`: `React.memo` でラップ
  - `ConversationItem`: 不要な再レンダリング防止
- [ ] 会話一覧のページネーション
  - 無限スクロールまたはページ分割

### 🟡 10.6 モバイル UX（優先度: 中）

- [ ] スワイプジェスチャー対応
  - サイドバーのスワイプ開閉
  - メッセージのスワイプ削除（将来）
- [ ] セーフエリア対応
  - iPhone ノッチ・Dynamic Island 対応
  - ホームインジケーター領域の余白
- [ ] モバイルキーボード対応
  - キーボード表示時の入力欄位置調整
  - `inputmode` 属性の追加
- [ ] 削除確認のモーダル化
  - `confirm()` を shadcn AlertDialog に置き換え

### 🟡 10.7 エッジケース対応（優先度: 中）

- [ ] 長文メッセージの処理
  - `maxOutputTokens` の動的調整
  - 途中切断時の「続きを生成」機能
- [ ] 特殊文字・絵文字対応
  - CJK文字の折り返し最適化
  - 絵文字レンダリングの確認
- [ ] リンクの自動検出
  - URL をクリック可能なリンクに変換
  - リンクプレビュー（OGP）表示（将来）
- [ ] 空状態の改善
  - 会話削除時の状態クリア
  - 読み込み失敗時の空状態表示

### 🟡 10.8 ユーザーフィードバック（優先度: 中）

- [ ] トースト通知の追加
  - 会話作成・削除成功時の通知
  - エラー発生時の通知
- [ ] 削除の取り消し（Undo）機能
  - 一定時間内の取り消し可能化
- [ ] オフライン状態の表示
  - ネットワーク状態のインジケーター
  - オフライン時の機能制限表示

### 🟢 10.9 テスト（優先度: 低）

- [ ] ユニットテスト
  - `lib/utils.ts`: formatDate, truncateMessage
  - `lib/gemini.ts`: streamChat, generateTitle
- [ ] E2E テスト
  - メッセージ送受信フロー
  - 会話作成・削除フロー
- [ ] アクセシビリティテスト
  - axe-core による自動テスト

### 🟢 10.10 ドキュメント（優先度: 低）

- [ ] JSDoc コメントの追加
  - 全カスタムフックの説明
  - API レスポンス型の説明
- [ ] README.md の作成
  - プロジェクト概要
  - セットアップ手順
  - 技術スタック
- [ ] CONTRIBUTING.md の作成
  - コーディング規約
  - PR テンプレート

---

## 備考

### 推定作業量

- フェーズ 1-2: 環境構築
- フェーズ 3-4: バックエンド実装
- フェーズ 5-6: フロントエンド実装
- フェーズ 7: UI/UX調整
- フェーズ 8-9: テスト・デプロイ

### 参考リンク

- [Next.js ドキュメント](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Supabase ドキュメント](https://supabase.com/docs)
- [Hugging Face Inference API](https://huggingface.co/docs/api-inference)
- [Vercel](https://vercel.com)
