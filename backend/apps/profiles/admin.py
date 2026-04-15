from django.contrib import admin
from .models import (
    EmployerProfile,
    SeekerProfile,
    Skill,
    Experience,
    Education,
    ResumeParseJob,
    ParsedResumeResult,
    ResumeAutofillAudit,
    ProfileAutofillDraft,
    SkillAlias,
)


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'category']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(EmployerProfile)
class EmployerProfileAdmin(admin.ModelAdmin):
    list_display = ['company_name', 'user', 'industry', 'location', 'is_verified']
    list_filter = ['is_verified', 'company_size', 'industry']
    search_fields = ['company_name', 'user__email']


@admin.register(SeekerProfile)
class SeekerProfileAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'last_name', 'user', 'location', 'experience_years', 'is_open_to_work']
    list_filter = ['is_open_to_work', 'experience_years']
    search_fields = ['first_name', 'last_name', 'user__email']


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ['job_title', 'company_name', 'seeker', 'start_date', 'end_date']


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ['degree', 'institution', 'seeker', 'start_date', 'end_date']


@admin.register(ResumeParseJob)
class ResumeParseJobAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'status', 'progress', 'created_at', 'completed_at']
    list_filter = ['status', 'pipeline_mode', 'parser_version']
    search_fields = ['user__email', 'source_hash']


@admin.register(ParsedResumeResult)
class ParsedResumeResultAdmin(admin.ModelAdmin):
    list_display = ['job', 'location', 'created_at']
    search_fields = ['job__user__email', 'location']


@admin.register(ProfileAutofillDraft)
class ProfileAutofillDraftAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'job', 'is_active', 'expires_at', 'created_at']
    list_filter = ['is_active']
    search_fields = ['user__email']


@admin.register(ResumeAutofillAudit)
class ResumeAutofillAuditAdmin(admin.ModelAdmin):
    list_display = ['user', 'job', 'action', 'created_at']
    list_filter = ['action']
    search_fields = ['user__email', 'job__id']


@admin.register(SkillAlias)
class SkillAliasAdmin(admin.ModelAdmin):
    list_display = ['alias', 'skill', 'created_at']
    search_fields = ['alias', 'skill__name']
