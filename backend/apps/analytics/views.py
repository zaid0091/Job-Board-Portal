from django.db.models import Sum
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsEmployer, IsSeeker
from .services import get_employer_dashboard_data, get_seeker_dashboard_data


class PlatformStatsView(APIView):
    """Public platform-wide statistics for the homepage."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from apps.jobs.models import Job
        from apps.profiles.models import EmployerProfile
        from apps.applications.models import Application

        active_jobs = Job.objects.filter(status=Job.Status.ACTIVE).count()
        companies = EmployerProfile.objects.count()
        applications = Application.objects.count()

        return Response({
            'active_jobs': active_jobs,
            'companies': companies,
            'applications': applications,
        })


class EmployerDashboardView(APIView):
    """Dashboard analytics for employers."""
    permission_classes = [permissions.IsAuthenticated, IsEmployer]

    def get(self, request):
        data = get_employer_dashboard_data(request.user)
        return Response(data)


class SeekerDashboardView(APIView):
    """Dashboard analytics for job seekers."""
    permission_classes = [permissions.IsAuthenticated, IsSeeker]

    def get(self, request):
        data = get_seeker_dashboard_data(request.user)
        return Response(data)
