import logging

from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, queue='applications')
def send_application_received_notification(self, application_id):
    """Notify employer about a new application."""
    from .models import Application

    try:
        application = Application.objects.select_related(
            'job', 'job__employer', 'job__employer__user', 'applicant'
        ).get(id=application_id)

        employer_user = application.job.employer.user
        applicant_name = application.applicant.get_full_name()

        from apps.notifications.tasks import create_notification
        create_notification.delay(
            user_id=str(employer_user.id),
            notification_type='APPLICATION_RECEIVED',
            title=f'New application for "{application.job.title}"',
            message=f'{applicant_name} has applied to your job posting "{application.job.title}".',
            related_object_id=str(application.id),
            related_content_type='application',
        )

        logger.info(
            f'Sent application notification for job {application.job.id} '
            f'to employer {employer_user.email}'
        )

    except Application.DoesNotExist:
        logger.warning(f'Application {application_id} not found.')
    except Exception as exc:
        logger.error(f'Error sending application notification: {exc}')
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3, queue='applications')
def send_application_status_notification(self, status_log_id):
    """Notify applicant about status change."""
    from .models import ApplicationStatusLog

    try:
        log = ApplicationStatusLog.objects.select_related(
            'application', 'application__job', 'application__applicant'
        ).get(id=status_log_id)

        application = log.application
        applicant = application.applicant

        status_display = dict(application.Status.choices).get(
            log.to_status, log.to_status
        )

        from apps.notifications.tasks import create_notification
        create_notification.delay(
            user_id=str(applicant.id),
            notification_type='APPLICATION_STATUS',
            title=f'Application status updated: {application.job.title}',
            message=f'Your application for "{application.job.title}" has been '
                    f'updated to: {status_display}.',
            related_object_id=str(application.id),
            related_content_type='application',
        )

        logger.info(
            f'Sent status change notification to {applicant.email} '
            f'for application {application.id}: {log.from_status} → {log.to_status}'
        )

    except ApplicationStatusLog.DoesNotExist:
        logger.warning(f'Status log {status_log_id} not found.')
    except Exception as exc:
        logger.error(f'Error sending status change notification: {exc}')
        raise self.retry(exc=exc, countdown=60)
