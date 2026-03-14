'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { EmptyState } from './EmptyState';
import { LoadingIndicator } from './LoadingIndicator';
import type { Message } from '@/types';

interface ChatContainerProps {
  messages: Message[];
  isStreaming: boolean;
  isLoading: boolean;
  error: string | null;
  onSendMessage: (message: string, imageFile?: File) => void;
  onCancelStream: () => void;
}

export function ChatContainer({
  messages,
  isStreaming,
  isLoading,
  error,
  onSendMessage,
  onCancelStream,
}: ChatContainerProps) {
  return (
    <div className="flex flex-1 flex-col min-h-0 bg-gradient-to-b from-background to-muted/20">
      {/* エラー表示 */}
      {error && (
        <div className="mx-4 mt-4 flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">エラーが発生しました</p>
            <p className="text-xs text-destructive/80 mt-0.5">{error}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="shrink-0"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            再読み込み
          </Button>
        </div>
      )}

      {/* メッセージエリア */}
      {isLoading ? (
        <LoadingIndicator message="会話を読み込み中..." />
      ) : messages.length === 0 ? (
        <EmptyState />
      ) : (
        <MessageList messages={messages} isStreaming={isStreaming} />
      )}

      {/* 入力エリア */}
      <ChatInput
        onSend={onSendMessage}
        onCancel={onCancelStream}
        isStreaming={isStreaming}
        disabled={isLoading}
      />
    </div>
  );
}
