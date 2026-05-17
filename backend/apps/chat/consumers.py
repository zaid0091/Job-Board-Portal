import logging
import uuid

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer

from .services import (
    create_message,
    get_conversation_for_user,
    message_to_packet,
    notify_recipient_async,
    user_can_access_conversation,
)

logger = logging.getLogger(__name__)

MAX_TEXT_LENGTH = 4000


class ChatConsumer(AsyncJsonWebsocketConsumer):
    """
    Room-scoped WebSocket for seeker–employer chat.

    Connect: ws/chat/<conversation_id>/
  Lifecycle: connect (chat.connected) → exchange (chat.message) → disconnect
    """

    async def connect(self):
        user = self.scope.get('user')
        if not user or not user.is_authenticated:
            await self.close(code=4001)
            return

        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.user = user

        conversation = await self._get_conversation()
        if not conversation or not await self._is_participant(conversation):
            await self.close(code=4003)
            return

        self.conversation = conversation
        self.group_name = f'chat_{self.conversation_id}'

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        last_read = await self._last_read_at(conversation)
        await self.send_json({
            'type': 'chat.connected',
            'conversation_id': str(self.conversation_id),
            'participants': conversation.participant_user_ids(),
            'last_read_at': last_read.isoformat() if last_read else None,
        })
        logger.info('Chat WS connected: user %s conversation %s', user.id, self.conversation_id)

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            logger.info(
                'Chat WS disconnected: user %s conversation %s code=%s',
                getattr(self.user, 'id', '?'),
                getattr(self, 'conversation_id', '?'),
                close_code,
            )

    async def receive_json(self, content, **kwargs):
        msg_type = content.get('type')

        if msg_type == 'chat.message':
            await self._handle_chat_message(content)
        elif msg_type == 'chat.typing':
            await self._handle_typing(content)
        else:
            await self.send_json({
                'type': 'chat.error',
                'code': 'invalid_payload',
                'message': f'Unknown message type: {msg_type}',
            })

    async def _handle_chat_message(self, content):
        text = (content.get('text') or '').strip()
        if not text:
            await self.send_json({
                'type': 'chat.error',
                'code': 'empty_message',
                'message': 'Message text cannot be empty.',
            })
            return

        if len(text) > MAX_TEXT_LENGTH:
            await self.send_json({
                'type': 'chat.error',
                'code': 'message_too_long',
                'message': f'Message exceeds {MAX_TEXT_LENGTH} characters.',
            })
            return

        client_id = content.get('client_message_id')
        if client_id:
            try:
                client_id = uuid.UUID(str(client_id))
            except (ValueError, TypeError):
                client_id = None

        try:
            message = await self._create_message(text, client_id)
        except ValueError as exc:
            await self.send_json({
                'type': 'chat.error',
                'code': 'invalid_message',
                'message': str(exc),
            })
            return

        packet = await self._message_packet(message)
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat.message.event',
                'data': packet,
            },
        )

        await self._notify_recipient(message)

    async def _handle_typing(self, content):
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat.typing.event',
                'data': {
                    'type': 'chat.typing',
                    'sender_id': str(self.user.id),
                    'is_typing': bool(content.get('is_typing', True)),
                },
            },
        )

    async def chat_message_event(self, event):
        await self.send_json(event['data'])

    async def chat_typing_event(self, event):
        data = event['data']
        if data.get('sender_id') != str(self.user.id):
            await self.send_json(data)

    @database_sync_to_async
    def _get_conversation(self):
        return get_conversation_for_user(self.conversation_id)

    @database_sync_to_async
    def _is_participant(self, conversation):
        return user_can_access_conversation(conversation, self.user)

    @database_sync_to_async
    def _last_read_at(self, conversation):
        return conversation.last_read_at_for(self.user)

    @database_sync_to_async
    def _create_message(self, text, client_id):
        return create_message(self.conversation, self.user, text, client_id=client_id)

    @database_sync_to_async
    def _message_packet(self, message):
        return message_to_packet(message)

    @database_sync_to_async
    def _notify_recipient(self, message):
        notify_recipient_async(self.user, self.conversation, message)
