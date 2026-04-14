from django.db.models import F
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from core.permissions import IsSeeker, IsApplicationOwner, IsJobOwner, IsVerifiedUser
from core.pagination import StandardResultsPagination
from core.throttles import ApplicationCreateThrottle

from .models import Application, ApplicationStatusLog
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
            return [permissions.IsAuthenticated(), IsSeeker(), IsVerifiedUser()]
        elif self.action in ["update_status"]:
            return [
                permissions.IsAuthenticated(),
                IsApplicationOwner(),
                IsVerifiedUser(),
            ]
        elif self.action == "withdraw":
            return [
                permissions.IsAuthenticated(),
                IsApplicationOwner(),
                IsVerifiedUser(),
            ]
        return [permissions.IsAuthenticated()]

    def get_throttles(self):
        if self.action == "create":
            return [ApplicationCreateThrottle()]
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
        # Increment application count on job
        from apps.jobs.models import Job

        Job.objects.filter(pk=application.job_id).update(
            applications_count=F("applications_count") + 1
        )

    @action(detail=True, methods=["post"], url_path="update-status")
    def update_status(self, request, pk=None):
        """Update application status (employer only)."""
        application = self.get_object()

        # Verify the requesting user is the job's employer
        if application.job.employer.user != request.user:
            return Response(
                {"detail": "You do not have permission to update this application."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ApplicationStatusUpdateSerializer(
            data=request.data, context={"application": application, "request": request}
        )
        serializer.is_valid(raise_exception=True)

        old_status = application.status
        new_status = serializer.validated_data["status"]
        notes = serializer.validated_data.get("notes", "")

        # Update status
        application.status = new_status
        application.save(update_fields=["status", "updated_at"])

        # Create status log
        ApplicationStatusLog.objects.create(
            application=application,
            from_status=old_status,
            to_status=new_status,
            changed_by=request.user,
            notes=notes,
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

        old_status = application.status
        application.status = Application.Status.WITHDRAWN
        application.save(update_fields=["status", "updated_at"])

        ApplicationStatusLog.objects.create(
            application=application,
            from_status=old_status,
            to_status=Application.Status.WITHDRAWN,
            changed_by=request.user,
            notes="Application withdrawn by applicant.",
        )

        return Response(
            ApplicationDetailSerializer(application, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )
