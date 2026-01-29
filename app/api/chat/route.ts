import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { streamChat, generateTitle } from '@/lib/gemini';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST: メッセージを送信してストリーミング応答を取得
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, conversationId, deviceId, isNewConversation } = body;

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

    const supabase = createServerClient();

    // ユーザーメッセージをDBに保存
    const lastUserMessage = messages[messages.length - 1];
    const { data: savedUserMessage, error: userMsgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content: lastUserMessage.content,
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
          // ユーザーメッセージIDを送信
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ userMessageId: savedUserMessage.id })}\n\n`)
          );

          // Gemini でストリーミング応答を生成
          for await (const chunk of streamChat(messages)) {
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
            const title = await generateTitle(lastUserMessage.content);
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
