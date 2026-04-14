from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

from core.models import UUIDModel, TimeStampedModel


class Notification(UUIDModel, TimeStampedModel):
    """User notification model."""

    class Type(models.TextChoices):
        APPLICATION_RECEIVED = 'APPLICATION_RECEIVED', _('Application Received')
        APPLICATION_STATUS = 'APPLICATION_STATUS', _('Application Status Change')
        JOB_MATCH = 'JOB_MATCH', _('Job Match')
        JOB_EXPIRING = 'JOB_EXPIRING', _('Job Expiring')
        PROFILE_VIEW = 'PROFILE_VIEW', _('Profile Viewed')
        WELCOME = 'WELCOME', _('Welcome')
        SYSTEM = 'SYSTEM', _('System')

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(
        max_length=30,
        choices=Type.choices,
        db_index=True
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False, db_index=True)

    # Generic relation to related object
    related_object_id = models.CharField(max_length=255, blank=True, null=True)
    related_content_type = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read', '-created_at']),
            models.Index(fields=['user', 'notification_type']),
        ]

    def __str__(self):
        return f'{self.user.email}: {self.title}'
