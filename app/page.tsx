'use client';

import { useState, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { LoadingIndicator } from '@/components/chat/LoadingIndicator';
import { useDeviceId } from '@/hooks/useDeviceId';
import { useConversations } from '@/hooks/useConversations';
import { useChat } from '@/hooks/useChat';

export default function Home() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // デバイスID管理
  const { deviceId, isLoading: isDeviceIdLoading } = useDeviceId();

  // 会話管理
  const {
    conversations,
    currentConversation,
    isLoading: isConversationsLoading,
    error: conversationsError,
    createConversation,
    deleteConversation,
    selectConversation,
    updateCurrentMessages,
    updateConversationTitle,
  } = useConversations({ deviceId });

  // チャット管理
  const {
    isStreaming,
    error: chatError,
    sendMessage,
    cancelStream,
  } = useChat({
    deviceId,
    currentConversation,
    onCreateConversation: createConversation,
    onUpdateMessages: updateCurrentMessages,
    onUpdateTitle: updateConversationTitle,
  });

  // 新規チャット作成
  const handleNewChat = useCallback(() => {
    selectConversation(null);
  }, [selectConversation]);

  // 会話選択
  const handleSelectConversation = useCallback((id: string) => {
    selectConversation(id);
  }, [selectConversation]);

  // 会話削除
  const handleDeleteConversation = useCallback((id: string) => {
    if (confirm('この会話を削除しますか？')) {
      deleteConversation(id);
    }
  }, [deleteConversation]);

  // モバイルサイドバー開閉
  const handleOpenMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(true);
  }, []);

  const handleCloseMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  // 初期化中の表示
  if (isDeviceIdLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingIndicator message="初期化中..." />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* デスクトップサイドバー */}
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversation?.id || null}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onNewChat={handleNewChat}
      />

      {/* モバイルサイドバー */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={handleCloseMobileSidebar}
        conversations={conversations}
        currentConversationId={currentConversation?.id || null}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onNewChat={handleNewChat}
      />

      {/* メインコンテンツ */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* ヘッダー */}
        <Header
          onMenuClick={handleOpenMobileSidebar}
          onNewChat={handleNewChat}
        />

        {/* チャットエリア */}
        <ChatContainer
          messages={currentConversation?.messages || []}
          isStreaming={isStreaming}
          isLoading={isConversationsLoading}
          error={conversationsError || chatError}
          onSendMessage={sendMessage}
          onCancelStream={cancelStream}
        />
      </main>
    </div>
  );
}
