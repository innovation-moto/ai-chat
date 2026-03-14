import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { streamChat, generateTitle, ImageData } from '@/lib/gemini';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

// POST: メッセージを送信してストリーミング応答を取得
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    const supabase = createServerClient();

    let messages: { role: 'user' | 'assistant'; content: string }[];
    let conversationId: string;
    let deviceId: string;
    let isNewConversation: boolean;
    let imageData: ImageData | undefined;
    let imageUrl: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      // 画像付きリクエストの処理
      const formData = await request.formData();
      messages = JSON.parse(formData.get('messages') as string);
      conversationId = formData.get('conversationId') as string;
      deviceId = formData.get('deviceId') as string;
      isNewConversation = formData.get('isNewConversation') === 'true';

      const imageFile = formData.get('image') as File | null;
      if (imageFile && imageFile.size > 0) {
        // ファイルタイプの検証
        if (!ALLOWED_MIME_TYPES.includes(imageFile.type)) {
          return new Response(
            JSON.stringify({ error: 'JPEG、PNG、WebP形式の画像のみ対応しています' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        // ファイルサイズの検証
        if (imageFile.size > MAX_FILE_SIZE) {
          return new Response(
            JSON.stringify({ error: '画像サイズは4MB以下にしてください' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');

        imageData = { mimeType: imageFile.type, data: base64 };

        // Supabase Storage にアップロード
        const ext = imageFile.type.split('/')[1];
        const fileName = `${conversationId}/${Date.now()}.${ext}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chat-images')
          .upload(fileName, buffer, { contentType: imageFile.type });

        if (!uploadError && uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('chat-images')
            .getPublicUrl(uploadData.path);
          imageUrl = publicUrl;
        } else {
          console.error('Storage upload error:', uploadError);
        }
      }
    } else {
      const body = await request.json();
      ({ messages, conversationId, deviceId, isNewConversation } = body);
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'メッセージが必要です' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!conversationId || !deviceId) {
      return new Response(
        JSON.stringify({ error: 'conversationId と deviceId が必要です' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ユーザーメッセージをDBに保存
    const lastUserMessage = messages[messages.length - 1];
    const { data: savedUserMessage, error: userMsgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content: lastUserMessage.content,
        image_url: imageUrl || null,
      })
      .select()
      .single();

    if (userMsgError) {
      console.error('User message save error:', userMsgError);
      return new Response(
        JSON.stringify({ error: 'メッセージの保存に失敗しました' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ストリーミングレスポンスを作成
    const encoder = new TextEncoder();
    let fullContent = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // ユーザーメッセージIDと画像URLを送信
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ userMessageId: savedUserMessage.id, imageUrl: imageUrl || null })}\n\n`)
          );

          // Gemini でストリーミング応答を生成（画像データがあればマルチモーダル）
          for await (const chunk of streamChat(messages, imageData)) {
            fullContent += chunk;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
            );
          }

          // アシスタントメッセージをDBに保存
          const { data: savedAssistantMessage, error: assistantMsgError } = await supabase
            .from('messages')
            .insert({
              conversation_id: conversationId,
              role: 'assistant',
              content: fullContent,
            })
            .select()
            .single();

          if (assistantMsgError) {
            console.error('Assistant message save error:', assistantMsgError);
          } else {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ assistantMessageId: savedAssistantMessage.id })}\n\n`)
            );
          }

          // 新規会話の場合、タイトルを生成して更新
          if (isNewConversation) {
            const title = await generateTitle(lastUserMessage.content || '画像');
            const { error: titleError } = await supabase
              .from('conversations')
              .update({ title })
              .eq('id', conversationId);

            if (!titleError) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ title })}\n\n`)
              );
            }
          }

          // 会話の updated_at を更新
          await supabase
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId);

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          const errorMessage = error instanceof Error ? error.message : 'AI応答の生成に失敗しました';
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ error: 'サーバーエラーが発生しました' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
