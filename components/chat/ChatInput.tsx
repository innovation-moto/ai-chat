'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  onCancel: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export function ChatInput({
  onSend,
  onCancel,
  isStreaming,
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // テキストエリアの高さを自動調整
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  // 送信後にフォーカスを維持
  useEffect(() => {
    if (!isStreaming && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isStreaming]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isStreaming && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enter で送信
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
    // Enter のみは改行（Shift+Enter も改行）
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="shrink-0 border-t bg-gradient-to-t from-background to-background/80 p-4 backdrop-blur-sm"
    >
      <div className="max-w-3xl mx-auto">
        <div
          className={cn(
            'flex gap-2 items-end rounded-2xl border bg-background p-2 shadow-sm transition-all',
            isFocused && 'ring-2 ring-ring ring-offset-2',
            disabled && 'opacity-50'
          )}
        >
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="メッセージを入力..."
            disabled={disabled || isStreaming}
            rows={1}
            className="flex-1 resize-none bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed"
          />

          {isStreaming ? (
            <Button
              type="button"
              size="icon"
              variant="destructive"
              onClick={onCancel}
              className="h-10 w-10 rounded-xl shrink-0 transition-transform hover:scale-105"
              title="停止"
            >
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={!message.trim() || disabled}
              className={cn(
                'h-10 w-10 rounded-xl shrink-0 transition-all',
                message.trim() && 'hover:scale-105'
              )}
              title="送信 (Ctrl+Enter)"
            >
              {disabled ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between mt-2 px-2">
          <p className="text-[11px] text-muted-foreground">
            Ctrl + Enter で送信
          </p>
          <p className="text-[11px] text-muted-foreground">
            Powered by Gemini
          </p>
        </div>
      </div>
    </form>
  );
}
