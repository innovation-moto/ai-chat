'use client';

import { User, Bot } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import type { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 message-appear',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* アバター */}
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm',
          isUser
            ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground'
            : 'bg-gradient-to-br from-muted to-muted/80 text-muted-foreground'
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* メッセージコンテンツ */}
      <div className={cn('flex flex-col gap-1', isUser ? 'items-end' : 'items-start')}>
        {/* ロール表示 */}
        <span className="text-xs text-muted-foreground px-1">
          {isUser ? 'あなた' : 'AI'}
        </span>

        {/* メッセージ本文 */}
        <div
          className={cn(
            'max-w-[85%] rounded-2xl px-4 py-3 shadow-sm',
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-md'
              : 'bg-muted rounded-tl-md'
          )}
        >
          <p className={cn(
            'text-sm whitespace-pre-wrap break-words leading-relaxed',
            isStreaming && !isUser && 'streaming-cursor'
          )}>
            {message.content || (isStreaming ? '' : '...')}
          </p>
        </div>

        {/* 時間表示 */}
        {!isStreaming && message.created_at && (
          <span className="text-[10px] text-muted-foreground px-1">
            {formatDate(message.created_at)}
          </span>
        )}
      </div>
    </div>
  );
}
