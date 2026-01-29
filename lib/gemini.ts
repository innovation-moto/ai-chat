import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_API_KEY;
const modelName = process.env.GOOGLE_MODEL || 'gemini-1.5-flash';

if (!apiKey) {
  console.warn('GOOGLE_API_KEY が設定されていません');
}

// Gemini クライアントの初期化
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// チャット用のメッセージ型
export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

// メッセージを Gemini 形式に変換
export function convertToGeminiFormat(
  messages: { role: 'user' | 'assistant'; content: string }[]
): GeminiMessage[] {
  return messages.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));
}

// ストリーミングでチャット応答を生成
export async function* streamChat(
  messages: { role: 'user' | 'assistant'; content: string }[]
): AsyncGenerator<string> {
  if (!genAI) {
    throw new Error('Google API Key が設定されていません');
  }

  try {
    const model = genAI.getGenerativeModel({ model: modelName });

    // 会話履歴を Gemini 形式に変換
    const history = convertToGeminiFormat(messages.slice(0, -1));
    const lastMessage = messages[messages.length - 1];

    // チャットセッションを開始
    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 2048,
      },
    });

    // ストリーミングで応答を生成
    const result = await chat.sendMessageStream(lastMessage.content);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield text;
      }
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error(`Gemini API エラー: ${error instanceof Error ? error.message : '不明なエラー'}`);
  }
}

// 非ストリーミングでチャット応答を生成（シンプルな用途用）
export async function generateChat(
  messages: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  if (!genAI) {
    throw new Error('Google API Key が設定されていません');
  }

  const model = genAI.getGenerativeModel({ model: modelName });

  const history = convertToGeminiFormat(messages.slice(0, -1));
  const lastMessage = messages[messages.length - 1];

  const chat = model.startChat({
    history,
    generationConfig: {
      maxOutputTokens: 2048,
    },
  });

  const result = await chat.sendMessage(lastMessage.content);
  return result.response.text();
}

// 会話タイトルを生成
export async function generateTitle(firstMessage: string): Promise<string> {
  if (!genAI) {
    return '新しいチャット';
  }

  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const prompt = `以下のメッセージに対する簡潔な日本語タイトル（10文字以内）を生成してください。タイトルのみを出力してください。

メッセージ: ${firstMessage}`;

    const result = await model.generateContent(prompt);
    const title = result.response.text().trim();
    return title.slice(0, 20) || '新しいチャット';
  } catch {
    return '新しいチャット';
  }
}
