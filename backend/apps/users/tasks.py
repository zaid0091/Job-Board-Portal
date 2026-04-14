from celery import shared_task
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_welcome_email(self, user_id):
    """Send welcome email to newly registered user."""
    from django.contrib.auth import get_user_model
    User = get_user_model()

    try:
        user = User.objects.get(id=user_id)
        subject = 'Welcome to JobBoard!'
        html_message = render_to_string('emails/welcome.html', {
            'user': user,
            'site_url': settings.FRONTEND_URL,
        })

        send_mail(
            subject=subject,
            message='',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )

        logger.info(f'Welcome email sent to {user.email}')

    except User.DoesNotExist:
        logger.error(f'User {user_id} not found for welcome email')
    except Exception as exc:
        logger.error(f'Failed to send welcome email: {str(exc)}')
        raise self.retry(exc=exc)


@shared_task
def cleanup_expired_tokens():
    """Remove expired JWT tokens from the database."""
    from rest_framework_simplejwt.token_blacklist.models import OutstandingToken

    now = timezone.now()
    expired_tokens = OutstandingToken.objects.filter(expires_at__lt=now)
    count = expired_tokens.count()
    expired_tokens.delete()
    logger.info(f'Cleaned up {count} expired tokens')
