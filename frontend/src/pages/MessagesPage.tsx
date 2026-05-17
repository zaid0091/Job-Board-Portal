import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchConversations, fetchChatUnreadCount } from '@/store/slices/chatSlice';
import ConversationList from '@/components/chat/ConversationList';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import SEO from '@/components/SEO';

export default function MessagesPage() {
  const dispatch = useAppDispatch();
  const { inbox, isLoadingInbox } = useAppSelector((state) => state.chat);

  useEffect(() => {
    dispatch(fetchConversations(1));
    dispatch(fetchChatUnreadCount());
  }, [dispatch]);

  const conversations = inbox?.results ?? [];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <SEO title="Messages" noindex />
      <div className="flex items-center gap-4 mb-8">
        <div className="w-1.5 h-10 bg-primary-500 rounded-full" />
        <div>
          <h1 className="text-display-sm text-ink-900">Messages</h1>
          <p className="text-[13px] text-ink-500 mt-0.5">
            Chat with employers and candidates about your applications
          </p>
        </div>
      </div>

      {isLoadingInbox ? (
        <LoadingCenter />
      ) : conversations.length === 0 ? (
        <EmptyState
          title="No conversations yet"
          description="Start a conversation from one of your job applications."
        />
      ) : (
        <div
          className="bg-card rounded-xl overflow-hidden"
          style={{ boxShadow: 'var(--card-shadow)' }}
        >
          <ConversationList conversations={conversations} />
        </div>
      )}
    </div>
  );
}

function LoadingCenter() {
  return (
    <div className="flex justify-center py-20">
      <LoadingSpinner size="lg" />
    </div>
  );
}
