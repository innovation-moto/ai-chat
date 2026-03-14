'use client';

import { useState, useCallback, useRef } from 'react';
import type { Message, ConversationWithMessages } from '@/types';

interface UseChatProps {
  deviceId: string | null;
  currentConversation: ConversationWithMessages | null;
  onCreateConversation: (title?: string) => Promise<{ id: string } | null>;
  onUpdateMessages: (messages: Message[]) => void;
  onUpdateTitle: (conversationId: string, title: string) => void;
}

export function useChat({
  deviceId,
  currentConversation,
  onCreateConversation,
  onUpdateMessages,
  onUpdateTitle,
}: UseChatProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // メッセージを送信（画像ファイルオプション対応）
  const sendMessage = useCallback(async (content: string, imageFile?: File) => {
    if (!deviceId || (!content.trim() && !imageFile)) return;

    setError(null);
    setIsStreaming(true);

    // 現在の会話がなければ新規作成
    let conversationId = currentConversation?.id;
    const isNewConversation = !conversationId;

    if (!conversationId) {
      const newConversation = await onCreateConversation();
      if (!newConversation) {
        setError('会話の作成に失敗しました');
        setIsStreaming(false);
        return;
      }
      conversationId = newConversation.id;
    }

    // ユーザーメッセージを追加（画像プレビューURLを一時的に設定）
    const tempImageUrl = imageFile ? URL.createObjectURL(imageFile) : undefined;
    const userMessage: Message = {
      id: `temp-user-${Date.now()}`,
      conversation_id: conversationId,
      role: 'user',
      content,
      image_url: tempImageUrl,
      created_at: new Date().toISOString(),
    };

    const currentMessages = currentConversation?.messages || [];
    const updatedMessages = [...currentMessages, userMessage];
    onUpdateMessages(updatedMessages);

    // AIの応答用プレースホルダー
    const assistantMessage: Message = {
      id: `temp-assistant-${Date.now()}`,
      conversation_id: conversationId,
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
    };

    onUpdateMessages([...updatedMessages, assistantMessage]);

    try {
      abortControllerRef.current = new AbortController();

      // 画像がある場合は FormData、なければ JSON で送信
      const messagesForApi = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      let res: Response;
      if (imageFile) {
        const formData = new FormData();
        formData.append('messages', JSON.stringify(messagesForApi));
        formData.append('conversationId', conversationId);
        formData.append('deviceId', deviceId);
        formData.append('isNewConversation', String(isNewConversation));
        formData.append('image', imageFile);

        res = await fetch('/api/chat', {
          method: 'POST',
          body: formData,
          signal: abortControllerRef.current.signal,
        });
      } else {
        res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: messagesForApi,
            conversationId,
            deviceId,
            isNewConversation,
          }),
          signal: abortControllerRef.current.signal,
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'メッセージの送信に失敗しました');
      }

      // ストリーミングレスポンスを処理
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);

                if (parsed.content) {
                  fullContent += parsed.content;
                  onUpdateMessages([
                    ...updatedMessages,
                    { ...assistantMessage, content: fullContent },
                  ]);
                }

                if (parsed.title && isNewConversation) {
                  onUpdateTitle(conversationId!, parsed.title);
                }

                if (parsed.userMessageId) {
                  userMessage.id = parsed.userMessageId;
                  // サーバーから返った実際の画像URLに置き換え（blob URLを解放）
                  if (tempImageUrl) {
                    URL.revokeObjectURL(tempImageUrl);
                  }
                  if (parsed.imageUrl) {
                    userMessage.image_url = parsed.imageUrl;
                  }
                }

                if (parsed.assistantMessageId) {
                  assistantMessage.id = parsed.assistantMessageId;
                }
              } catch {
                // JSON パースエラーは無視
              }
            }
          }
        }
      }

      // 最終メッセージを設定
      onUpdateMessages([
        ...updatedMessages,
        { ...assistantMessage, content: fullContent },
      ]);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // キャンセルされた場合は何もしない
        return;
      }
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      // エラー時はアシスタントメッセージを削除
      onUpdateMessages(updatedMessages);
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [deviceId, currentConversation, onCreateConversation, onUpdateMessages, onUpdateTitle]);

  // ストリーミングをキャンセル
  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  }, []);

  return {
    isStreaming,
    error,
    sendMessage,
    cancelStream,
  };
}
