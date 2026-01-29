'use client';

import { Plus, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ConversationList } from '@/components/chat/ConversationList';
import type { Conversation } from '@/types';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onNewChat: () => void;
}

export function MobileSidebar({
  isOpen,
  onClose,
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  onNewChat,
}: MobileSidebarProps) {
  const handleSelect = (id: string) => {
    onSelectConversation(id);
    onClose();
  };

  const handleNewChat = () => {
    onNewChat();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 p-0 flex flex-col">
        {/* ヘッダー */}
        <SheetHeader className="flex h-14 flex-row items-center justify-between border-b px-4 space-y-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <SheetTitle className="text-base">チャット履歴</SheetTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewChat}
            className="h-8 gap-1"
          >
            <Plus className="h-4 w-4" />
            新規
          </Button>
        </SheetHeader>

        {/* 会話リスト */}
        <ScrollArea className="flex-1 scrollbar-thin">
          <div className="p-3">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageSquare className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  履歴がありません
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  新しいチャットを始めましょう
                </p>
              </div>
            ) : (
              <ConversationList
                conversations={conversations}
                currentConversationId={currentConversationId}
                onSelect={handleSelect}
                onDelete={onDeleteConversation}
              />
            )}
          </div>
        </ScrollArea>

        {/* フッター */}
        <Separator />
        <div className="p-4">
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-xs text-muted-foreground">
              AI Chat v1.0
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Powered by Gemini
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
