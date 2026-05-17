import logging

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models import Prefetch
from django.utils import timezone

from core.sanitizers import strip_all_html

from .models import Conversation, Message

logger = logging.getLogger(__name__)


def get_conversation_for_user(conversation_id):
    return (
        Conversation.objects.select_related(
            'application',
            'application__applicant',
            'application__applicant__seeker_profile',
            'application__job',
            'application__job__employer',
            'application__job__employer__user',
        )
        .filter(id=conversation_id)
        .first()
    )


def user_can_access_conversation(conversation, user):
    return conversation is not None and conversation.is_participant(user)


def get_or_create_conversation(application):
    conversation, _ = Conversation.objects.get_or_create(application=application)
    return conversation


def unread_count_for_user(conversation, user):
    last_read = conversation.last_read_at_for(user)
    qs = conversation.messages.exclude(sender=user)
    if last_read:
        qs = qs.filter(created_at__gt=last_read)
    return qs.count()


def inbox_queryset_for_user(user):
    base = Conversation.objects.select_related(
        'application',
        'application__applicant',
        'application__applicant__seeker_profile',
        'application__job',
        'application__job__employer',
        'application__job__employer__user',
    ).prefetch_related(
        Prefetch(
            'messages',
            queryset=Message.objects.select_related('sender').order_by('-created_at')[:1],
            to_attr='_latest_message_list',
        )
    )

    if user.is_seeker:
        return base.filter(application__applicant=user)
    if user.is_employer:
        return base.filter(application__job__employer__user=user)
    if user.is_admin:
        return base
    return Conversation.objects.none()


def sanitize_message_text(text: str) -> str:
    cleaned = strip_all_html(text or '')
    return cleaned[: Message.MAX_TEXT_LENGTH]


def create_message(conversation, sender, text, client_id=None):
    text = sanitize_message_text(text)
    if not text:
        raise ValueError('Message text cannot be empty')

    if client_id:
        existing = Message.objects.filter(
            conversation=conversation,
            client_id=client_id,
        ).first()
        if existing:
            return existing

    message = Message.objects.create(
        conversation=conversation,
        sender=sender,
        text=text,
        client_id=client_id,
    )
    conversation.last_message_at = message.created_at
    conversation.save(update_fields=['last_message_at', 'updated_at'])
    return message


def recipient_user_id_for_sender(conversation, sender):
    app = conversation.application
    if sender.id == app.applicant_id:
        return app.job.employer.user_id
    return app.applicant_id


def broadcast_chat_packet(conversation_id, packet):
    """Push a chat.message packet to everyone in the conversation room."""
    channel_layer = get_channel_layer()
    if channel_layer is None:
        logger.warning('No channel layer configured; chat broadcast skipped')
        return
    async_to_sync(channel_layer.group_send)(
        f'chat_{conversation_id}',
        {
            'type': 'chat.message.event',
            'data': packet,
        },
    )


def push_chat_inbox_update(recipient_user_id, conversation_id, packet):
    """Notify a user on their notifications WebSocket (inbox list / badge)."""
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return
    async_to_sync(channel_layer.group_send)(
        f'notifications_{recipient_user_id}',
        {
            'type': 'notification_event',
            'data': {
                'type': 'chat.inbox_update',
                'conversation_id': str(conversation_id),
                'message': packet['message'],
            },
        },
    )


def deliver_chat_message(conversation, sender, message):
    """Broadcast to room participants and push inbox update to the other party."""
    packet = message_to_packet(message)
    broadcast_chat_packet(conversation.id, packet)
    recipient_id = recipient_user_id_for_sender(conversation, sender)
    push_chat_inbox_update(recipient_id, conversation.id, packet)
    return packet


def message_to_packet(message):
    ts = message.created_at.isoformat()
    if ts.endswith('+00:00'):
        ts = ts[:-6] + 'Z'
    return {
        'type': 'chat.message',
        'message': {
            'id': str(message.id),
            'sender_id': str(message.sender_id),
            'timestamp': ts,
            'text': message.text,
            **(
                {'client_id': str(message.client_id)}
                if message.client_id
                else {}
            ),
        },
    }


def notify_recipient_async(sender, conversation, message):
    from apps.notifications.tasks import create_notification

    app = conversation.application
    if sender.id == app.applicant_id:
        recipient_id = str(app.job.employer.user_id)
        title = 'New message from applicant'
    else:
        recipient_id = str(app.applicant_id)
        title = 'New message from employer'

    preview = message.text[:120] + ('…' if len(message.text) > 120 else '')
    create_notification.delay(
        user_id=recipient_id,
        notification_type='CHAT_MESSAGE',
        title=title,
        message=preview,
        related_object_id=str(conversation.id),
        related_content_type='chat.conversation',
    )
