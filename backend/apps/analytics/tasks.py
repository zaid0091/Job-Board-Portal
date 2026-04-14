import logging

from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(queue='analytics')
def generate_weekly_report():
    """Generate weekly analytics report."""
    from django.contrib.auth import get_user_model
    from apps.jobs.models import Job
    from apps.applications.models import Application
    from django.utils import timezone
    from datetime import timedelta

    User = get_user_model()

    week_ago = timezone.now() - timedelta(days=7)

    stats = {
        'new_users': User.objects.filter(date_joined__gte=week_ago).count(),
        'new_jobs': Job.objects.filter(created_at__gte=week_ago).count(),
        'new_applications': Application.objects.filter(created_at__gte=week_ago).count(),
        'active_jobs': Job.objects.filter(status=Job.Status.ACTIVE).count(),
    }

    logger.info(f'Weekly report: {stats}')
    return stats
