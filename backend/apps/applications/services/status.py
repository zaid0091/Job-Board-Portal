from apps.applications.models import Application, ApplicationStatusLog
from apps.applications.services.notifications import notify_applicant_of_status_change


def transition_application_status(application, *, new_status, changed_by, notes=''):
    """Update application status and append an audit log entry."""
    old_status = application.status
    application.status = new_status
    application.save(update_fields=['status', 'updated_at'])

    status_log = ApplicationStatusLog.objects.create(
        application=application,
        from_status=old_status,
        to_status=new_status,
        changed_by=changed_by,
        notes=notes,
    )
    notify_applicant_of_status_change(status_log)
    return application


def withdraw_application(application, *, changed_by):
    """Mark application as withdrawn with a standard log message."""
    return transition_application_status(
        application,
        new_status=Application.Status.WITHDRAWN,
        changed_by=changed_by,
        notes='Application withdrawn by applicant.',
    )
