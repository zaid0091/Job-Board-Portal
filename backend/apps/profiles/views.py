import hashlib
import logging
from django.conf import settings
from django.core.cache import cache
from django.db import transaction
from django.utils import timezone
from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser

from core.permissions import IsEmployer, IsSeeker
from .models import (
    EmployerProfile, SeekerProfile,
    Skill, Experience, Education,
    ResumeParseJob, ParsedResumeResult,
    ResumeAutofillAudit, ProfileAutofillDraft,
)
from .serializers import (
    EmployerProfileSerializer, SeekerProfileSerializer,
    SkillSerializer, ExperienceSerializer, EducationSerializer,
    EmployerProfilePublicSerializer,
    ResumeParseCreateSerializer, ResumeParseJobSerializer,
    ParsedResumeResultSerializer, ResumeParseApplySerializer,
)
from .services.resume_apply import apply_parsed_resume_to_profile
from .tasks import run_resume_parse_job

logger = logging.getLogger(__name__)


class EmployerProfileView(generics.RetrieveUpdateAPIView):
    """GET/PUT/PATCH /api/v1/profiles/employer/me/"""
    serializer_class = EmployerProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsEmployer]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        return self.request.user.employer_profile


class EmployerProfilePublicView(generics.RetrieveAPIView):
    """GET /api/v1/profiles/employers/:id/"""
    serializer_class = EmployerProfilePublicSerializer
    permission_classes = [permissions.AllowAny]
    queryset = EmployerProfile.objects.all()
    lookup_field = 'id'


class SeekerProfileView(generics.RetrieveUpdateAPIView):
    """GET/PUT/PATCH /api/v1/profiles/seeker/me/"""
    serializer_class = SeekerProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsSeeker]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        return self.request.user.seeker_profile


class ExperienceViewSet(viewsets.ModelViewSet):
    """CRUD for seeker work experience."""
    serializer_class = ExperienceSerializer
    permission_classes = [permissions.IsAuthenticated, IsSeeker]

    def get_queryset(self):
        return Experience.objects.filter(
            seeker=self.request.user.seeker_profile
        )

    def perform_create(self, serializer):
        serializer.save(seeker=self.request.user.seeker_profile)


class EducationViewSet(viewsets.ModelViewSet):
    """CRUD for seeker education entries."""
    serializer_class = EducationSerializer
    permission_classes = [permissions.IsAuthenticated, IsSeeker]

    def get_queryset(self):
        return Education.objects.filter(
            seeker=self.request.user.seeker_profile
        )

    def perform_create(self, serializer):
        serializer.save(seeker=self.request.user.seeker_profile)


class SkillListView(generics.ListAPIView):
    """GET /api/v1/profiles/skills/ — List all skills with caching."""
    serializer_class = SkillSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Skill.objects.all()
    search_fields = ['name']
    pagination_class = None

    def list(self, request, *args, **kwargs):
        cached = cache.get('skills')
        if cached is not None:
            from rest_framework.response import Response
            return Response(cached)

        response = super().list(request, *args, **kwargs)
        cache.set('skills', response.data, timeout=60 * 60 * 24)  # Cache for 24 hours
        return response


class ResumeParseCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSeeker]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = ResumeParseCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        resume_file = serializer.validated_data['resume']

        file_hash = hashlib.sha256(resume_file.read()).hexdigest()
        resume_file.seek(0)

        active_jobs = ResumeParseJob.objects.filter(
            user=request.user,
            status__in=[ResumeParseJob.Status.QUEUED, ResumeParseJob.Status.PROCESSING],
        )
        active_jobs.update(
            status=ResumeParseJob.Status.DISCARDED,
            completed_at=timezone.now(),
            error_code='replaced_by_new_upload',
            error_message='Superseded by newer resume parse request.',
        )

        job = ResumeParseJob.objects.create(
            user=request.user,
            source_file=resume_file,
            source_hash=file_hash,
            status=ResumeParseJob.Status.QUEUED,
            metadata={'retention_days': getattr(settings, 'RESUME_PARSE_RETENTION_DAYS', 30)},
        )
        try:
            run_resume_parse_job.delay(str(job.id))
        except Exception as exc:
            # Keep local dev resilient if broker is unavailable.
            logger.warning(
                'Celery broker unavailable for resume parse job %s; running inline. Error: %s',
                job.id,
                exc,
            )
            run_resume_parse_job.apply(args=[str(job.id)])
        return Response(ResumeParseJobSerializer(job).data, status=status.HTTP_202_ACCEPTED)


class ResumeParseStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSeeker]

    def get(self, request, job_id):
        job = self._get_job(request.user, job_id)
        return Response(ResumeParseJobSerializer(job).data)

    def _get_job(self, user, job_id):
        return ResumeParseJob.objects.get(id=job_id, user=user)


class ResumeParsePreviewView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSeeker]

    def get(self, request, job_id):
        job = ResumeParseJob.objects.get(id=job_id, user=request.user)
        if job.status == ResumeParseJob.Status.FAILED:
            return Response({'detail': 'Parse job failed.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            result = job.result
        except ParsedResumeResult.DoesNotExist:
            return Response({'detail': 'Parse result not ready yet.'}, status=status.HTTP_404_NOT_FOUND)

        ResumeAutofillAudit.objects.create(
            user=request.user,
            job=job,
            action=ResumeAutofillAudit.Action.PREVIEWED,
            metadata={'status': job.status},
        )
        return Response(ParsedResumeResultSerializer(result).data)


class ResumeParseApplyView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSeeker]

    def post(self, request, job_id):
        job = ResumeParseJob.objects.select_related('user', 'user__seeker_profile').get(
            id=job_id, user=request.user
        )
        try:
            result = job.result
        except ParsedResumeResult.DoesNotExist:
            return Response({'detail': 'Parse result not ready yet.'}, status=status.HTTP_404_NOT_FOUND)

        input_serializer = ResumeParseApplySerializer(data=request.data or {})
        input_serializer.is_valid(raise_exception=True)
        payload = result.normalized_payload or {}
        payload.update(input_serializer.validated_data)

        with transaction.atomic():
            response_data = apply_parsed_resume_to_profile(
                user=request.user,
                job=job,
                payload=payload,
                edited_before_apply=bool(input_serializer.validated_data),
            )

        return Response(response_data)


class ResumeParseDiscardView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSeeker]

    def post(self, request, job_id):
        job = ResumeParseJob.objects.get(id=job_id, user=request.user)
        job.status = ResumeParseJob.Status.DISCARDED
        job.completed_at = timezone.now()
        job.save(update_fields=['status', 'completed_at', 'updated_at'])
        ResumeAutofillAudit.objects.create(
            user=request.user,
            job=job,
            action=ResumeAutofillAudit.Action.REJECTED,
            metadata={'reason': 'discarded_by_user'},
        )
        return Response({'message': 'Parsed resume discarded.'}, status=status.HTTP_200_OK)
