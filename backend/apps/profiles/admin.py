from django.contrib import admin
from .models import EmployerProfile, SeekerProfile, Skill, Experience, Education


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
