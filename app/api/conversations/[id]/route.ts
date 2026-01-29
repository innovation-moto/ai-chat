import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: 特定の会話とメッセージを取得
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: '会話IDが必要です' },
      { status: 400 }
    );
  }

  try {
    const supabase = createServerClient();

    // 会話を取得
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();

    if (convError) {
      console.error('Supabase error:', convError);
      return NextResponse.json(
        { error: '会話が見つかりません' },
        { status: 404 }
      );
    }

    // メッセージを取得
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    if (msgError) {
      console.error('Supabase error:', msgError);
      return NextResponse.json(
        { error: 'メッセージの取得に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: {
        ...conversation,
        messages: messages || [],
      },
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

// DELETE: 会話を削除
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: '会話IDが必要です' },
      { status: 400 }
    );
  }

  try {
    const supabase = createServerClient();

    // CASCADE により関連するメッセージも削除される
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: '会話の削除に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
