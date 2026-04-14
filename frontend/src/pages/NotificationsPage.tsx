import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchNotifications, markAllRead } from '@/store/slices/notificationsSlice';
import { notificationsAPI } from '@/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import SEO from '@/components/SEO';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const { notifications, isLoading } = useAppSelector((state) => state.notifications);

  const items = notifications?.results ?? [];

  useEffect(() => {
    dispatch(fetchNotifications(1));
  }, [dispatch]);

  const handleMarkAllRead = async () => {
    // Optimistic update: mark all as read in UI immediately
    const prev = items.map((n) => ({ ...n }));
    const newItems = items.map((n) => ({ ...n, is_read: true }));
    dispatch({ type: 'notifications/fakeOptimistic', payload: newItems });
    try {
      await dispatch(markAllRead()).unwrap();
    } catch {
      dispatch({ type: 'notifications/fakeOptimistic', payload: prev });
      toast.error('Failed to mark all as read');
    }
  };

  const handleMarkRead = async (id: string) => {
    // Optimistic update: mark as read in UI immediately
    const prev = items.find((n) => n.id === id)?.is_read;
    if (prev) return; // already read
    const newItems = items.map((n) => n.id === id ? { ...n, is_read: true } : n);
    dispatch({ type: 'notifications/fakeOptimistic', payload: newItems });
    try {
      await notificationsAPI.markAsRead(id);
    } catch {
      // revert
      dispatch(fetchNotifications(1));
      toast.error('Failed to mark as read');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <SEO title="Notifications" />
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-display-sm text-ink-900">Notifications</h1>
        {items.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-[13px] text-primary-600 hover:text-primary-500 font-medium transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="You're all caught up! We'll notify you when something important happens."
        />
      ) : (
        <div className="space-y-3">
          {items.map((notification) => (
            <div
              key={notification.id}
              className={`bg-card rounded-xl p-4 sm:p-5 cursor-pointer transition-all duration-200 ease-spring ${
                !notification.is_read ? 'border-l-[3px] border-l-primary-500' : ''
              }`}
              style={{ boxShadow: 'var(--card-shadow)' }}
              onClick={() => !notification.is_read && handleMarkRead(notification.id)}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
