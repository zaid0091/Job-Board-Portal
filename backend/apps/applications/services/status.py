from apps.applications.models import Application, ApplicationStatusLog


def transition_application_status(application, *, new_status, changed_by, notes=''):
    """Update application status and append an audit log entry."""
    old_status = application.status
    application.status = new_status
    application.save(update_fields=['status', 'updated_at'])

    ApplicationStatusLog.objects.create(
        application=application,
        from_status=old_status,
        to_status=new_status,
        changed_by=changed_by,
        notes=notes,
    )
    return application


def withdraw_application(application, *, changed_by):
    """Mark application as withdrawn with a standard log message."""
    return transition_application_status(
        application,
        new_status=Application.Status.WITHDRAWN,
        changed_by=changed_by,
        notes='Application withdrawn by applicant.',
    )
