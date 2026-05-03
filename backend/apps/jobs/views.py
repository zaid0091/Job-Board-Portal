from django.core.cache import cache

# Example: cache job list for 5 minutes
from django.http import JsonResponse


def cached_job_list(request):
    jobs = cache.get("jobs")
    if jobs is None:
        jobs = list(Job.objects.filter(status=Job.Status.ACTIVE).values())
        cache.set("jobs", jobs, timeout=300)  # 5 minutes
    return JsonResponse({"jobs": jobs})


from django.db.models import F
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import viewsets, generics, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from core.permissions import IsEmployer, IsSeeker, IsJobOwner, ReadOnly
from core.pagination import StandardResultsPagination
from core.throttles import JobCreateThrottle
from core.mixins import ReadWriteSerializerMixin

from .models import Job, JobCategory, SavedJob
from .serializers import (
    JobListSerializer,
    JobDetailSerializer,
    JobCreateUpdateSerializer,
    JobCategorySerializer,
    SavedJobSerializer,
)
from .filters import JobFilter


class JobViewSet(ReadWriteSerializerMixin, viewsets.ModelViewSet):
    """
    ViewSet for job CRUD operations.
    - List: Anyone can see active jobs
    - Create: Only employers
    - Update/Delete: Only job owner
    - Retrieve: Anyone (increments view count)
    """

    pagination_class = StandardResultsPagination
    filterset_class = JobFilter
    read_serializer_class = JobDetailSerializer
    write_serializer_class = JobCreateUpdateSerializer
    lookup_field = "slug"

    def get_permissions(self):
        if self.action in ["create"]:
            return [permissions.IsAuthenticated(), IsEmployer()]
        elif self.action in ["update", "partial_update", "destroy", "applicants"]:
            return [permissions.IsAuthenticated(), IsJobOwner()]
        elif self.action in ["my_jobs"]:
            return [permissions.IsAuthenticated(), IsEmployer()]
        return [permissions.AllowAny()]

    def get_throttles(self):
        if self.action == "create":
            return [JobCreateThrottle()]
        return super().get_throttles()

    def get_queryset(self):
        queryset = Job.objects.select_related(
            "employer", "employer__user", "category"
        ).prefetch_related("skills_required")

        if self.action == "list":
            # Public listing only shows active jobs
            queryset = queryset.filter(status=Job.Status.ACTIVE)
        elif self.action == "my_jobs":
            # Employer sees their own jobs (all statuses)
            queryset = queryset.filter(employer__user=self.request.user)
        elif self.action == "applicants":
            # Strict filtering for applicants action
            queryset = queryset.filter(employer__user=self.request.user)

        return queryset

    def get_serializer_class(self):
        if self.action == "list":
            return JobListSerializer
        return super().get_serializer_class()

    def perform_create(self, serializer):
        employer_profile = self.request.user.employer_profile
        serializer.save(employer=employer_profile, status=Job.Status.ACTIVE)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count atomically
        Job.objects.filter(pk=instance.pk).update(views_count=F("views_count") + 1)
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="my-jobs")
    def my_jobs(self, request):
        """Get all jobs posted by the authenticated employer."""
        queryset = self.get_queryset()
        queryset = self.filter_queryset(queryset)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = JobListSerializer(
                page, many=True, context={"request": request}
            )
            return self.get_paginated_response(serializer.data)

        serializer = JobListSerializer(
            queryset, many=True, context={"request": request}
        )
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def applicants(self, request, slug=None):
        """Get applicants for a specific job (employer only)."""
        job = self.get_object()
        from apps.applications.serializers import ApplicationListSerializer

        applications = job.applications.select_related(
            "applicant", "applicant__seeker_profile"
        ).all()

        page = self.paginate_queryset(applications)
        if page is not None:
            serializer = ApplicationListSerializer(
                page, many=True, context={"request": request}
            )
            return self.get_paginated_response(serializer.data)

        serializer = ApplicationListSerializer(
            applications, many=True, context={"request": request}
        )
        return Response(serializer.data)


class JobCategoryListView(generics.ListAPIView):
    """List all active job categories with caching."""

    queryset = JobCategory.objects.filter(is_active=True, parent__isnull=True)
    serializer_class = JobCategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    @method_decorator(cache_page(60 * 60))  # Cache for 1 hour
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


class SavedJobViewSet(viewsets.ModelViewSet):
    """ViewSet for managing saved/bookmarked jobs."""

    serializer_class = SavedJobSerializer
    permission_classes = [permissions.IsAuthenticated, IsSeeker]
    pagination_class = StandardResultsPagination
    http_method_names = ["get", "post", "delete", "head", "options"]

    def get_queryset(self):
        return SavedJob.objects.filter(user=self.request.user).select_related(
            "job", "job__employer"
        )

    def destroy(self, request, *args, **kwargs):
        """Allow deletion by job ID instead of saved_job ID."""
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
