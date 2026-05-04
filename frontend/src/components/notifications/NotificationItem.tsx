import { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import type { Notification } from '@/types';

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

function getNotificationLink(notification: Notification): string | null {
  if (!notification.related_object_id) return null;

  switch (notification.related_content_type) {
    case 'application':
      return '/seeker/applications';
    case 'job':
      return `/jobs/${notification.related_object_id}`;
    case 'job_application':
      return '/employer/applications';
    default:
      return null;
  }
}

const NotificationItem = memo(function NotificationItem({
  notification,
  onMarkRead,
}: NotificationItemProps) {
  const navigate = useNavigate();
  const link = getNotificationLink(notification);

  const handleClick = useCallback(() => {
    if (!notification.is_read) {
      onMarkRead(notification.id);
    }
    if (link) {
      navigate(link);
    }
  }, [notification.is_read, notification.id, onMarkRead, link, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      whileHover={link ? { scale: 1.01, x: 4 } : undefined}
      className={`bg-card rounded-xl p-4 sm:p-5 transition-all duration-200 ease-spring ${
        !notification.is_read ? 'border-l-[3px] border-l-primary-500' : ''
      } ${link ? 'cursor-pointer hover:bg-surface-50/50' : ''}`}
      style={{ boxShadow: 'var(--card-shadow)' }}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p
            className={`text-[13px] ${
              !notification.is_read ? 'font-semibold text-ink-900' : 'text-ink-600'
            }`}
          >
            {notification.title}
          </p>
          <p className="text-[13px] text-ink-500 mt-1">{notification.message}</p>
        </div>
        <span className="text-micro text-ink-400 whitespace-nowrap ml-4">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </span>
      </div>
    </motion.div>
  );
});

export default NotificationItem;
