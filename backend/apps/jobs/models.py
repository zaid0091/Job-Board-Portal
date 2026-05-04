from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _

from core.models import UUIDModel, TimeStampedModel
from apps.profiles.models import EmployerProfile, Skill


class JobCategory(models.Model):
    """Hierarchical job categories."""

    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text='Icon class name')
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name='children'
    )
    is_active = models.BooleanField(default=True)
    job_count = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name_plural = 'Job Categories'
        ordering = ['name']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return self.name


class Job(UUIDModel, TimeStampedModel):
    """Core job listing model."""

    class JobType(models.TextChoices):
        FULL_TIME = 'FULL_TIME', _('Full Time')
        PART_TIME = 'PART_TIME', _('Part Time')
        CONTRACT = 'CONTRACT', _('Contract')
        INTERNSHIP = 'INTERNSHIP', _('Internship')
        FREELANCE = 'FREELANCE', _('Freelance')
        TEMPORARY = 'TEMPORARY', _('Temporary')

    class ExperienceLevel(models.TextChoices):
        ENTRY = 'ENTRY', _('Entry Level')
        MID = 'MID', _('Mid Level')
        SENIOR = 'SENIOR', _('Senior Level')
        LEAD = 'LEAD', _('Lead / Manager')
        EXECUTIVE = 'EXECUTIVE', _('Executive')

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', _('Draft')
        ACTIVE = 'ACTIVE', _('Active')
        PAUSED = 'PAUSED', _('Paused')
        CLOSED = 'CLOSED', _('Closed')
        EXPIRED = 'EXPIRED', _('Expired')

    # Relationships
    employer = models.ForeignKey(
        EmployerProfile,
        on_delete=models.CASCADE,
        related_name='jobs'
    )
    category = models.ForeignKey(
        JobCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='jobs'
    )
    skills_required = models.ManyToManyField(
        Skill,
        blank=True,
        related_name='jobs'
    )

    # Job Information
    title = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(max_length=300, unique=True, db_index=True)
    description = models.TextField(
        help_text=_('Detailed job description. Supports markdown.')
    )
    requirements = models.TextField(blank=True)
    responsibilities = models.TextField(blank=True)
    benefits = models.TextField(blank=True)

    # Job Metadata
    job_type = models.CharField(
        max_length=20,
        choices=JobType.choices,
        default=JobType.FULL_TIME,
        db_index=True
    )
    experience_level = models.CharField(
        max_length=20,
        choices=ExperienceLevel.choices,
        default=ExperienceLevel.MID,
        db_index=True
    )
    location = models.CharField(max_length=255, db_index=True)
    is_remote = models.BooleanField(default=False, db_index=True)

    # Salary
    salary_min = models.DecimalField(
        max_digits=12, decimal_places=2,
        blank=True, null=True
    )
    salary_max = models.DecimalField(
        max_digits=12, decimal_places=2,
        blank=True, null=True
    )
    salary_currency = models.CharField(max_length=3, default='USD')
    show_salary = models.BooleanField(default=True)

    # Status & Dates
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True
    )
    application_deadline = models.DateTimeField(blank=True, null=True)
    expires_at = models.DateTimeField(blank=True, null=True)
    is_featured = models.BooleanField(default=False, db_index=True)

    # Analytics
    views_count = models.PositiveIntegerField(default=0)
    applications_count = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = _('job')
        verbose_name_plural = _('jobs')
        ordering = ['-is_featured', '-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['job_type', 'experience_level']),
            models.Index(fields=['location']),
            models.Index(fields=['salary_min', 'salary_max']),
            models.Index(fields=['is_featured', '-created_at']),
            models.Index(fields=['employer', 'status']),
            models.Index(fields=['-views_count']),
            models.Index(fields=['slug']),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(salary_min__lte=models.F('salary_max')) |
                          models.Q(salary_min__isnull=True) |
                          models.Q(salary_max__isnull=True),
                name='salary_min_lte_max'
            ),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Job.objects.filter(slug=slug).exists():
                slug = f'{base_slug}-{counter}'
                counter += 1
            self.slug = slug

        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(days=30)

        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        return self.expires_at and self.expires_at < timezone.now()

    @property
    def days_remaining(self):
        if self.application_deadline:
            delta = self.application_deadline - timezone.now()
            return delta.days
        return None

    @property
    def salary_display(self):
        if not self.show_salary or (not self.salary_min and not self.salary_max):
            return 'Competitive'
        if self.salary_min and self.salary_max:
            return f'{self.salary_currency} {self.salary_min:,.0f} - {self.salary_max:,.0f}'
        if self.salary_min:
            return f'{self.salary_currency} {self.salary_min:,.0f}+'
        return f'Up to {self.salary_currency} {self.salary_max:,.0f}'


class SavedJob(TimeStampedModel):
    """Allows seekers to bookmark jobs."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='saved_jobs'
    )
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='saved_by'
    )

    class Meta:
        unique_together = ['user', 'job']
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.email} saved {self.job.title}'
