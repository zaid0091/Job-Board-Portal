from django.core.cache import cache
from django.db.models import Sum
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsEmployer, IsSeeker
from core.throttles import AnalyticsThrottle
from .services import get_employer_dashboard_data, get_seeker_dashboard_data


class PlatformStatsView(APIView):
    """Public platform-wide statistics for the homepage with caching."""

    permission_classes = [permissions.AllowAny]
    throttle_classes = [AnalyticsThrottle]

    def get(self, request):
        cache_key = "platform_stats"
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)

        from apps.jobs.models import Job
        from apps.profiles.models import EmployerProfile
        from apps.applications.models import Application

        active_jobs = Job.objects.filter(status=Job.Status.ACTIVE).count()
        companies = EmployerProfile.objects.count()
        applications = Application.objects.count()

        def obscure(num):
            if num >= 100:
                return (num // 100) * 100
            if num >= 10:
                return (num // 10) * 10
            return num

        data = {
            "active_jobs": obscure(active_jobs),
            "companies": obscure(companies),
            "applications": obscure(applications),
        }

        cache.set(cache_key, data, timeout=60 * 10)  # Cache for 10 minutes
        return Response(data)


class EmployerDashboardView(APIView):
    """Dashboard analytics for employers with per-user caching."""

    permission_classes = [permissions.IsAuthenticated, IsEmployer]
    throttle_classes = [AnalyticsThrottle]

    def get(self, request):
        cache_key = f"employer_dashboard_{request.user.id}"
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)

        data = get_employer_dashboard_data(request.user)
        cache.set(cache_key, data, timeout=60 * 5)  # Cache for 5 minutes
        return Response(data)


class SeekerDashboardView(APIView):
    """Dashboard analytics for job seekers with per-user caching."""

    permission_classes = [permissions.IsAuthenticated, IsSeeker]
    throttle_classes = [AnalyticsThrottle]

    def get(self, request):
        cache_key = f"seeker_dashboard_{request.user.id}"
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)

        data = get_seeker_dashboard_data(request.user)
        cache.set(cache_key, data, timeout=60 * 5)  # Cache for 5 minutes
        return Response(data)
