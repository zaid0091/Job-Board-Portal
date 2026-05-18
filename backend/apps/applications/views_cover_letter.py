import logging

from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response

from core.ai.llm_client import LLMError

from apps.applications.models import Application, CoverLetterAudit
from apps.applications.serializers_cover_letter import (
    CoverLetterPreviewRequestSerializer,
    CoverLetterPreviewResponseSerializer,
)
from apps.applications.services.cover_letter import (
    DISCLAIMER,
    get_or_create_draft,
    record_audit,
)
from apps.jobs.models import Job


logger = logging.getLogger(__name__)


def handle_preview_cover_letter(request) -> Response:
    """Shared handler for cover letter preview (ViewSet action)."""
    serializer = CoverLetterPreviewRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    job_id = serializer.validated_data['job_id']
    regenerate = serializer.validated_data.get('regenerate', False)

    try:
        job = Job.objects.select_related('employer').get(pk=job_id)
    except Job.DoesNotExist:
        return Response({'detail': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)

    if job.status != Job.Status.ACTIVE:
        return Response(
            {'detail': 'This job is not accepting applications.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if job.is_expired:
        return Response(
            {'detail': 'This job has expired.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if job.application_deadline and job.application_deadline < timezone.now():
        return Response(
            {'detail': 'The application deadline for this job has passed.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if Application.objects.filter(applicant=request.user, job=job).exists():
        return Response(
            {'detail': 'You have already applied to this job.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        draft, cached = get_or_create_draft(
            user=request.user,
            job=job,
            regenerate=regenerate,
        )
    except LLMError as exc:
        record_audit(
            user=request.user,
            job=job,
            action=CoverLetterAudit.Action.FAILED,
            metadata={'error_code': 'llm_error', 'message': str(exc)},
        )
        return Response(
            {'detail': 'Cover letter generation is temporarily unavailable.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    audit_action = (
        CoverLetterAudit.Action.PREVIEWED
        if cached
        else CoverLetterAudit.Action.GENERATED
    )
    record_audit(
        user=request.user,
        job=job,
        draft=draft,
        action=audit_action,
        metadata={'cached': cached, 'regenerate': regenerate},
    )

    payload = {
        'draft_id': draft.id,
        'cover_letter': draft.cover_letter,
        'highlights': draft.highlights,
        'cached': cached,
        'generator': draft.generator,
        'profile_hash': draft.profile_hash,
        'disclaimer': DISCLAIMER,
    }
    return Response(
        CoverLetterPreviewResponseSerializer(payload).data,
        status=status.HTTP_200_OK,
    )
