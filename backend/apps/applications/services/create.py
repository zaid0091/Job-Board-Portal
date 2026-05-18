from django.db.models import F

from apps.jobs.models import Job


def increment_job_applications_count(job_id):
    Job.objects.filter(pk=job_id).update(applications_count=F('applications_count') + 1)
