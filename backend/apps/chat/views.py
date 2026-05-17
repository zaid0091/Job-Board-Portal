from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from core.pagination import StandardResultsPagination
from core.permissions import IsConversationParticipant
from core.throttles import ChatMessageThrottle

from .models import Conversation, Message
from .serializers import (
    ChatMessageSerializer,
    ConversationDetailSerializer,
    ConversationInboxSerializer,
    MarkReadSerializer,
    OpenConversationSerializer,
    SendChatMessageSerializer,
)
from .services import (
    create_message,
    deliver_chat_message,
    inbox_queryset_for_user,
    notify_recipient_async,
    user_can_access_conversation,
)


class ConversationViewSet(viewsets.ReadOnlyModelViewSet):
    """Inbox and conversation metadata for chat participants."""

    permission_classes = [permissions.IsAuthenticated, IsConversationParticipant]
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        return inbox_queryset_for_user(self.request.user)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ConversationDetailSerializer
        return ConversationInboxSerializer

    @action(detail=False, methods=['post'], url_path='open')
    def open_conversation(self, request):
        """Get or create a conversation for an application."""
        serializer = OpenConversationSerializer(
            data=request.data,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        conversation = serializer.save()
        return Response(
            ConversationDetailSerializer(
                conversation,
                context={'request': request},
            ).data,
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=['get'], url_path='unread-count')
    def unread_count(self, request):
        total = 0
        for conv in self.get_queryset():
            from .services import unread_count_for_user
            total += unread_count_for_user(conv, request.user)
        return Response({'unread_count': total})

    def get_throttles(self):
        if self.action == 'messages' and self.request.method == 'POST':
            return [ChatMessageThrottle()]
        return super().get_throttles()

    @action(detail=True, methods=['get', 'post'], url_path='messages')
    def messages(self, request, pk=None):
        """GET: paginated history. POST: send a message (REST fallback for WebSocket)."""
        conversation = self.get_object()
        if request.method == 'POST':
            return self._send_message(request, conversation)
        page_size = min(int(request.query_params.get('page_size', 50)), 100)
        cursor = request.query_params.get('cursor')

        qs = conversation.messages.select_related('sender').order_by('-created_at')
        if cursor:
            parsed = parse_datetime(cursor)
            if parsed:
                if timezone.is_naive(parsed):
                    parsed = timezone.make_aware(parsed)
                qs = qs.filter(created_at__lt=parsed)

        batch = list(qs[: page_size + 1])
        has_more = len(batch) > page_size
        if has_more:
            batch = batch[:page_size]

        batch.reverse()
        next_cursor = batch[0].created_at.isoformat() if has_more and batch else None

        return Response({
            'results': ChatMessageSerializer(batch, many=True).data,
            'has_more': has_more,
            'next_cursor': next_cursor,
        })

    def _send_message(self, request, conversation):
        serializer = SendChatMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        client_id = serializer.validated_data.get('client_message_id')
        try:
            message = create_message(
                conversation,
                request.user,
                serializer.validated_data['text'],
                client_id=client_id,
            )
        except ValueError as exc:
            return Response(
                {'detail': str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        packet = deliver_chat_message(conversation, request.user, message)
        notify_recipient_async(request.user, conversation, message)
        return Response(packet['message'], status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='read')
    def mark_read(self, request, pk=None):
        conversation = self.get_object()
        serializer = MarkReadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        up_to_id = serializer.validated_data.get('up_to_message_id')
        when = timezone.now()
        if up_to_id:
            msg = conversation.messages.filter(id=up_to_id).first()
            if msg:
                when = msg.created_at

        conversation.set_last_read_at(request.user, when)
        return Response({'detail': 'Marked as read.', 'last_read_at': when.isoformat()})
