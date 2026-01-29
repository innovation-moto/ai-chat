'use client';

import { Trash2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatRelativeTime, truncateMessage } from '@/lib/utils';
import type { Conversation } from '@/types';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
}: ConversationItemProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-xl px-3 py-3 cursor-pointer transition-all duration-200',
        isActive
          ? 'bg-primary/10 text-primary shadow-sm'
          : 'hover:bg-muted active:scale-[0.98]'
      )}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
    >
      {/* アイコン */}
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
          isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        <MessageSquare className="h-4 w-4" />
      </div>

      {/* テキスト */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'truncate text-sm font-medium',
          isActive && 'text-primary'
        )}>
          {truncateMessage(conversation.title, 25)}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatRelativeTime(conversation.updated_at)}
        </p>
      </div>

      {/* 削除ボタン */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-8 w-8 opacity-0 transition-opacity shrink-0',
          'group-hover:opacity-100 focus:opacity-100',
          'hover:bg-destructive/10 hover:text-destructive'
        )}
        onClick={handleDelete}
        title="削除"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
