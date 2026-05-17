from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from core.models import UUIDModel, TimeStampedModel


class Conversation(UUIDModel, TimeStampedModel):
    """One chat thread per job application (seeker + employer)."""

    application = models.OneToOneField(
        'applications.Application',
        on_delete=models.CASCADE,
        related_name='conversation',
    )
    last_message_at = models.DateTimeField(null=True, blank=True, db_index=True)
    seeker_last_read_at = models.DateTimeField(null=True, blank=True)
    employer_last_read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-last_message_at', '-created_at']
        indexes = [
            models.Index(fields=['-last_message_at']),
        ]

    def __str__(self):
        return f'Conversation for application {self.application_id}'

    def participant_user_ids(self):
        app = self.application
        return [
            str(app.applicant_id),
            str(app.job.employer.user_id),
        ]

    def is_participant(self, user):
        if not user or not user.is_authenticated:
            return False
        app = self.application
        if user.id == app.applicant_id:
            return True
        if hasattr(user, 'is_employer') and user.is_employer:
            return app.job.employer.user_id == user.id
        return user.is_admin if hasattr(user, 'is_admin') else False

    def last_read_at_for(self, user):
        app = self.application
        if user.id == app.applicant_id:
            return self.seeker_last_read_at
        if app.job.employer.user_id == user.id:
            return self.employer_last_read_at
        return timezone.now()

    def set_last_read_at(self, user, when=None):
        when = when or timezone.now()
        app = self.application
        if user.id == app.applicant_id:
            self.seeker_last_read_at = when
            self.save(update_fields=['seeker_last_read_at', 'updated_at'])
        elif app.job.employer.user_id == user.id:
            self.employer_last_read_at = when
            self.save(update_fields=['employer_last_read_at', 'updated_at'])


class Message(UUIDModel):
    """Chat message within a conversation."""

    MAX_TEXT_LENGTH = 4000

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages',
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chat_messages',
    )
    text = models.TextField()
    client_id = models.UUIDField(null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['conversation', 'created_at']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['conversation', 'client_id'],
                condition=models.Q(client_id__isnull=False),
                name='unique_client_message_per_conversation',
            ),
        ]

    def __str__(self):
        return f'Message {self.id} in {self.conversation_id}'
