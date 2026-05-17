import { useState, useCallback, FormEvent, KeyboardEvent, useRef, useEffect } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

interface ChatComposerProps {
  onSend: (text: string) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
}

const MAX_ROWS = 5;

export default function ChatComposer({
  onSend,
  onTyping,
  disabled,
  placeholder = 'Write a message…',
}: ChatComposerProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const lineHeight = 22;
    const maxHeight = lineHeight * MAX_ROWS;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [text, resizeTextarea]);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const trimmed = text.trim();
      if (!trimmed || disabled) return;
      onSend(trimmed);
      setText('');
      onTyping?.(false);
      requestAnimationFrame(resizeTextarea);
    },
    [text, disabled, onSend, onTyping, resizeTextarea],
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  const handleChange = (value: string) => {
    setText(value);
    onTyping?.(value.length > 0);
  };

  const canSend = !disabled && text.trim().length > 0;

  return (
    <div className="flex-shrink-0 border-t border-ink-900/[0.06] dark:border-zinc-700/80 bg-white dark:bg-zinc-900">
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 p-3 sm:p-4"
      >
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => onTyping?.(false)}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            aria-label="Message"
            className="block w-full resize-none rounded-xl border border-ink-900/[0.08] dark:border-zinc-600 bg-surface-50 dark:bg-zinc-800/80 px-4 py-2.5 text-[14px] text-ink-900 dark:text-zinc-100 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-500/40 disabled:opacity-50 transition-shadow leading-[22px]"
          />
        </div>
        <button
          type="submit"
          disabled={!canSend}
          className={`flex-shrink-0 h-11 w-11 flex items-center justify-center rounded-xl transition-all ${
            canSend
              ? 'bg-primary-600 text-white shadow-md shadow-primary-600/25 hover:bg-primary-700 active:scale-95'
              : 'bg-surface-100 dark:bg-zinc-800 text-ink-300 cursor-not-allowed'
          }`}
          aria-label="Send message"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </form>
      <p className="px-4 pb-2.5 text-[10px] text-ink-400 text-center sm:text-left">
        Enter to send · Shift+Enter for a new line
      </p>
    </div>
  );
}
