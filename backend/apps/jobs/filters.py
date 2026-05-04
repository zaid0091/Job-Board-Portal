import django_filters
from django.conf import settings
from django.db import connection
from django.db.models import Q, F, Case, When, FloatField

from .models import Job


class JobFilter(django_filters.FilterSet):
    """Comprehensive filter for job listings with full-text search."""

    # Text search — uses PostgreSQL full-text search + trigram fuzzy fallback
    search = django_filters.CharFilter(method='filter_search', label='Search')

    # Choice filters
    job_type = django_filters.ChoiceFilter(choices=Job.JobType.choices)
    experience_level = django_filters.ChoiceFilter(choices=Job.ExperienceLevel.choices)
    status = django_filters.ChoiceFilter(choices=Job.Status.choices)

    # Boolean filters
    is_remote = django_filters.BooleanFilter()
    is_featured = django_filters.BooleanFilter()

    # Location
    location = django_filters.CharFilter(lookup_expr='icontains')

    # Salary filters
    salary_min = django_filters.NumberFilter(
        field_name='salary_min', lookup_expr='gte'
    )
    salary_max = django_filters.NumberFilter(
        field_name='salary_max', lookup_expr='lte'
    )

    # Category
    category = django_filters.NumberFilter(field_name='category__id')
    category_slug = django_filters.CharFilter(field_name='category__slug')

    # Skills
    skills = django_filters.CharFilter(
        method='filter_skills', label='Skills (comma separated)'
    )

    # Date filters
    posted_after = django_filters.DateTimeFilter(
        field_name='created_at', lookup_expr='gte'
    )
    posted_before = django_filters.DateTimeFilter(
        field_name='created_at', lookup_expr='lte'
    )

    # Employer
    employer = django_filters.UUIDFilter(field_name='employer__id')
    company = django_filters.CharFilter(
        field_name='employer__company_name', lookup_expr='icontains'
    )

    # Ordering
    ordering = django_filters.OrderingFilter(
        fields=(
            ('created_at', 'date'),
            ('salary_min', 'salary'),
            ('views_count', 'views'),
            ('applications_count', 'applications'),
            ('title', 'title'),
        ),
        field_labels={
            'date': 'Date Posted',
            'salary': 'Salary',
            'views': 'View Count',
            'applications': 'Application Count',
            'title': 'Job Title',
        }
    )

    class Meta:
        model = Job
        fields = [
            'search', 'job_type', 'experience_level', 'status',
            'is_remote', 'is_featured', 'location',
            'salary_min', 'salary_max',
            'category', 'category_slug', 'skills',
            'posted_after', 'posted_before',
            'employer', 'company',
        ]

    @property
    def _is_postgres(self):
        return connection.vendor == 'postgresql'

    def filter_search(self, queryset, name, value):
        """
        Full-text search with ranking + trigram fuzzy fallback (PostgreSQL).
        Falls back to icontains search for SQLite (development).

        PostgreSQL strategy:
        1. Annotate both FTS rank and trigram similarity on the same queryset
        2. Use FTS match as primary filter, OR trigram match for typo tolerance
        3. Order by FTS rank (weighted) + trigram similarity as tiebreaker
        """
        if not self._is_postgres:
            # SQLite fallback: use icontains across title, description, company, location
            return queryset.filter(
                Q(title__icontains=value) |
                Q(description__icontains=value) |
                Q(employer__company_name__icontains=value) |
                Q(location__icontains=value) |
                Q(requirements__icontains=value)
            ).distinct()

        # PostgreSQL: full-text search with ranking + trigram fuzzy matching
        from django.contrib.postgres.search import SearchQuery, SearchRank, TrigramSimilarity

        query = SearchQuery(value, search_type='plainto_tsquery', config='english')

        return queryset.annotate(
            search_rank=SearchRank(F('search_vector'), query),
            trigram_sim=TrigramSimilarity('title', value),
        ).filter(
            Q(search_rank__gt=0.0) | Q(trigram_sim__gte=0.15)
        ).annotate(
            relevance=Case(
                When(search_rank__gt=0.0, then=F('search_rank') * 2 + F('trigram_sim')),
                default=F('trigram_sim'),
                output_field=FloatField(),
            )
        ).order_by('-relevance', '-trigram_sim')

    def filter_skills(self, queryset, name, value):
        """Filter by skill slugs (comma-separated)."""
        skill_slugs = [s.strip() for s in value.split(',') if s.strip()]
        if skill_slugs:
            return queryset.filter(
                skills_required__slug__in=skill_slugs
            ).distinct()
        return queryset
