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
    """
    Send emails to seekers when new jobs match their skills.
    Optimized to use a single database query with joins for scalability.
    """
    from .models import Job
    from apps.profiles.models import SeekerProfile
    from itertools import groupby
    from operator import itemgetter

    # Get jobs posted in the last 24 hours
    recent_jobs = Job.objects.filter(
        status=Job.Status.ACTIVE,
        created_at__gte=timezone.now() - timedelta(hours=24)
    )

    if not recent_jobs.exists():
        return 0

    # Optimized Query: Find all matches in one go using DB-level joins.
    # We select seekers open to work who have skills matching the required skills of recent jobs.
    matches = SeekerProfile.objects.filter(
        is_open_to_work=True,
        skills__jobs__in=recent_jobs
    ).values(
        'user_id',
        'user__email',
        'skills__jobs__id',
        'skills__jobs__title',
        'skills__jobs__employer__company_name'
    ).order_by('user_id', 'skills__jobs__created_at').distinct()

    if not matches.exists():
        return 0

    notified_count = 0
    # Group results by user_id to process notifications per seeker
    for user_id, user_matches in groupby(matches, key=itemgetter('user_id')):
        user_matches_list = list(user_matches)
        user_email = user_matches_list[0]['user__email']
        
        # Limit to 5 most recent job matches to avoid notification fatigue
        for match in user_matches_list[:5]:
            from apps.notifications.tasks import create_notification
            create_notification.delay(
                user_id=str(user_id),
                notification_type='JOB_MATCH',
                title=f'New job match: {match["skills__jobs__title"]}',
                message=f'{match["skills__jobs__employer__company_name"]} posted a job matching your skills.',
                related_object_id=str(match["skills__jobs__id"]),
                related_content_type='job',
            )
        
        notified_count += 1
        logger.debug(f'Queued match notifications for seeker: {user_email}')

    logger.info(f'Sent job match notifications to {notified_count} seekers.')
    return notified_count


@shared_task(queue='jobs')
def sync_job_views():
    """
    Sync job view counts from Redis buffer to Database.
    This task should be scheduled to run every 5-10 minutes.
    """
    from .models import Job
    from django.core.cache import cache
    from django.db.models import F

    # Find all buffered view keys
    # Key prefix is handled by django-redis, but we need to match our custom suffix
    # The actual keys in redis will be "jobboard:view_buffer:*"
    # cache.keys() returns keys WITHOUT the KEY_PREFIX (jobboard)
    buffer_keys = cache.keys("view_buffer:*")
    
    if not buffer_keys:
        return "No views to sync."

    sync_count = 0
    for key in buffer_keys:
        try:
            # Extract job ID from key "view_buffer:ID"
            job_id = key.split(':')[-1]
            
            # Get the count and reset it in one transaction if possible,
            # but since we're using a task, we'll just get and delete.
            # Using cache.pop() or similar if available, or get + delete.
            views_to_add = cache.get(key)
            
            if views_to_add and int(views_to_add) > 0:
                # Update DB
                updated = Job.objects.filter(id=job_id).update(
                    views_count=F('views_count') + int(views_to_add)
                )
                if updated:
                    sync_count += 1
                    # Remove from cache after successful DB update
                    cache.delete(key)
        except Exception as e:
            logger.error(f"Error syncing views for key {key}: {e}")

    logger.info(f"Synced view counts for {sync_count} jobs from Redis to DB.")
    return f"Synced {sync_count} jobs."
