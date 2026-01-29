import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET: 会話一覧を取得
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get('deviceId');

  if (!deviceId) {
    return NextResponse.json(
      { error: 'deviceId が必要です' },
      { status: 400 }
    );
  }

  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('device_id', deviceId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: '会話の取得に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

// POST: 新規会話を作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, title } = body;

    if (!deviceId) {
      return NextResponse.json(
        { error: 'deviceId が必要です' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        device_id: deviceId,
        title: title || '新しいチャット',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: '会話の作成に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
