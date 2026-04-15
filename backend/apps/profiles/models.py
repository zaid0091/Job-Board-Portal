from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

from core.models import UUIDModel, TimeStampedModel
from apps.users.validators import validate_image_file, validate_resume_file


def employer_logo_path(instance, filename):
    return f'employers/{instance.user.id}/logo/{filename}'


def seeker_avatar_path(instance, filename):
    return f'seekers/{instance.user.id}/avatar/{filename}'


def seeker_resume_path(instance, filename):
    return f'seekers/{instance.user.id}/resume/{filename}'


def resume_parse_source_path(instance, filename):
    return f'seekers/{instance.user.id}/resume-parse/{instance.id}/{filename}'


class Skill(models.Model):
    """Represents a skill that can be associated with seeker profiles and job requirements."""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    category = models.CharField(max_length=100, blank=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['category']),
        ]

    def __str__(self):
        return self.name


class EmployerProfile(UUIDModel, TimeStampedModel):
    """Profile for employer accounts."""

    class CompanySize(models.TextChoices):
        STARTUP = '1-10', _('1-10 employees')
        SMALL = '11-50', _('11-50 employees')
        MEDIUM = '51-200', _('51-200 employees')
        LARGE = '201-500', _('201-500 employees')
        ENTERPRISE = '501-1000', _('501-1000 employees')
        CORPORATION = '1000+', _('1000+ employees')

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='employer_profile'
    )
    company_name = models.CharField(max_length=255, blank=True, db_index=True)
    company_logo = models.ImageField(
        upload_to=employer_logo_path,
        blank=True,
        null=True,
        validators=[validate_image_file],
        help_text=_('Company logo. Max 2MB. JPEG, PNG, or WebP.')
    )
    company_website = models.URLField(blank=True)
    company_size = models.CharField(
        max_length=20,
        choices=CompanySize.choices,
        blank=True
    )
    industry = models.CharField(max_length=255, blank=True, db_index=True)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=255, blank=True, db_index=True)
    founded_year = models.PositiveIntegerField(blank=True, null=True)
    is_verified = models.BooleanField(default=False)

    class Meta:
        verbose_name = _('employer profile')
        verbose_name_plural = _('employer profiles')
        indexes = [
            models.Index(fields=['company_name']),
            models.Index(fields=['industry']),
            models.Index(fields=['location']),
        ]

    def __str__(self):
        return self.company_name or f'Employer: {self.user.email}'

    @property
    def total_jobs_posted(self):
        return self.jobs.count()

    @property
    def active_jobs_count(self):
        return self.jobs.filter(status='ACTIVE').count()


