import logging
from datetime import timedelta

from celery import shared_task
from django.conf import settings
from django.utils import timezone

from .models import (
    ParsedResumeResult,
    ResumeAutofillAudit,
    ResumeParseJob,
    ProfileAutofillDraft,
)
from .parsing import ResumeParsingService

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def run_resume_parse_job(self, job_id: str):
    try:
        job = ResumeParseJob.objects.select_related('user').get(id=job_id)
    except ResumeParseJob.DoesNotExist:
        logger.error('Resume parse job %s not found', job_id)
        return

    job.status = ResumeParseJob.Status.PROCESSING
    job.progress = 10
    job.started_at = timezone.now()
    job.error_code = ''
    job.error_message = ''
    job.save(update_fields=['status', 'progress', 'started_at', 'error_code', 'error_message', 'updated_at'])

    try:
        parser = ResumeParsingService()
        payload = parser.parse_file(job.source_file.path)
        ParsedResumeResult.objects.update_or_create(
            job=job,
            defaults={
                'summary': payload.get('summary', ''),
                'location': payload.get('location', ''),
                'skills': payload.get('skills', []),
                'experiences': payload.get('experiences', []),
                'educations': payload.get('educations', []),
                'confidence': payload.get('confidence', {}),
                'warnings': payload.get('warnings', []),
                'raw_text': payload.get('raw_text', ''),
                'normalized_payload': payload,
            },
        )
        job.status = ResumeParseJob.Status.REVIEW_READY
        job.progress = 100
        job.completed_at = timezone.now()
        job.parser_version = parser.parser_version
        job.pipeline_mode = parser.pipeline_mode
        job.llm_model = parser.llm.model_name
        job.save(update_fields=[
            'status', 'progress', 'completed_at', 'parser_version',
            'pipeline_mode', 'llm_model', 'updated_at'
        ])
    except Exception as exc:
        job.status = ResumeParseJob.Status.FAILED
        job.error_code = 'parse_failed'
        job.error_message = str(exc)[:1000]
        job.retries += 1
        job.save(update_fields=['status', 'error_code', 'error_message', 'retries', 'updated_at'])
        ResumeAutofillAudit.objects.create(
            user=job.user,
            job=job,
            action=ResumeAutofillAudit.Action.FAILED,
            metadata={'error': str(exc)[:500]},
        )
        logger.exception('Resume parse job %s failed', job_id)
        raise self.retry(exc=exc)


@shared_task
def cleanup_expired_resume_parsing_artifacts():
    retention_days = getattr(settings, 'RESUME_PARSE_RETENTION_DAYS', 30)
    threshold = timezone.now() - timedelta(days=retention_days)

    expired_jobs = ResumeParseJob.objects.filter(created_at__lt=threshold)
    deleted_jobs = expired_jobs.count()
    expired_jobs.delete()

    expired_drafts = ProfileAutofillDraft.objects.filter(
        expires_at__isnull=False,
        expires_at__lt=timezone.now(),
    )
    deleted_drafts = expired_drafts.count()
    expired_drafts.delete()
    logger.info(
        'Resume parsing cleanup completed: %s jobs, %s drafts',
        deleted_jobs,
        deleted_drafts,
    )
