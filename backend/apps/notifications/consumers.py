import json
import logging

from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async

logger = logging.getLogger(__name__)


class NotificationConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket consumer for real-time notifications.

    Clients connect to: ws://host/ws/notifications/
    Each user is placed in a group named 'notifications_{user_id}'.
    When a new notification is created, it's pushed to that group.
    """

    async def connect(self):
        user = self.scope.get('user')

        if not user or not user.is_authenticated:
            logger.warning('WebSocket connection rejected: unauthenticated')
            await self.close(code=4001)
            return

        self.user_id = str(user.id)
        self.group_name = f'notifications_{self.user_id}'

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        logger.info(f'WebSocket connected: user {user.email} ({self.user_id})')

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            logger.info(f'WebSocket disconnected: user {self.user_id}')

    async def notification_event(self, event):
        """
        Called when a notification is pushed to this user's group.
        Sends the notification data as JSON to the WebSocket.
        """
        await self.send_json(event['data'])

    async def heartbeat(self, event):
        """Respond to server-initiated heartbeat pings."""
        await self.send_json({'type': 'heartbeat'})


@database_sync_to_async
def get_notification_data(notification_id):
    """Fetch notification data from DB for pushing over WebSocket."""
    from apps.notifications.models import Notification
    from apps.notifications.serializers import NotificationSerializer

    try:
        notification = Notification.objects.select_related('user').get(id=notification_id)
        serializer = NotificationSerializer(notification)
        return serializer.data
    except Notification.DoesNotExist:
        return None
