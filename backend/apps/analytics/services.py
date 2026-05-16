from datetime import timedelta

from django.db.models import Count, Sum, Avg, Q
from django.db.models.functions import TruncDate
from django.utils import timezone


def get_employer_dashboard_data(user):
    """Generate dashboard analytics for an employer."""
    from apps.jobs.models import Job
    from apps.applications.models import Application

    employer_profile = user.employer_profile

    # Job statistics
    jobs = Job.objects.filter(employer=employer_profile)
    total_jobs = jobs.count()
    active_jobs = jobs.filter(status=Job.Status.ACTIVE).count()
    total_views = jobs.aggregate(total=Sum('views_count'))['total'] or 0
    total_applications = jobs.aggregate(total=Sum('applications_count'))['total'] or 0

    # Application statistics
    applications = Application.objects.filter(job__employer=employer_profile)
    applications_by_status = dict(
        applications.values_list('status').annotate(count=Count('id')).values_list('status', 'count')
    )

    # Recent applications (last 30 days)
    thirty_days_ago = timezone.now() - timedelta(days=30)
    recent_applications = applications.filter(created_at__gte=thirty_days_ago).count()

    # Applications per day (last 30 days)
    daily_applications = list(
        applications.filter(created_at__gte=thirty_days_ago)
        .annotate(day=TruncDate('created_at'))
        .values('day')
        .annotate(count=Count('id'))
        .order_by('day')
    )

    # Top performing jobs
    top_jobs = list(
        jobs.filter(status=Job.Status.ACTIVE)
        .order_by('-applications_count')[:5]
        .values('id', 'title', 'slug', 'applications_count', 'views_count')
    )

    return {
        'overview': {
            'total_jobs': total_jobs,
            'active_jobs': active_jobs,
            'total_views': total_views,
            'total_applications': total_applications,
            'recent_applications': recent_applications,
        },
        'applications_by_status': applications_by_status,
        'daily_applications': daily_applications,
        'top_jobs': top_jobs,
    }


def get_seeker_dashboard_data(user):
    """Generate dashboard analytics for a job seeker."""
    from apps.applications.models import Application
    from apps.jobs.models import SavedJob

    # Application statistics
    applications = Application.objects.filter(applicant=user)
    total_applications = applications.count()
    applications_by_status = dict(
        applications.values_list('status').annotate(count=Count('id')).values_list('status', 'count')
    )

    # Recent applications
    recent_applications = list(
        applications.select_related('job', 'job__employer')
        .order_by('-created_at')[:10]
        .values(
            'id', 'status', 'created_at',
            'job__title', 'job__slug',
            'job__employer__company_name',
            'job__employer__id',
        )
    )

    # Saved jobs count
    saved_jobs_count = SavedJob.objects.filter(user=user).count()

    # Hired jobs
    hired_applications = list(
        applications.filter(status=Application.Status.HIRED)
        .select_related('job', 'job__employer')
        .order_by('-updated_at')
        .values(
            'id', 'updated_at',
            'job__title', 'job__slug',
            'job__employer__company_name',
            'job__employer__id',
        )
    )

    # Application response rate
    responded = applications.exclude(
        status__in=[Application.Status.PENDING, Application.Status.WITHDRAWN]
    ).count()
    response_rate = (responded / total_applications * 100) if total_applications > 0 else 0

    return {
        'overview': {
            'total_applications': total_applications,
            'saved_jobs': saved_jobs_count,
            'response_rate': round(response_rate, 1),
            'hired_count': applications.filter(status=Application.Status.HIRED).count(),
        },
        'applications_by_status': applications_by_status,
        'recent_applications': recent_applications,
        'hired_jobs': hired_applications,
    }
