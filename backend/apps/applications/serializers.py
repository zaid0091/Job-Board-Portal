from rest_framework import serializers

from apps.jobs.serializers import JobListSerializer
from core.sanitizers import strip_all_html
from .models import Application, ApplicationStatusLog, CoverLetterDraft
from .services.cover_letter import audit_application_cover_letter


class ApplicationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for application lists."""
    job_title = serializers.CharField(source='job.title', read_only=True)
    job_slug = serializers.CharField(source='job.slug', read_only=True)
    company_name = serializers.CharField(source='job.employer.company_name', read_only=True)
    applicant_name = serializers.SerializerMethodField()
    applicant_email = serializers.EmailField(source='applicant.email', read_only=True)

    class Meta:
        model = Application
        fields = [
            'id', 'job_title', 'job_slug', 'company_name',
            'applicant_name', 'applicant_email', 'status',
            'created_at', 'updated_at',
        ]

    def get_applicant_name(self, obj):
        return obj.applicant.get_full_name()


class ApplicationDetailSerializer(serializers.ModelSerializer):
    """Full serializer for application detail."""
    job = JobListSerializer(read_only=True)
    applicant_name = serializers.SerializerMethodField()
    applicant_email = serializers.EmailField(source='applicant.email', read_only=True)
    status_logs = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            'id', 'job', 'applicant_name', 'applicant_email',
            'cover_letter', 'resume', 'status', 'employer_notes',
            'expected_salary', 'available_from', 'status_logs',
            'created_at', 'updated_at',
        ]

    def get_applicant_name(self, obj):
        return obj.applicant.get_full_name()

    def get_status_logs(self, obj):
        logs = obj.status_logs.all()[:20]
        return ApplicationStatusLogSerializer(logs, many=True).data


class ApplicationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating applications.
    
    Security: cover_letter is stripped of HTML; max_length enforced.
    """
    cover_letter = serializers.CharField(max_length=10000, required=False, allow_blank=True)
    cover_letter_draft_id = serializers.UUIDField(required=False, allow_null=True)

    class Meta:
        model = Application
        fields = [
            'job', 'cover_letter', 'cover_letter_draft_id', 'resume',
            'expected_salary', 'available_from',
        ]

    def validate(self, attrs):
        # Reject unexpected fields
        allowed = set(self.fields.keys())
        unknown = set(self.initial_data.keys()) - allowed
        if unknown:
            raise serializers.ValidationError(
                {field: 'Unexpected field.' for field in unknown}
            )

        request = self.context['request']
        job = attrs['job']

        # Check if already applied
        if Application.objects.filter(applicant=request.user, job=job).exists():
            raise serializers.ValidationError(
                'You have already applied to this job.'
            )

        draft_id = attrs.pop('cover_letter_draft_id', None)
        if draft_id in (None, ''):
            draft_id = None
        if draft_id:
            try:
                draft = CoverLetterDraft.objects.get(
                    id=draft_id,
                    user=request.user,
                    job=job,
                )
            except CoverLetterDraft.DoesNotExist:
                raise serializers.ValidationError(
                    {'cover_letter_draft_id': 'Invalid or expired cover letter draft.'}
                )
            attrs['_cover_letter_draft'] = draft

        return attrs

    def validate_cover_letter(self, value):
        # Strip all HTML from plain-text cover letters
        return strip_all_html(value) if value else value

    def validate_job(self, value):
        from django.utils import timezone
        from apps.jobs.models import Job

        if value.status != Job.Status.ACTIVE:
            raise serializers.ValidationError('This job is not accepting applications.')
        if value.is_expired:
            raise serializers.ValidationError('This job has expired.')
        if value.application_deadline and value.application_deadline < timezone.now():
            raise serializers.ValidationError('The application deadline for this job has passed.')
        return value

    def create(self, validated_data):
        draft = validated_data.pop('_cover_letter_draft', None)
        validated_data['applicant'] = self.context['request'].user
        application = super().create(validated_data)
        if draft:
            audit_application_cover_letter(
                user=self.context['request'].user,
                job=application.job,
                draft=draft,
                submitted_cover_letter=application.cover_letter,
            )
        return application


class ApplicationStatusUpdateSerializer(serializers.Serializer):
    """Serializer for updating application status."""
    status = serializers.ChoiceField(choices=Application.Status.choices)
    notes = serializers.CharField(required=False, allow_blank=True, default='', max_length=5000)

    def validate_notes(self, value):
        return strip_all_html(value) if value else value

    def validate_status(self, value):
        application = self.context['application']
        if not application.can_transition_to(value):
            current = application.status
            valid = Application.TRANSITION_MAP.get(current, [])
            raise serializers.ValidationError(
                f'Cannot transition from {current} to {value}. '
                f'Valid transitions: {", ".join(valid) or "none"}'
            )
        return value


class ApplicationStatusLogSerializer(serializers.ModelSerializer):
    changed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ApplicationStatusLog
        fields = [
            'id', 'from_status', 'to_status',
            'changed_by_name', 'notes', 'created_at',
        ]

    def get_changed_by_name(self, obj):
        if obj.changed_by:
            return obj.changed_by.get_full_name()
        return 'System'
