import logging
from celery import shared_task

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def send_welcome_email_task(self, to_email, username):
    """
    Background task to send a welcome email to a new user.
    """
    logger.info(f"Starting welcome email task for {to_email}")
    try:
        from core.email_services import send_welcome_email
        success = send_welcome_email(to_email, username)
        if not success:
            logger.error(f"send_welcome_email returned False for {to_email}")
            raise Exception("Email service returned False")
        logger.info(f"Welcome email task completed successfully for {to_email}")
        return True
    except Exception as exc:
        logger.error(f"Error sending welcome email to {to_email}: {exc}")
        raise self.retry(exc=exc, countdown=60)

@shared_task
def cleanup_expired_tokens():
    """
    Delete expired password reset tokens from the database.
    Runs periodically via Celery Beat.
    """
    from .models import PasswordResetToken
    from django.utils import timezone
    
    deleted_count, _ = PasswordResetToken.objects.filter(
        expires_at__lt=timezone.now()
    ).delete()
    
    logger.info(f"Deleted {deleted_count} expired password reset tokens.")
    return deleted_count
