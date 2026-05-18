from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from core.models import UUIDModel, TimeStampedModel
from core.utils import get_resume_upload_path


class Application(UUIDModel, TimeStampedModel):
    """Job application model with status tracking."""

    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        REVIEWING = 'REVIEWING', _('Under Review')
        SHORTLISTED = 'SHORTLISTED', _('Shortlisted')
        INTERVIEW = 'INTERVIEW', _('Interview')
        OFFERED = 'OFFERED', _('Offered')
        HIRED = 'HIRED', _('Hired')
        REJECTED = 'REJECTED', _('Rejected')
        WITHDRAWN = 'WITHDRAWN', _('Withdrawn')

    # Valid status transitions
    TRANSITION_MAP = {
        'PENDING': ['REVIEWING', 'REJECTED', 'WITHDRAWN'],
        'REVIEWING': ['SHORTLISTED', 'REJECTED', 'WITHDRAWN'],
        'SHORTLISTED': ['INTERVIEW', 'REJECTED', 'WITHDRAWN'],
        'INTERVIEW': ['OFFERED', 'REJECTED', 'WITHDRAWN'],
        'OFFERED': ['HIRED', 'REJECTED', 'WITHDRAWN'],
        'HIRED': [],
        'REJECTED': [],
        'WITHDRAWN': [],
    }

    # Relationships
    job = models.ForeignKey(
        'jobs.Job',
        on_delete=models.CASCADE,
        related_name='applications'
    )
    applicant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='applications'
    )

    # Application Content
    cover_letter = models.TextField(blank=True)
    resume = models.FileField(
        upload_to=get_resume_upload_path,
        blank=True,
        null=True,
        help_text=_('Custom resume for this application')
    )

    # Status
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True
    )

    # Employer Notes (private)
    employer_notes = models.TextField(
        blank=True,
        help_text=_('Private notes visible only to employer')
    )

    # Metadata
    expected_salary = models.DecimalField(
        max_digits=12, decimal_places=2,
        blank=True, null=True
    )
    available_from = models.DateField(blank=True, null=True)

    class Meta:
        verbose_name = _('application')
        verbose_name_plural = _('applications')
        ordering = ['-created_at']
        unique_together = ['job', 'applicant']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['job', 'status']),
            models.Index(fields=['applicant', 'status']),
        ]

    def __str__(self):
        return f'{self.applicant.email} - {self.job.title} ({self.status})'

    def can_transition_to(self, new_status):
        """Check if the status transition is valid."""
        return new_status in self.TRANSITION_MAP.get(self.status, [])


class ApplicationStatusLog(TimeStampedModel):
    """Audit log for application status changes."""
    application = models.ForeignKey(
        Application,
        on_delete=models.CASCADE,
        related_name='status_logs'
    )
    from_status = models.CharField(max_length=20, choices=Application.Status.choices)
    to_status = models.CharField(max_length=20, choices=Application.Status.choices)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='status_changes'
    )
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.application} : {self.from_status} → {self.to_status}'


def _default_cover_letter_expires():
    ttl = getattr(settings, 'COVER_LETTER_CACHE_TTL_SECONDS', 86400)
    return timezone.now() + timedelta(seconds=ttl)


class CoverLetterDraft(UUIDModel, TimeStampedModel):
    """Cached AI/template cover letter draft for a seeker applying to a job."""

    class Generator(models.TextChoices):
        TEMPLATE = 'template', _('Template')
        LLM = 'llm', _('LLM')

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cover_letter_drafts',
    )
    job = models.ForeignKey(
        'jobs.Job',
        on_delete=models.CASCADE,
        related_name='cover_letter_drafts',
    )
    profile_hash = models.CharField(max_length=64, db_index=True)
    cover_letter = models.TextField(max_length=10000)
    highlights = models.JSONField(default=list, blank=True)
    generator = models.CharField(
        max_length=20,
        choices=Generator.choices,
        default=Generator.TEMPLATE,
    )
    llm_model = models.CharField(max_length=100, blank=True)
    token_usage = models.JSONField(default=dict, blank=True)
    expires_at = models.DateTimeField(default=_default_cover_letter_expires, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'job', 'profile_hash']),
            models.Index(fields=['user', 'job', '-created_at']),
        ]

    def __str__(self):
        return f'Cover letter draft for {self.user.email} -> {self.job.title}'

    @property
    def is_expired(self):
        return timezone.now() >= self.expires_at


class CoverLetterAudit(TimeStampedModel):
    """Audit trail for cover letter preview and application submit."""

    class Action(models.TextChoices):
        PREVIEWED = 'previewed', _('Previewed')
        GENERATED = 'generated', _('Generated')
        EDITED_BEFORE_APPLY = 'edited_before_apply', _('Edited Before Apply')
        APPLIED = 'applied', _('Applied')
        REJECTED = 'rejected', _('Rejected')
        FAILED = 'failed', _('Failed')

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cover_letter_audits',
    )
    job = models.ForeignKey(
        'jobs.Job',
        on_delete=models.CASCADE,
        related_name='cover_letter_audits',
    )
    draft = models.ForeignKey(
        CoverLetterDraft,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audits',
    )
    action = models.CharField(max_length=32, choices=Action.choices, db_index=True)
    before_snapshot = models.JSONField(default=dict, blank=True)
    after_snapshot = models.JSONField(default=dict, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'action']),
            models.Index(fields=['job', 'action']),
        ]

    def __str__(self):
        return f'{self.user.email} - {self.action}'
