'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Conversation, ConversationWithMessages } from '@/types';

interface UseConversationsProps {
  deviceId: string | null;
}

export function useConversations({ deviceId }: UseConversationsProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ConversationWithMessages | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 会話一覧を取得
  const fetchConversations = useCallback(async () => {
    if (!deviceId) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/conversations?deviceId=${deviceId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '会話の取得に失敗しました');
      }

      setConversations(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '会話の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [deviceId]);

  // 特定の会話を取得（メッセージ含む）
  const fetchConversation = useCallback(async (conversationId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/conversations/${conversationId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '会話の取得に失敗しました');
      }

      setCurrentConversation(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '会話の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 新規会話を作成
  const createConversation = useCallback(async (title?: string): Promise<Conversation | null> => {
    if (!deviceId) return null;

    setError(null);

    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, title }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '会話の作成に失敗しました');
      }

      const newConversation = data.data;
      setConversations((prev) => [newConversation, ...prev]);
      setCurrentConversation({ ...newConversation, messages: [] });

      return newConversation;
    } catch (err) {
      setError(err instanceof Error ? err.message : '会話の作成に失敗しました');
      return null;
    }
  }, [deviceId]);

  // 会話を削除
  const deleteConversation = useCallback(async (conversationId: string) => {
    setError(null);

    try {
      const res = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '会話の削除に失敗しました');
      }

      setConversations((prev) => prev.filter((c) => c.id !== conversationId));

      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '会話の削除に失敗しました');
    }
  }, [currentConversation]);

  // 会話を選択
  const selectConversation = useCallback((conversationId: string | null) => {
    if (conversationId) {
      fetchConversation(conversationId);
    } else {
      setCurrentConversation(null);
    }
  }, [fetchConversation]);

  // 現在の会話のメッセージを更新（ローカル状態）
  const updateCurrentMessages = useCallback((messages: ConversationWithMessages['messages']) => {
    setCurrentConversation((prev) => {
      if (!prev) return null;
      return { ...prev, messages };
    });
  }, []);

  // 会話タイトルを更新
  const updateConversationTitle = useCallback((conversationId: string, title: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, title } : c))
    );
    if (currentConversation?.id === conversationId) {
      setCurrentConversation((prev) => (prev ? { ...prev, title } : null));
    }
  }, [currentConversation]);

  // 初回ロード
  useEffect(() => {
    if (deviceId) {
      fetchConversations();
    }
  }, [deviceId, fetchConversations]);

  return {
    conversations,
    currentConversation,
    isLoading,
    error,
    fetchConversations,
    fetchConversation,
    createConversation,
    deleteConversation,
    selectConversation,
    updateCurrentMessages,
    updateConversationTitle,
  };
}
