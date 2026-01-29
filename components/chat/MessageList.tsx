'use client';

import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import type { Message } from '@/types';

interface MessageListProps {
  messages: Message[];
  isStreaming?: boolean;
}

export function MessageList({ messages, isStreaming = false }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 新しいメッセージが来たら一番下にスクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto overscroll-contain p-4 -webkit-overflow-scrolling-touch"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div className="space-y-4 max-w-3xl mx-auto pb-4">
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isStreaming={
              isStreaming &&
              index === messages.length - 1 &&
              message.role === 'assistant'
            }
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