class SeekerProfile(UUIDModel, TimeStampedModel):
    """Profile for job seeker accounts."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='seeker_profile'
    )
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    headline = models.CharField(max_length=255, blank=True)
    bio = models.TextField(blank=True)
    avatar = models.ImageField(
        upload_to=seeker_avatar_path,
        blank=True,
        null=True,
        validators=[validate_image_file]
    )
    resume = models.FileField(
        upload_to=seeker_resume_path,
        blank=True,
        null=True,
        validators=[validate_resume_file],
        help_text=_('Upload your resume. Max 5MB. PDF, DOC, or DOCX.')
    )
    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=255, blank=True, db_index=True)
    experience_years = models.PositiveIntegerField(default=0)
    skills = models.ManyToManyField(
        Skill,
        blank=True,
        related_name='seekers'
    )
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)
    is_open_to_work = models.BooleanField(default=True, db_index=True)
    expected_salary_min = models.DecimalField(
        max_digits=12, decimal_places=2,
        blank=True, null=True
    )
    expected_salary_max = models.DecimalField(
        max_digits=12, decimal_places=2,
        blank=True, null=True
    )
    salary_currency = models.CharField(max_length=3, default='USD')

    class Meta:
        verbose_name = _('seeker profile')
        verbose_name_plural = _('seeker profiles')
        indexes = [
            models.Index(fields=['location']),
            models.Index(fields=['experience_years']),
            models.Index(fields=['is_open_to_work']),
        ]

    def __str__(self):
        return f'{self.first_name} {self.last_name}'.strip() or self.user.email

    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'.strip()

    @property
    def total_applications(self):
        return self.user.applications.count()


class Experience(UUIDModel, TimeStampedModel):
    """Work experience entry for a job seeker."""
    seeker = models.ForeignKey(
        SeekerProfile,
        on_delete=models.CASCADE,
        related_name='experiences'
    )
    company_name = models.CharField(max_length=255)
    job_title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    is_current = models.BooleanField(default=False)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f'{self.job_title} at {self.company_name}'


class Education(UUIDModel, TimeStampedModel):
    """Education entry for a job seeker."""
    seeker = models.ForeignKey(
        SeekerProfile,
        on_delete=models.CASCADE,
        related_name='educations'
    )
    institution = models.CharField(max_length=255)
    degree = models.CharField(max_length=255)
    field_of_study = models.CharField(max_length=255, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    grade = models.CharField(max_length=50, blank=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f'{self.degree} - {self.institution}'


class ResumeParseJob(UUIDModel, TimeStampedModel):
    class Status(models.TextChoices):
        QUEUED = 'QUEUED', _('Queued')
        PROCESSING = 'PROCESSING', _('Processing')
        REVIEW_READY = 'REVIEW_READY', _('Review Ready')
        FAILED = 'FAILED', _('Failed')
        APPLIED = 'APPLIED', _('Applied')
        DISCARDED = 'DISCARDED', _('Discarded')

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='resume_parse_jobs',
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.QUEUED, db_index=True)
    source_file = models.FileField(
        upload_to=resume_parse_source_path,
        validators=[validate_resume_file],
        max_length=500,
    )
    source_hash = models.CharField(max_length=64, db_index=True)
    parser_version = models.CharField(max_length=50, default='v1')
    llm_model = models.CharField(max_length=100, blank=True)
    pipeline_mode = models.CharField(max_length=20, default='hybrid')
    progress = models.PositiveSmallIntegerField(default=0)
    retries = models.PositiveSmallIntegerField(default=0)
    error_code = models.CharField(max_length=100, blank=True)
    error_message = models.TextField(blank=True)
    started_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    last_applied_at = models.DateTimeField(blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['source_hash']),
        ]

    def __str__(self):
        return f'{self.user.email} - {self.status}'


class ParsedResumeResult(TimeStampedModel):
    job = models.OneToOneField(
        ResumeParseJob,
        on_delete=models.CASCADE,
        related_name='result',
    )
    summary = models.TextField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    skills = models.JSONField(default=list, blank=True)
    experiences = models.JSONField(default=list, blank=True)
    educations = models.JSONField(default=list, blank=True)
    confidence = models.JSONField(default=dict, blank=True)
    warnings = models.JSONField(default=list, blank=True)
    raw_text = models.TextField(blank=True)
    normalized_payload = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f'Parsed result for {self.job_id}'


class ProfileAutofillDraft(UUIDModel, TimeStampedModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile_autofill_drafts',
    )
    job = models.ForeignKey(
        ResumeParseJob,
        on_delete=models.CASCADE,
        related_name='drafts',
    )
    payload = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    expires_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_active']),
        ]

    def __str__(self):
        return f'Draft {self.id} for {self.user.email}'


class ResumeAutofillAudit(TimeStampedModel):
    class Action(models.TextChoices):
        PREVIEWED = 'previewed', _('Previewed')
        ACCEPTED = 'accepted', _('Accepted')
        EDITED_BEFORE_APPLY = 'edited_before_apply', _('Edited Before Apply')
        APPLIED = 'applied', _('Applied')
        REJECTED = 'rejected', _('Rejected')
        FAILED = 'failed', _('Failed')

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='resume_autofill_audits',
    )
    job = models.ForeignKey(
        ResumeParseJob,
        on_delete=models.CASCADE,
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


class SkillAlias(TimeStampedModel):
    skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name='aliases',
    )
    alias = models.CharField(max_length=120, unique=True, db_index=True)

    class Meta:
        ordering = ['alias']

    def __str__(self):
        return f'{self.alias} -> {self.skill.name}'
