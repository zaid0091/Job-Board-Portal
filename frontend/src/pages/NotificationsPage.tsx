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
    <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
      <SEO title="Notifications" noindex />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-10 bg-primary-500 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.4)]" />
          <div>
            <h1 className="text-display-md font-black text-ink-900 dark:text-white tracking-tight">
              Activity <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent italic">Stream</span>
            </h1>
            <p className="text-sm text-ink-400 mt-1 uppercase tracking-widest font-bold">
              Stay updated with your latest interactions
            </p>
          </div>
        </div>
        {items.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-ink-700 dark:text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-all hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200/50 dark:border-zinc-700/50"
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
