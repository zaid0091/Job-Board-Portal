import logging

from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Application, ApplicationStatusLog

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Application)
def notify_on_new_application(sender, instance, created, **kwargs):
    """Notify employer when a new application is received."""
    if created:
        try:
            from apps.applications.tasks import send_application_received_notification
            send_application_received_notification.delay(str(instance.id))
        except Exception as e:
            logger.warning('Failed to queue application notification: %s', e)


@receiver(post_save, sender=ApplicationStatusLog)
def notify_on_status_change(sender, instance, created, **kwargs):
    """Notify applicant when their application status changes."""
    if created:
        try:
            from apps.applications.tasks import send_application_status_notification
            send_application_status_notification.delay(str(instance.id))
        except Exception as e:
            logger.warning('Failed to queue status change notification: %s', e)
