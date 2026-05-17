import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import type { ConversationInboxItem } from '@/types';
import ChatAvatar from '@/components/chat/ChatAvatar';

interface ConversationListProps {
  conversations: ConversationInboxItem[];
}

export default function ConversationList({ conversations }: ConversationListProps) {
  return (
    <ul className="divide-y divide-ink-900/[0.06] dark:divide-ink-300/[0.08]">
      {conversations.map((conv) => {
        const unread = conv.unread_count > 0;

        return (
          <li key={conv.id}>
            <Link
              to={`/messages/${conv.id}`}
              className="flex items-start gap-4 px-4 py-4 hover:bg-surface-50/80 dark:hover:bg-zinc-900/50 transition-colors"
            >
              <ChatAvatar
                src={conv.other_party_avatar_url}
                name={conv.other_party_name}
                unread={unread}
              />
              <ConversationBody conv={conv} unread={unread} />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function ConversationBody({
  conv,
  unread,
}: {
  conv: ConversationInboxItem;
  unread: boolean;
}) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[14px] font-semibold text-ink-900 truncate">
          {conv.other_party_name}
        </p>
        {conv.last_message_at && (
          <span className="text-micro text-ink-400 flex-shrink-0">
            {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
          </span>
        )}
      </div>
      <p className="text-[12px] text-ink-500 truncate mt-0.5">{conv.job_title}</p>
      {conv.last_message_preview && (
        <p className="text-[13px] text-ink-600 truncate mt-1">{conv.last_message_preview}</p>
      )}
      {unread && (
        <span className="inline-flex mt-1.5 items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-primary-600 text-white text-micro font-medium">
          {conv.unread_count > 99 ? '99+' : conv.unread_count}
        </span>
      )}
    </div>
  );
}
