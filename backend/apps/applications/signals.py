import logging

from django.core.cache import cache
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from .models import Application, ApplicationStatusLog

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Application)
def notify_on_new_application(sender, instance, created, **kwargs):
    """Notify employer when a new application is received."""
    if created:
        # Invalidate platform stats and dashboard caches
        cache.delete('platform_stats')
        try:
            cache.delete(f'seeker_dashboard_{instance.applicant_id}')
            cache.delete(f'employer_dashboard_{instance.job.employer.user_id}')
        except Exception:
            pass

        try:
            from apps.applications.tasks import send_application_received_notification
            send_application_received_notification.delay(str(instance.id))
        except Exception as e:
            logger.warning('Failed to queue application notification: %s', e)


@receiver(post_delete, sender=Application)
def invalidate_cache_on_application_delete(sender, instance, **kwargs):
    """Invalidate caches when an application is deleted."""
    cache.delete('platform_stats')
    try:
        cache.delete(f'seeker_dashboard_{instance.applicant_id}')
    except Exception:
        pass


@receiver(post_save, sender=ApplicationStatusLog)
def notify_on_status_change(sender, instance, created, **kwargs):
    """Notify applicant when their application status changes."""
    if created:
        # Invalidate dashboard caches on status change
        try:
            cache.delete(f'seeker_dashboard_{instance.application.applicant_id}')
            cache.delete(f'employer_dashboard_{instance.application.job.employer.user_id}')
        except Exception:
            pass

        try:
            from apps.applications.tasks import send_application_status_notification
            send_application_status_notification.delay(str(instance.id))
        except Exception as e:
            logger.warning('Failed to queue status change notification: %s', e)
