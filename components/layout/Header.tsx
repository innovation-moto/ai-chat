'use client';

import { Menu, Plus, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onMenuClick: () => void;
  onNewChat: () => void;
}

export function Header({ onMenuClick, onNewChat }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        {/* モバイルメニューボタン */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">メニューを開く</span>
        </Button>

        {/* ロゴ・タイトル */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-semibold leading-none">AI Chat</h1>
            <span className="text-[10px] text-muted-foreground">by Gemini</span>
          </div>
        </div>
      </div>

      {/* 新規チャットボタン */}
      <Button
        variant="outline"
        size="sm"
        onClick={onNewChat}
        className="gap-1.5"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">新しいチャット</span>
      </Button>
    </header>
  );
}
