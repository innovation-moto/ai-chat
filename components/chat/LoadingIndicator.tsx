'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingIndicatorProps {
  message?: string;
  className?: string;
}

export function LoadingIndicator({
  message = '読み込み中...',
  className,
}: LoadingIndicatorProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 p-8',
        className
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
