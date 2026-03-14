'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Square, Loader2, Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

interface ChatInputProps {
  onSend: (message: string, imageFile?: File) => void;
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
  const [isDragging, setIsDragging] = useState(false);
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // コンポーネントのアンマウント時にblob URLを解放
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = useCallback((file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('JPEG、PNG、WebP形式の画像のみ添付できます');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert('画像サイズは4MB以下にしてください');
      return;
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setAttachedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  }, [previewUrl]);

  const handleRemoveImage = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setAttachedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [previewUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || attachedImage) && !isStreaming && !disabled) {
      onSend(message.trim(), attachedImage || undefined);
      setMessage('');
      handleRemoveImage();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const canSend = (message.trim() || attachedImage) && !isStreaming && !disabled;

  return (
    <form
      onSubmit={handleSubmit}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'shrink-0 border-t bg-gradient-to-t from-background to-background/80 px-4 pt-4 backdrop-blur-sm transition-colors',
        isDragging && 'bg-primary/5 border-primary/50'
      )}
      style={{
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))'
      }}
    >
      <div className="max-w-3xl mx-auto">
        {/* ドラッグオーバー表示 */}
        {isDragging && (
          <div className="mb-2 flex items-center justify-center rounded-xl border-2 border-dashed border-primary/50 bg-primary/5 p-4 text-sm text-primary">
            画像をドロップして添付
          </div>
        )}

        {/* 添付画像プレビュー */}
        {previewUrl && attachedImage && (
          <div className="mb-2 flex items-start gap-2">
            <div className="relative">
              <Image
                src={previewUrl}
                alt="添付画像プレビュー"
                width={80}
                height={80}
                className="h-20 w-20 rounded-lg object-cover border"
                unoptimized
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90"
                title="画像を削除"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <span className="text-xs text-muted-foreground pt-1 max-w-[200px] truncate">
              {attachedImage.name}
            </span>
          </div>
        )}

        <div
          className={cn(
            'flex gap-2 items-end rounded-2xl border bg-background p-2 shadow-sm transition-all',
            isFocused && 'ring-2 ring-ring ring-offset-2',
            disabled && 'opacity-50'
          )}
        >
          {/* 画像添付ボタン */}
          <Button
            type="button"
            size="icon"
            variant="ghost"
            disabled={disabled || isStreaming}
            onClick={() => fileInputRef.current?.click()}
            className="h-10 w-10 rounded-xl shrink-0 text-muted-foreground hover:text-foreground"
            title="画像を添付 (JPEG/PNG/WebP, 最大4MB)"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* 隠しファイル入力 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
          />

          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={attachedImage ? '画像についてのメッセージを入力（省略可）...' : 'メッセージを入力...'}
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
              disabled={!canSend}
              className={cn(
                'h-10 w-10 rounded-xl shrink-0 transition-all',
                canSend && 'hover:scale-105'
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
            Ctrl + Enter で送信 · 画像をドラッグ＆ドロップ可
          </p>
          <p className="text-[11px] text-muted-foreground">
            Powered by Gemini
          </p>
        </div>
      </div>
    </form>
  );
}
