import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from .managers import CustomUserManager


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model that uses email as the primary identifier.
    Supports role-based access control (Employer, Seeker, Admin).
    """

    class Role(models.TextChoices):
        EMPLOYER = 'EMPLOYER', _('Employer')
        SEEKER = 'SEEKER', _('Job Seeker')
        ADMIN = 'ADMIN', _('Admin')

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text=_('Unique identifier for the user')
    )
    email = models.EmailField(
        _('email address'),
        unique=True,
        db_index=True,
        help_text=_('Required. Must be a valid email address.')
    )
    username = models.CharField(
        _('username'),
        max_length=150,
        unique=True,
        db_index=True,
        help_text=_('Required. 150 characters or fewer.')
    )
    role = models.CharField(
        _('role'),
        max_length=10,
        choices=Role.choices,
        default=Role.SEEKER,
        db_index=True,
        help_text=_('Determines user permissions and accessible features')
    )
    is_active = models.BooleanField(
        _('active'),
        default=True,
        help_text=_('Designates whether this user should be treated as active.')
    )
    is_staff = models.BooleanField(
        _('staff status'),
        default=False,
        help_text=_('Designates whether the user can log into admin site.')
    )
    is_verified = models.BooleanField(
        _('email verified'),
        default=False,
        help_text=_('Designates whether the user has verified their email.')
    )
    date_joined = models.DateTimeField(
        _('date joined'),
        default=timezone.now
    )
    last_login = models.DateTimeField(
        _('last login'),
        blank=True,
        null=True
    )

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        ordering = ['-date_joined']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
            models.Index(fields=['is_active', 'role']),
        ]

    def __str__(self):
        return self.email

    @property
    def is_employer(self):
        return self.role == self.Role.EMPLOYER

    @property
    def is_seeker(self):
        return self.role == self.Role.SEEKER

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN

    def get_full_name(self):
        if self.is_seeker and hasattr(self, 'seeker_profile'):
            return f"{self.seeker_profile.first_name} {self.seeker_profile.last_name}"
        if self.is_employer and hasattr(self, 'employer_profile'):
            return self.employer_profile.company_name
        return self.username
