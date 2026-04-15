import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')

app = Celery('jobboard')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Periodic Tasks
app.conf.beat_schedule = {
    'expire-old-jobs': {
        'task': 'apps.jobs.tasks.expire_old_jobs',
        'schedule': crontab(hour=0, minute=0),
    },
    'send-job-match-notifications': {
        'task': 'apps.notifications.tasks.send_job_match_emails',
        'schedule': crontab(hour=9, minute=0),
    },
    'cleanup-expired-tokens': {
        'task': 'apps.users.tasks.cleanup_expired_tokens',
        'schedule': crontab(hour=2, minute=0, day_of_week='sunday'),
    },
    'generate-weekly-analytics': {
        'task': 'apps.analytics.tasks.generate_weekly_report',
        'schedule': crontab(hour=6, minute=0, day_of_week='monday'),
    },
    'cleanup-old-notifications': {
        'task': 'apps.notifications.tasks.cleanup_old_notifications',
        'schedule': crontab(hour=3, minute=0, day_of_week='sunday'),
    },
    'cleanup-expired-resume-parsing-artifacts': {
        'task': 'apps.profiles.tasks.cleanup_expired_resume_parsing_artifacts',
        'schedule': crontab(hour=4, minute=0),
    },
}

# Task Routing
app.conf.task_routes = {
    'apps.users.tasks.*': {'queue': 'auth'},
    'apps.notifications.tasks.*': {'queue': 'notifications'},
    'apps.jobs.tasks.*': {'queue': 'jobs'},
    'apps.applications.tasks.*': {'queue': 'applications'},
    'apps.analytics.tasks.*': {'queue': 'analytics'},
    'apps.profiles.tasks.*': {'queue': 'profiles'},
}
