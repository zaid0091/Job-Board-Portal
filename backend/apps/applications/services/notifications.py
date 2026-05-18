import logging

from django.db import transaction

from apps.applications.models import Application

logger = logging.getLogger(__name__)


def build_applicant_status_notification_payload(status_log):
    """Build kwargs for create_notification from a status log entry."""
    application = status_log.application
    status_display = dict(Application.Status.choices).get(
        status_log.to_status,
        status_log.to_status,
    )
    return {
        'user_id': str(application.applicant_id),
        'notification_type': 'APPLICATION_STATUS',
        'title': f'Application status updated: {application.job.title}',
        'message': (
            f'Your application for "{application.job.title}" has been '
            f'updated to: {status_display}.'
        ),
        'related_object_id': str(application.id),
        'related_content_type': 'application',
    }


def notify_applicant_of_status_change(status_log):
    """
    Notify the seeker when an employer (or system) changes application status.
    Skips self-initiated withdrawals.
    """
    application = status_log.application
    if (
        status_log.changed_by_id is not None
        and status_log.changed_by_id == application.applicant_id
    ):
        return

    from apps.notifications.tasks import create_notification

    payload = build_applicant_status_notification_payload(status_log)

    def dispatch():
        try:
            create_notification.delay(**payload)
        except Exception as exc:
            logger.warning(
                'Celery unavailable for status notification, running inline: %s',
                exc,
            )
            create_notification(**payload)

    transaction.on_commit(dispatch)
