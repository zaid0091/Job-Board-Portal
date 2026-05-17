from rest_framework import serializers

from apps.applications.models import Application

from .models import Conversation, Message
from .services import get_or_create_conversation, unread_count_for_user


class ChatMessageSerializer(serializers.ModelSerializer):
    """Message history for REST; sender_id comes from the model FK column."""

    timestamp = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender_id', 'timestamp', 'text', 'client_id']
        read_only_fields = fields


class ConversationInboxSerializer(serializers.ModelSerializer):
    application_id = serializers.UUIDField(source='application.id', read_only=True)
    job_title = serializers.CharField(source='application.job.title', read_only=True)
    job_slug = serializers.CharField(source='application.job.slug', read_only=True)
    other_party_name = serializers.SerializerMethodField()
    other_party_id = serializers.SerializerMethodField()
    other_party_avatar_url = serializers.SerializerMethodField()
    last_message_preview = serializers.SerializerMethodField()
    last_message_at = serializers.DateTimeField(read_only=True)
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id',
            'application_id',
            'job_title',
            'job_slug',
            'other_party_name',
            'other_party_id',
            'other_party_avatar_url',
            'last_message_preview',
            'last_message_at',
            'unread_count',
            'created_at',
        ]

    def _absolute_media_url(self, file_field):
        if not file_field:
            return None
        url = file_field.url
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(url)
        return url

    def get_other_party_avatar_url(self, obj):
        user = self.context['request'].user
        app = obj.application
        if user.id == app.applicant_id:
            return self._absolute_media_url(app.job.employer.company_logo)
        if hasattr(app.applicant, 'seeker_profile'):
            return self._absolute_media_url(app.applicant.seeker_profile.avatar)
        return None

    def get_other_party_name(self, obj):
        user = self.context['request'].user
        app = obj.application
        if user.id == app.applicant_id:
            return app.job.employer.company_name
        return app.applicant.get_full_name() or app.applicant.username or app.applicant.email

    def get_other_party_id(self, obj):
        user = self.context['request'].user
        app = obj.application
        if user.id == app.applicant_id:
            return str(app.job.employer.user_id)
        return str(app.applicant_id)

    def get_last_message_preview(self, obj):
        latest = getattr(obj, '_latest_message_list', None)
        if latest:
            msg = latest[0]
            text = msg.text
            return text[:100] + ('…' if len(text) > 100 else '')
        return ''

    def get_unread_count(self, obj):
        return unread_count_for_user(obj, self.context['request'].user)


class ConversationDetailSerializer(ConversationInboxSerializer):
    participants = serializers.SerializerMethodField()
    seeker_id = serializers.UUIDField(source='application.applicant_id', read_only=True)
    employer_user_id = serializers.UUIDField(
        source='application.job.employer.user_id',
        read_only=True,
    )

    class Meta(ConversationInboxSerializer.Meta):
        fields = ConversationInboxSerializer.Meta.fields + [
            'participants',
            'seeker_id',
            'employer_user_id',
        ]

    def get_participants(self, obj):
        return obj.participant_user_ids()


class OpenConversationSerializer(serializers.Serializer):
    application_id = serializers.UUIDField()

    def validate_application_id(self, value):
        user = self.context['request'].user
        try:
            application = Application.objects.select_related(
                'job__employer__user',
                'applicant',
            ).get(id=value)
        except Application.DoesNotExist:
            raise serializers.ValidationError('Application not found.')

        if user.is_seeker and application.applicant_id != user.id:
            raise serializers.ValidationError('Not your application.')
        if user.is_employer and application.job.employer.user_id != user.id:
            raise serializers.ValidationError('Not your application.')
        if not user.is_seeker and not user.is_employer and not user.is_admin:
            raise serializers.ValidationError('Access denied.')

        self.context['application'] = application
        return value

    def create(self, validated_data):
        application = self.context['application']
        return get_or_create_conversation(application)


class MarkReadSerializer(serializers.Serializer):
    up_to_message_id = serializers.UUIDField(required=False)
