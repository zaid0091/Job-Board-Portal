import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchNotifications, markAllRead } from '@/store/slices/notificationsSlice';
import { notificationsAPI } from '@/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import SEO from '@/components/SEO';
import toast from 'react-hot-toast';
import NotificationItem from '@/components/notifications/NotificationItem';

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const { notifications, isLoading } = useAppSelector((state) => state.notifications);

  const items = notifications?.results ?? [];

  useEffect(() => {
    dispatch(fetchNotifications(1));
  }, [dispatch]);

  const handleMarkAllRead = useCallback(async () => {
    const prev = items.map((n) => ({ ...n }));
    const newItems = items.map((n) => ({ ...n, is_read: true }));
    dispatch({ type: 'notifications/fakeOptimistic', payload: newItems });
    try {
      await dispatch(markAllRead()).unwrap();
    } catch {
      dispatch({ type: 'notifications/fakeOptimistic', payload: prev });
      toast.error('Failed to mark all as read');
    }
  }, [items, dispatch]);

  const handleMarkRead = useCallback(async (id: string) => {
    const newItems = items.map((n) =>
      n.id === id ? { ...n, is_read: true } : n
    );
    dispatch({ type: 'notifications/fakeOptimistic', payload: newItems });
    try {
      await notificationsAPI.markAsRead(id);
    } catch {
      dispatch(fetchNotifications(1));
      toast.error('Failed to mark as read');
    }
  }, [items, dispatch]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <SEO title="Notifications" noindex />
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
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkRead={handleMarkRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}
