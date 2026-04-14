from django.contrib import admin
from .models import Job, JobCategory, SavedJob


@admin.register(JobCategory)
class JobCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'parent', 'job_count', 'is_active']
    list_filter = ['is_active', 'parent']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'employer', 'job_type', 'experience_level',
        'location', 'status', 'is_featured', 'views_count',
        'applications_count', 'created_at',
    ]
    list_filter = [
        'status', 'job_type', 'experience_level',
        'is_remote', 'is_featured', 'category',
    ]
    search_fields = ['title', 'description', 'employer__company_name']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['views_count', 'applications_count', 'created_at', 'updated_at']
    filter_horizontal = ['skills_required']
    raw_id_fields = ['employer', 'category']
    date_hierarchy = 'created_at'


@admin.register(SavedJob)
class SavedJobAdmin(admin.ModelAdmin):
    list_display = ['user', 'job', 'created_at']
    raw_id_fields = ['user', 'job']
