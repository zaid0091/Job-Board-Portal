from rest_framework import serializers

from apps.profiles.serializers import SkillSerializer, EmployerProfilePublicSerializer
from core.sanitizers import sanitize_html
from .models import Job, JobCategory, SavedJob


class JobCategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = JobCategory
        fields = ['id', 'name', 'slug', 'description', 'icon', 'parent', 'job_count', 'children']

    def get_children(self, obj):
        if obj.children.exists():
            return JobCategorySerializer(obj.children.filter(is_active=True), many=True).data
        return []


class JobListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for job listing pages."""
    employer_name = serializers.CharField(source='employer.company_name', read_only=True)
    employer_logo = serializers.ImageField(source='employer.logo', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    salary_display = serializers.ReadOnlyField()
    days_remaining = serializers.ReadOnlyField()
    is_saved = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'slug', 'employer_name', 'employer_logo',
            'category_name', 'job_type', 'experience_level', 'location',
            'is_remote', 'salary_display', 'status', 'is_featured',
            'views_count', 'applications_count', 'days_remaining',
            'is_saved', 'created_at',
        ]

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return SavedJob.objects.filter(user=request.user, job=obj).exists()
        return False


class JobDetailSerializer(serializers.ModelSerializer):
    """Full serializer for job detail page."""
    employer = EmployerProfilePublicSerializer(read_only=True)
    category = JobCategorySerializer(read_only=True)
    skills_required = SkillSerializer(many=True, read_only=True)
    salary_display = serializers.ReadOnlyField()
    days_remaining = serializers.ReadOnlyField()
    is_expired = serializers.ReadOnlyField()
    is_saved = serializers.SerializerMethodField()
    is_applied = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'slug', 'description', 'requirements',
            'responsibilities', 'benefits', 'employer', 'category',
            'skills_required', 'job_type', 'experience_level',
            'location', 'is_remote', 'salary_min', 'salary_max',
            'salary_currency', 'show_salary', 'salary_display',
            'status', 'application_deadline', 'expires_at',
            'is_featured', 'is_expired', 'views_count',
            'applications_count', 'days_remaining', 'is_saved',
            'is_applied', 'created_at', 'updated_at',
        ]

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return SavedJob.objects.filter(user=request.user, job=obj).exists()
        return False

    def get_is_applied(self, obj):
        """Return the application status string if applied, or None."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from apps.applications.models import Application
            application = Application.objects.filter(applicant=request.user, job=obj).first()
            if application:
                return application.status
        return None


class JobCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating jobs.
    
    Security:
    - Rich-text fields are HTML-sanitized via bleach (prevents stored XSS).
    - All text fields enforce max_length to avoid payload abuse.
    - Unknown / unexpected fields are rejected.
    """
    skills_required = serializers.SlugRelatedField(
        many=True,
        slug_field='slug',
        queryset=__import__('apps.profiles.models', fromlist=['Skill']).Skill.objects.all(),
        required=False
    )

    # Explicit field declarations with length limits
    title = serializers.CharField(max_length=255)
    description = serializers.CharField(max_length=50000)
    requirements = serializers.CharField(max_length=20000, required=False, allow_blank=True)
    responsibilities = serializers.CharField(max_length=20000, required=False, allow_blank=True)
    benefits = serializers.CharField(max_length=10000, required=False, allow_blank=True)
    location = serializers.CharField(max_length=255)

    class Meta:
        model = Job
        fields = [
            'title', 'description', 'requirements', 'responsibilities',
            'benefits', 'category', 'skills_required', 'job_type',
            'experience_level', 'location', 'is_remote',
            'salary_min', 'salary_max', 'salary_currency', 'show_salary',
            'status', 'application_deadline',
        ]

    def validate(self, attrs):
        # Reject any keys that aren't declared in Meta.fields (mass-assignment protection)
        allowed = set(self.fields.keys())
        unknown = set(self.initial_data.keys()) - allowed
        if unknown:
            raise serializers.ValidationError(
                {field: 'Unexpected field.' for field in unknown}
            )

        salary_min = attrs.get('salary_min')
        salary_max = attrs.get('salary_max')

        if salary_min and salary_max and salary_min > salary_max:
            raise serializers.ValidationError({
                'salary_max': 'Maximum salary must be greater than minimum salary.'
            })

        # Sanitize rich-text fields (OWASP XSS protection)
        for field in ('description', 'requirements', 'responsibilities', 'benefits'):
            if field in attrs and attrs[field]:
                attrs[field] = sanitize_html(attrs[field])

        return attrs


class SavedJobSerializer(serializers.ModelSerializer):
    """Serializer for saved/bookmarked jobs."""
    job = JobListSerializer(read_only=True)
    job_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = SavedJob
        fields = ['id', 'job', 'job_id', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_job_id(self, value):
        try:
            Job.objects.get(id=value, status=Job.Status.ACTIVE)
        except Job.DoesNotExist:
            raise serializers.ValidationError('Job not found or not active.')
        return value

    def create(self, validated_data):
        job_id = validated_data.pop('job_id')
        job = Job.objects.get(id=job_id)
        user = self.context['request'].user

        saved_job, created = SavedJob.objects.get_or_create(
            user=user, job=job
        )
        if not created:
            raise serializers.ValidationError('Job already saved.')
        return saved_job
