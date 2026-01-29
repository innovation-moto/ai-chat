'use client';

import { ConversationItem } from './ConversationItem';
import type { Conversation } from '@/types';

interface ConversationListProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ConversationList({
  conversations,
  currentConversationId,
  onSelect,
  onDelete,
}: ConversationListProps) {
  return (
    <div className="space-y-1">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isActive={conversation.id === currentConversationId}
          onSelect={() => onSelect(conversation.id)}
          onDelete={() => onDelete(conversation.id)}
        />
      ))}
    </div>
  );
}
