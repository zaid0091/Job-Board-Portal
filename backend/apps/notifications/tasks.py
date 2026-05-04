import logging

from celery import shared_task
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, queue='notifications')
def create_notification(self, user_id, notification_type, title, message,
                        related_object_id=None, related_content_type=None):
    """Create a notification for a user and push it over WebSocket."""
    from .models import Notification
    from .serializers import NotificationSerializer
    from django.contrib.auth import get_user_model
    from asgiref.sync import async_to_sync
    from channels.layers import get_channel_layer

    User = get_user_model()

    try:
        user = User.objects.get(id=user_id)
        notification = Notification.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message,
            related_object_id=related_object_id,
            related_content_type=related_content_type,
        )
        logger.info(f'Created notification for user {user.email}: {title}')

        # Push notification over WebSocket
        try:
            serializer = NotificationSerializer(notification)
            channel_layer = get_channel_layer()
            group_name = f'notifications_{user_id}'
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'notification_event',
                    'data': {
                        'type': 'new_notification',
                        'notification': serializer.data,
                    },
                },
            )
        except Exception as ws_exc:
            logger.warning(f'Failed to push notification over WebSocket: {ws_exc}')

    except User.DoesNotExist:
        logger.warning(f'User {user_id} not found for notification.')
    except Exception as exc:
        logger.error(f'Error creating notification: {exc}')
        raise self.retry(exc=exc, countdown=60)


@shared_task(queue='notifications')
def cleanup_old_notifications():
    """Remove notifications older than 90 days."""
    from .models import Notification

    cutoff = timezone.now() - timedelta(days=90)
    count, _ = Notification.objects.filter(created_at__lt=cutoff).delete()
    logger.info(f'Cleaned up {count} old notifications.')
    return count
