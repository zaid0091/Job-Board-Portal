import { useEffect, useRef, useMemo } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import type { ChatMessage } from '@/types';

interface ChatMessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
  otherPartyName: string;
  typingUserId: string | null;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

type MessageGroup = { dateLabel: string; messages: ChatMessage[] };

function formatDateLabel(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEEE, MMMM d');
}

function groupMessagesByDate(messages: ChatMessage[]): MessageGroup[] {
  const groups: MessageGroup[] = [];
  let current: MessageGroup | null = null;

  for (const msg of messages) {
    const label = formatDateLabel(new Date(msg.timestamp));
    if (!current || current.dateLabel !== label) {
      current = { dateLabel: label, messages: [msg] };
      groups.push(current);
    } else {
      current.messages.push(msg);
    }
  }
  return groups;
}

export default function ChatMessageList({
  messages,
  currentUserId,
  otherPartyName,
  typingUserId,
  onLoadMore,
  hasMore,
  isLoadingMore,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(messages.length);

  const groups = useMemo(() => groupMessagesByDate(messages), [messages]);

  useEffect(() => {
    const grew = messages.length > prevLengthRef.current;
    prevLengthRef.current = messages.length;
    if (grew || typingUserId) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, typingUserId]);

  if (messages.length === 0 && !typingUserId) {
    return <ChatEmptyState otherPartyName={otherPartyName} />;
  }

  return (
    <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-5 py-5 space-y-4 bg-surface-50/80 dark:bg-zinc-900/40">
      {hasMore && onLoadMore && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="px-3 py-1.5 text-[12px] font-medium text-primary-600 dark:text-primary-400 bg-white dark:bg-zinc-800 rounded-full border border-ink-900/[0.06] dark:border-zinc-700 shadow-sm hover:bg-surface-50 disabled:opacity-50 transition-colors"
          >
            {isLoadingMore ? 'Loading…' : 'Load earlier messages'}
          </button>
        </div>
      )}

      {groups.map((group) => (
        <div key={group.dateLabel} className="space-y-3">
          <div className="flex justify-center sticky top-0 z-[1] py-1">
            <span className="px-3 py-0.5 text-[11px] font-medium text-ink-500 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm rounded-full border border-ink-900/[0.05] dark:border-zinc-700/80 shadow-sm">
              {group.dateLabel}
            </span>
          </div>
          {group.messages.map((msg, i) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isOwn={String(msg.sender_id) === String(currentUserId)}
              showTail={
                i === group.messages.length - 1 ||
                String(group.messages[i + 1]?.sender_id) !== String(msg.sender_id)
              }
            />
          ))}
        </div>
      ))}

      <AnimatePresence>
        {typingUserId && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="flex justify-start"
          >
            <div className="rounded-2xl rounded-bl-md px-4 py-3 bg-white dark:bg-zinc-800 border border-ink-900/[0.06] dark:border-zinc-700 shadow-sm">
              <TypingDots />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={bottomRef} aria-hidden />
    </div>
  );
}

function ChatEmptyState({ otherPartyName }: { otherPartyName: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] px-6 text-center bg-surface-50/80 dark:bg-zinc-900/40">
      <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center mb-4 ring-1 ring-primary-500/20">
        <ChatBubbleLeftRightIcon className="h-7 w-7 text-primary-600 dark:text-primary-400" />
      </div>
      <h3 className="text-[15px] font-semibold text-ink-900">Start the conversation</h3>
      <p className="mt-1.5 text-[13px] text-ink-500 max-w-xs leading-relaxed">
        Send a message to {otherPartyName}. They&apos;ll be notified when you reach out.
      </p>
    </div>
  );
}

function MessageBubble({
  msg,
  isOwn,
  showTail,
}: {
  msg: ChatMessage;
  isOwn: boolean;
  showTail: boolean;
}) {
  const isPending = msg.id.startsWith('temp-');
  const time = format(new Date(msg.timestamp), 'h:mm a');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`relative max-w-[min(85%,20rem)] px-4 py-2.5 shadow-sm ${
          isOwn
            ? `bg-primary-600 text-white ${showTail ? 'rounded-2xl rounded-br-md' : 'rounded-2xl'}`
            : `bg-white dark:bg-zinc-800 text-ink-900 border border-ink-900/[0.06] dark:border-zinc-700 ${showTail ? 'rounded-2xl rounded-bl-md' : 'rounded-2xl'}`
        } ${isPending ? 'opacity-80' : ''}`}
      >
        <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
        <div
          className={`flex items-center justify-end gap-1.5 mt-1 ${
            isOwn ? 'text-primary-200/90' : 'text-ink-400'
          }`}
        >
          {isPending && <span className="text-[10px] italic">Sending</span>}
          <span className="text-[10px] tabular-nums">{time}</span>
        </div>
      </div>
    </motion.div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 h-5" aria-label="Typing">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-ink-400"
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
