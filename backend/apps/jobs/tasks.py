import logging
from datetime import timedelta

from celery import shared_task
from django.utils import timezone

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, queue='jobs')
def expire_old_jobs(self):
    """Expire jobs that have passed their expiration date."""
    from .models import Job

    expired_jobs = Job.objects.filter(
        status=Job.Status.ACTIVE,
        expires_at__lt=timezone.now()
    )
    count = expired_jobs.update(status=Job.Status.EXPIRED)
    logger.info(f'Expired {count} jobs.')
    return count


@shared_task(bind=True, max_retries=3, queue='notifications')
def send_job_expiring_notification(self, job_id):
    """Send notification to employer when their job is about to expire."""
    from .models import Job

    try:
        job = Job.objects.select_related('employer', 'employer__user').get(id=job_id)

        if job.status != Job.Status.ACTIVE:
            return

        days_left = job.days_remaining
        if days_left is not None and days_left <= 3:
            from apps.notifications.tasks import create_notification
            create_notification.delay(
                user_id=str(job.employer.user.id),
                notification_type='JOB_EXPIRING',
                title=f'Your job "{job.title}" is expiring soon',
                message=f'Your job listing "{job.title}" will expire in {days_left} day(s). '
                        f'Consider renewing it to continue receiving applications.',
                related_object_id=str(job.id),
                related_content_type='job',
            )
            logger.info(f'Sent expiring notification for job {job.id}')

    except Job.DoesNotExist:
        logger.warning(f'Job {job_id} not found for expiring notification.')
    except Exception as exc:
        logger.error(f'Error sending expiring notification: {exc}')
        raise self.retry(exc=exc, countdown=60)


@shared_task(queue='jobs')
def send_job_match_emails():
    """Send emails to seekers when new jobs match their skills."""
    from .models import Job
    from apps.profiles.models import SeekerProfile

    # Get jobs posted in the last 24 hours
    recent_jobs = Job.objects.filter(
        status=Job.Status.ACTIVE,
        created_at__gte=timezone.now() - timedelta(hours=24)
    ).prefetch_related('skills_required')

    if not recent_jobs.exists():
        return 0

    notified_count = 0
    seekers = SeekerProfile.objects.filter(
        is_open_to_work=True
    ).prefetch_related('skills').select_related('user')

    for seeker in seekers:
        seeker_skills = set(seeker.skills.values_list('id', flat=True))
        if not seeker_skills:
            continue

        matching_jobs = []
        for job in recent_jobs:
            job_skills = set(job.skills_required.values_list('id', flat=True))
            if job_skills & seeker_skills:  # Intersection
                matching_jobs.append(job)

        if matching_jobs:
            # Send notification for each matching job
            for job in matching_jobs[:5]:
                from apps.notifications.tasks import create_notification
                create_notification.delay(
                    user_id=str(seeker.user.id),
                    notification_type='JOB_MATCH',
                    title=f'New job match: {job.title}',
                    message=f'{job.employer.company_name} posted a job matching your skills.',
                    related_object_id=str(job.id),
                    related_content_type='job',
                )
            notified_count += 1

    logger.info(f'Sent job match notifications to {notified_count} seekers.')
    return notified_count
