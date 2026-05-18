from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from core.permissions import IsEmployer, IsSeeker, IsApplicationOwner
from core.pagination import StandardResultsPagination
from core.throttles import ApplicationCreateThrottle, CoverLetterPreviewThrottle

from .models import Application
from .services import (
    increment_job_applications_count,
    transition_application_status,
    withdraw_application,
)
from .views_cover_letter import handle_preview_cover_letter
from .serializers import (
    ApplicationListSerializer,
    ApplicationDetailSerializer,
    ApplicationCreateSerializer,
    ApplicationStatusUpdateSerializer,
)


class ApplicationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for job applications.
    - Seekers can create and view their own applications
    - Employers can view and update status of applications to their jobs
    """

    pagination_class = StandardResultsPagination

    def get_permissions(self):
        if self.action == "create":
            return [permissions.IsAuthenticated(), IsSeeker()]
        elif self.action == "preview_cover_letter":
            return [permissions.IsAuthenticated(), IsSeeker()]
        elif self.action in ["update_status"]:
            return [permissions.IsAuthenticated(), IsEmployer()]
        elif self.action == "withdraw":
            return [
                permissions.IsAuthenticated(),
                IsApplicationOwner(),
            ]
        return [permissions.IsAuthenticated()]

    def get_throttles(self):
        if self.action == "create":
            return [ApplicationCreateThrottle()]
        if self.action == "preview_cover_letter":
            return [CoverLetterPreviewThrottle()]
        return super().get_throttles()

    def get_serializer_class(self):
        if self.action == "create":
            return ApplicationCreateSerializer
        elif self.action == "list":
            return ApplicationListSerializer
        elif self.action == "update_status":
            return ApplicationStatusUpdateSerializer
        return ApplicationDetailSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Application.objects.select_related(
            "job", "job__employer", "job__employer__user", "applicant"
        )

        if user.is_seeker:
            # Seekers see their own applications
            return queryset.filter(applicant=user)
        elif user.is_employer:
            # Employers see applications to their jobs
            return queryset.filter(job__employer__user=user)
        elif user.is_admin:
            return queryset.all()

        return queryset.none()

    def perform_create(self, serializer):
        application = serializer.save()
        increment_job_applications_count(application.job_id)

    @action(
        detail=False,
        methods=["post"],
        url_path="preview-cover-letter",
        url_name="preview-cover-letter",
    )
    def preview_cover_letter(self, request):
        """POST /api/v1/applications/preview-cover-letter/"""
        return handle_preview_cover_letter(request)

    @action(detail=True, methods=["post"], url_path="update-status")
    def update_status(self, request, pk=None):
        """Update application status (employer only; queryset scoped to employer's jobs)."""
        application = self.get_object()

        serializer = ApplicationStatusUpdateSerializer(
            data=request.data, context={"application": application, "request": request}
        )
        serializer.is_valid(raise_exception=True)

        transition_application_status(
            application,
            new_status=serializer.validated_data["status"],
            changed_by=request.user,
            notes=serializer.validated_data.get("notes", ""),
        )

        return Response(
            ApplicationDetailSerializer(application, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def withdraw(self, request, pk=None):
        """Withdraw an application (seeker only)."""
        application = self.get_object()

        if not application.can_transition_to("WITHDRAWN"):
            return Response(
                {
                    "detail": f"Cannot withdraw application with status {application.status}."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        withdraw_application(application, changed_by=request.user)

        return Response(
            ApplicationDetailSerializer(application, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )
