'use client';

import { Bot, Sparkles, MessageSquare, Lightbulb } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
      {/* アイコン */}
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
          <Bot className="h-10 w-10 text-primary" />
        </div>
        <div className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
          <Sparkles className="h-4 w-4" />
        </div>
      </div>

      {/* タイトル */}
      <h2 className="mb-2 text-2xl font-bold">AI Chat へようこそ</h2>
      <p className="mb-8 max-w-md text-muted-foreground">
        下のテキストボックスにメッセージを入力して、
        <br />
        AIとの会話を始めましょう。
      </p>

      {/* 使い方のヒント */}
      <div className="grid gap-3 max-w-md w-full">
        <div className="flex items-center gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-accent">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
            <MessageSquare className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="font-medium text-sm">質問や相談</p>
            <p className="text-xs text-muted-foreground">何でも気軽に聞いてみてください</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-accent">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/10">
            <Lightbulb className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="font-medium text-sm">アイデア出し</p>
            <p className="text-xs text-muted-foreground">ブレインストーミングのお手伝い</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-accent">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500/10">
            <Sparkles className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <p className="font-medium text-sm">文章作成</p>
            <p className="text-xs text-muted-foreground">メールや文書の作成をサポート</p>
          </div>
        </div>
      </div>
    </div>
  );
}
