import { useEffect, useCallback, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setActiveConversation,
  fetchMessageHistory,
  markConversationRead,
  addOptimisticMessage,
  replaceOptimisticMessage,
  applyInboxUpdate,
  fetchChatUnreadCount,
} from '@/store/slices/chatSlice';
import { isWebSocketEnabled } from '@/utils/wsConfig';
import { chatAPI } from '@/api';
import { useChatWebSocket, createOptimisticMessage } from '@/hooks/useChatWebSocket';
import ChatMessageList from '@/components/chat/ChatMessageList';
import ChatComposer from '@/components/chat/ChatComposer';
import ChatAvatar from '@/components/chat/ChatAvatar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SEO from '@/components/SEO';
import toast from 'react-hot-toast';
import type { ConversationDetail } from '@/types';
import {
  ArrowLeftIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';

export default function ChatRoomPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const {
    activeMessages,
    hasMoreMessages,
    nextCursor,
    isLoadingMessages,
    typingUserId,
  } = useAppSelector((state) => state.chat);

  const [meta, setMeta] = useState<ConversationDetail | null>(null);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!conversationId) return;
    dispatch(setActiveConversation(conversationId));
    setLoadingMeta(true);
    chatAPI
      .getConversation(conversationId)
      .then(setMeta)
      .catch(() => {
        toast.error('Conversation not found');
        navigate('/messages');
      })
      .finally(() => setLoadingMeta(false));

    dispatch(fetchMessageHistory({ conversationId }));

    return () => {
      dispatch(setActiveConversation(null));
    };
  }, [conversationId, dispatch, navigate]);

  const handleConnected = useCallback(() => {
    if (!conversationId || !activeMessages.length) return;
    const last = activeMessages[activeMessages.length - 1];
    dispatch(
      markConversationRead({
        conversationId,
        upToMessageId: last.id.startsWith('temp-') ? undefined : last.id,
      }),
    );
    dispatch(fetchChatUnreadCount());
  }, [conversationId, activeMessages, dispatch]);

  const { isConnected, sendMessage, sendTyping } = useChatWebSocket({
    conversationId: conversationId ?? null,
    onConnected: handleConnected,
    onError: (_code, message) => toast.error(message),
  });

  useEffect(() => {
    if (!conversationId || !activeMessages.length) return;
    const last = activeMessages[activeMessages.length - 1];
    if (last.id.startsWith('temp-')) return;
    dispatch(
      markConversationRead({ conversationId, upToMessageId: last.id }),
    );
  }, [activeMessages, conversationId, dispatch]);

  const handleSend = useCallback(
    async (text: string) => {
      if (!user?.id || !conversationId) return;
      const clientId = crypto.randomUUID();
      dispatch(
        addOptimisticMessage(createOptimisticMessage(text, user.id, clientId)),
      );

      const tryRest = async () => {
        try {
          const message = await chatAPI.sendMessage(conversationId, text, clientId);
          dispatch(replaceOptimisticMessage({ clientId, message }));
          dispatch(applyInboxUpdate({ conversationId, message }));
        } catch {
          toast.error('Failed to send message. Please try again.');
        }
      };

      if (!isWebSocketEnabled()) {
        await tryRest();
        return;
      }

      const sent = sendMessage(text, clientId);
      if (!sent) {
        await tryRest();
      }
    },
    [conversationId, dispatch, sendMessage, user?.id],
  );

  const handleLoadMore = useCallback(async () => {
    if (!conversationId || !nextCursor || loadingMore) return;
    setLoadingMore(true);
    await dispatch(
      fetchMessageHistory({ conversationId, cursor: nextCursor }),
    );
    setLoadingMore(false);
  }, [conversationId, nextCursor, loadingMore, dispatch]);

  if (loadingMeta || !conversationId) {
    return (
      <motion.div className="flex justify-center items-center h-[calc(100dvh-3.5rem)]">
        <LoadingSpinner size="lg" />
      </motion.div>
    );
  }

  if (!meta || !user) {
    return null;
  }

  return (
    <motion.div
      className="h-[calc(100dvh-3.5rem)] max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <SEO title={`Chat — ${meta.other_party_name}`} noindex />

      <motion.div
        className="flex flex-col flex-1 min-h-0 bg-card rounded-2xl overflow-hidden border border-ink-900/[0.06] dark:border-zinc-700/60"
        style={{ boxShadow: 'var(--card-shadow)' }}
      >
        <header className="flex-shrink-0 px-4 sm:px-5 py-3.5 border-b border-ink-900/[0.06] dark:border-zinc-700/80 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <Link
              to="/messages"
              className="flex-shrink-0 p-2 -ml-1 rounded-xl text-ink-500 hover:text-ink-800 hover:bg-surface-50 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Back to inbox"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>

            <ChatAvatar
              src={meta.other_party_avatar_url}
              name={meta.other_party_name}
              size="lg"
            />

            <div className="flex-1 min-w-0">
              <h1 className="text-[16px] font-semibold text-ink-900 dark:text-zinc-100 truncate leading-tight">
                {meta.other_party_name}
              </h1>
              {meta.job_slug ? (
                <Link
                  to={`/jobs/${meta.job_slug}`}
                  className="inline-flex items-center gap-1 mt-0.5 text-[12px] text-primary-600 dark:text-primary-400 hover:underline truncate max-w-full"
                >
                  <BriefcaseIcon className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{meta.job_title}</span>
                </Link>
              ) : (
                <p className="text-[12px] text-ink-500 truncate mt-0.5">{meta.job_title}</p>
              )}
            </div>

            <ConnectionBadge isConnected={isConnected} />
          </div>
        </header>

        {isLoadingMessages && activeMessages.length === 0 ? (
          <motion.div className="flex-1 flex items-center justify-center bg-surface-50/80 dark:bg-zinc-900/40">
            <LoadingSpinner size="md" />
          </motion.div>
        ) : (
          <ChatMessageList
            key={conversationId}
            messages={activeMessages}
            currentUserId={user.id}
            otherPartyName={meta.other_party_name}
            typingUserId={typingUserId}
            hasMore={hasMoreMessages}
            onLoadMore={handleLoadMore}
            isLoadingMore={loadingMore}
          />
        )}

        <ChatComposer onSend={handleSend} onTyping={sendTyping} />
      </motion.div>
    </motion.div>
  );
}

function ConnectionBadge({ isConnected }: { isConnected: boolean }) {
  return (
    <motion.div
      className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${
        isConnected
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 ring-1 ring-emerald-500/20'
          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 ring-1 ring-amber-500/20'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
        }`}
      />
      {isConnected ? 'Live' : 'Connecting'}
    </motion.div>
  );
}
