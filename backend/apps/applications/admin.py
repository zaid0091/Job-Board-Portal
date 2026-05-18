from django.contrib import admin
from .models import (
    Application,
    ApplicationStatusLog,
    CoverLetterAudit,
    CoverLetterDraft,
)


class ApplicationStatusLogInline(admin.TabularInline):
    model = ApplicationStatusLog
    extra = 0
    readonly_fields = ['from_status', 'to_status', 'changed_by', 'notes', 'created_at']


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = [
        'applicant', 'job', 'status', 'expected_salary',
        'available_from', 'created_at',
    ]
    list_filter = ['status', 'created_at']
    search_fields = [
        'applicant__email', 'applicant__first_name',
        'applicant__last_name', 'job__title',
    ]
    raw_id_fields = ['job', 'applicant']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [ApplicationStatusLogInline]


@admin.register(CoverLetterDraft)
class CoverLetterDraftAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'job', 'generator', 'profile_hash', 'expires_at', 'created_at',
    ]
    list_filter = ['generator', 'created_at']
    search_fields = ['user__email', 'job__title']
    raw_id_fields = ['user', 'job']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(CoverLetterAudit)
class CoverLetterAuditAdmin(admin.ModelAdmin):
    list_display = ['user', 'job', 'action', 'draft', 'created_at']
    list_filter = ['action', 'created_at']
    search_fields = ['user__email', 'job__title']
    raw_id_fields = ['user', 'job', 'draft']
    readonly_fields = ['created_at', 'updated_at']
