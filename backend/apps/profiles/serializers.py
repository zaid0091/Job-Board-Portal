from rest_framework import serializers
from core.sanitizers import strip_all_html
from .models import (
    EmployerProfile, SeekerProfile,
    Skill, Experience, Education,
    ResumeParseJob, ParsedResumeResult, ResumeAutofillAudit,
)


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'slug', 'category']


class ExperienceSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(max_length=255)
    job_title = serializers.CharField(max_length=255)
    description = serializers.CharField(max_length=5000, required=False, allow_blank=True)
    location = serializers.CharField(max_length=255, required=False, allow_blank=True)

    class Meta:
        model = Experience
        fields = [
            'id', 'company_name', 'job_title', 'description',
            'location', 'start_date', 'end_date', 'is_current',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def validate_description(self, value):
        return strip_all_html(value) if value else value

    def validate(self, data):
        if not data.get('is_current') and not data.get('end_date'):
            raise serializers.ValidationError(
                'End date is required for past positions.'
            )
        if data.get('end_date') and data.get('start_date'):
            if data['end_date'] < data['start_date']:
                raise serializers.ValidationError(
                    'End date must be after start date.'
                )
        return data


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = [
            'id', 'institution', 'degree', 'field_of_study',
            'start_date', 'end_date', 'grade', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class EmployerProfileSerializer(serializers.ModelSerializer):
    """Full employer profile serializer."""
    email = serializers.EmailField(source='user.email', read_only=True)
    total_jobs_posted = serializers.IntegerField(read_only=True)
    active_jobs_count = serializers.IntegerField(read_only=True)

    # Explicit length limits on writable text fields
    company_name = serializers.CharField(max_length=255, required=False)
    description = serializers.CharField(max_length=5000, required=False, allow_blank=True)
    location = serializers.CharField(max_length=255, required=False, allow_blank=True)
    industry = serializers.CharField(max_length=100, required=False, allow_blank=True)

    class Meta:
        model = EmployerProfile
        fields = [
            'id', 'email', 'company_name', 'company_logo',
            'company_website', 'company_size', 'industry',
            'description', 'location', 'founded_year',
            'is_verified', 'total_jobs_posted',
            'active_jobs_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_verified', 'created_at', 'updated_at']

    def validate_description(self, value):
        return strip_all_html(value) if value else value


class EmployerProfilePublicSerializer(serializers.ModelSerializer):
    """Public-facing employer profile (limited info)."""
    active_jobs_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = EmployerProfile
        fields = [
            'id', 'company_name', 'company_logo', 'company_website',
            'company_size', 'industry', 'description', 'location',
            'is_verified', 'active_jobs_count'
        ]


class SeekerProfileSerializer(serializers.ModelSerializer):
    """Full seeker profile serializer."""
    email = serializers.EmailField(source='user.email', read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(),
        many=True,
        write_only=True,
        source='skills',
        required=False
    )
    experiences = ExperienceSerializer(many=True, read_only=True)
    educations = EducationSerializer(many=True, read_only=True)
    full_name = serializers.CharField(read_only=True)
    total_applications = serializers.IntegerField(read_only=True)

    # Explicit length limits on writable text fields
    headline = serializers.CharField(max_length=255, required=False, allow_blank=True)
    bio = serializers.CharField(max_length=5000, required=False, allow_blank=True)
    first_name = serializers.CharField(max_length=150, required=False)
    last_name = serializers.CharField(max_length=150, required=False)
    phone = serializers.CharField(max_length=30, required=False, allow_blank=True)
    location = serializers.CharField(max_length=255, required=False, allow_blank=True)

    class Meta:
        model = SeekerProfile
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'headline', 'bio', 'avatar', 'resume', 'phone',
            'location', 'experience_years', 'skills', 'skill_ids',
            'linkedin_url', 'github_url', 'portfolio_url',
            'is_open_to_work', 'expected_salary_min',
            'expected_salary_max', 'salary_currency',
            'experiences', 'educations', 'total_applications',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_bio(self, value):
        return strip_all_html(value) if value else value

    def validate_headline(self, value):
        return strip_all_html(value) if value else value


class ResumeParseCreateSerializer(serializers.Serializer):
    resume = serializers.FileField(required=True)


class ResumeParseJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeParseJob
        fields = [
            'id', 'status', 'progress', 'error_code', 'error_message',
            'parser_version', 'llm_model', 'pipeline_mode',
            'created_at', 'updated_at', 'started_at', 'completed_at',
        ]


class ParsedResumeResultSerializer(serializers.ModelSerializer):
    job = ResumeParseJobSerializer(read_only=True)

    class Meta:
        model = ParsedResumeResult
        fields = [
            'job', 'summary', 'location', 'skills', 'experiences',
            'educations', 'confidence', 'warnings', 'normalized_payload',
            'created_at', 'updated_at',
        ]


class ResumeParsePreviewSerializer(serializers.Serializer):
    summary = serializers.CharField(required=False, allow_blank=True)
    location = serializers.CharField(required=False, allow_blank=True)
    skills = serializers.ListField(child=serializers.DictField(), required=False)
    experiences = serializers.ListField(child=serializers.DictField(), required=False)
    educations = serializers.ListField(child=serializers.DictField(), required=False)
    confidence = serializers.DictField(required=False)
    warnings = serializers.ListField(child=serializers.CharField(), required=False)


class ResumeParseApplySerializer(serializers.Serializer):
    summary = serializers.CharField(required=False, allow_blank=True)
    location = serializers.CharField(required=False, allow_blank=True)
    headline = serializers.CharField(required=False, allow_blank=True)
    experience_years = serializers.IntegerField(required=False, min_value=0)
    skills = serializers.ListField(
        child=serializers.DictField(), required=False
    )
    experiences = serializers.ListField(
        child=serializers.DictField(), required=False
    )
    educations = serializers.ListField(
        child=serializers.DictField(), required=False
    )


class ResumeAutofillAuditSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeAutofillAudit
        fields = [
            'id', 'action', 'before_snapshot', 'after_snapshot', 'metadata',
            'created_at',
        ]
