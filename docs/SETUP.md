# 外部サービス セットアップガイド

## 1. Supabase セットアップ

### 1.1 アカウント作成
1. [Supabase](https://supabase.com) にアクセス
2. 「Start your project」をクリック
3. GitHub アカウントでサインアップ（推奨）

### 1.2 プロジェクト作成
1. ダッシュボードで「New project」をクリック
2. 以下を設定:
   - **Name**: `ai-chat`（任意）
   - **Database Password**: 強力なパスワードを設定（保存しておく）
   - **Region**: `Northeast Asia (Tokyo)` を推奨
3. 「Create new project」をクリック

### 1.3 API キー取得
1. プロジェクトが作成されたら、左メニューの「Settings」→「API」を開く
2. 以下をコピー:
   - **Project URL**: `https://xxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6...`

### 1.4 データベーステーブル作成
1. 左メニューの「SQL Editor」を開く
2. 「New query」をクリック
3. `supabase/schema.sql` の内容をコピー＆ペースト
4. 「Run」をクリックして実行

### 1.5 確認
1. 左メニューの「Table Editor」を開く
2. `conversations` と `messages` テーブルが作成されていることを確認

---

## 2. Google Gemini API セットアップ

### 2.1 Google AI Studio にアクセス
1. [Google AI Studio](https://aistudio.google.com) にアクセス
2. Google アカウントでログイン

### 2.2 API キー取得
1. 左メニューの「Get API key」をクリック
2. 「Create API key」をクリック
3. プロジェクトを選択（または新規作成）
4. 生成された API キーをコピー

### 2.3 無料枠について
Google Gemini API の無料枠:

| モデル | 無料枠 |
|--------|--------|
| gemini-2.5-flash | 1日1500リクエスト、1分15リクエスト |
| gemini-2.5-pro | 1日50リクエスト、1分2リクエスト |

**個人利用には `gemini-2.5-flash` を推奨**（高速で無料枠が大きい）

⚠️ 注意: `gemini-1.5` 系モデルは廃止されました。`gemini-2.5-flash` を使用してください。

---

## 3. 環境変数設定

### 3.1 .env.local の編集
プロジェクトルートの `.env.local` を編集:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://あなたのプロジェクトID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=あなたのanon key

# Google Gemini API
GOOGLE_API_KEY=あなたのAPIキー
GOOGLE_MODEL=gemini-2.5-flash
```

### 3.2 確認
設定が完了したら、以下のコマンドで動作確認:

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く

---

## トラブルシューティング

### Supabase に接続できない
- Project URL と anon key が正しいか確認
- Supabase プロジェクトが起動中か確認

### Google Gemini API エラー
- API キーが正しいか確認
- 無料枠の制限に達していないか確認（翌日リセット）
- リージョン制限がある場合あり

### 「models/xxx is not found」エラー
モデルが見つからないエラーの場合、以下を試してください：

1. **APIキーを再生成**
   - Google AI Studio で新しいAPIキーを作成
   - `.env.local` を更新

2. **モデル名を変更**
   試すモデル名（`.env.local` の `GOOGLE_MODEL`）：
   ```
   gemini-2.5-flash（推奨）
   gemini-2.5-pro
   gemini-2.0-flash
   ```
   ※ `gemini-1.5` 系モデルは廃止されました

3. **地域制限の確認**
   - 一部の地域ではGemini APIが利用できない場合があります
   - VPNを使用して米国からアクセスを試す

4. **サーバー再起動**
   環境変数を変更した後は必ず再起動：
   ```bash
   # サーバーを停止 (Ctrl+C)
   npm run dev
   ```

### テーブルが作成されない
- SQL Editor でエラーメッセージを確認
- すでにテーブルが存在する場合は削除してから再実行
