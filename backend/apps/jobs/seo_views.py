import xml.etree.ElementTree as ET
from datetime import datetime
from django.http import HttpResponse
from django.conf import settings
from django.db.models import Q

from apps.jobs.models import Job


def get_site_url():
    """Get the canonical site URL from settings or default."""
    return getattr(settings, 'SITE_URL', 'https://jobly.com')


def generate_sitemap(request):
    """
    Generate a dynamic sitemap.xml with:
    - Static pages
    - All active job listings
    - Employer profiles
    - Categories
    """
    site_url = get_site_url()
    ns = 'http://www.sitemaps.org/schemas/sitemap/0.9'
    ET.register_namespace('', ns)

    urlset = ET.Element('urlset', xmlns=ns)

    def add_url(loc, changefreq='weekly', priority='0.8', lastmod=None):
        url_elem = ET.SubElement(urlset, 'url')
        ET.SubElement(url_elem, 'loc').text = f'{site_url}{loc}'
        ET.SubElement(url_elem, 'changefreq').text = changefreq
        ET.SubElement(url_elem, 'priority').text = priority
        if lastmod:
            if isinstance(lastmod, datetime):
                lastmod = lastmod.isoformat()
            ET.SubElement(url_elem, 'lastmod').text = lastmod

    # Static pages
    add_url('/', changefreq='daily', priority='1.0')
    add_url('/jobs', changefreq='daily', priority='0.9')
    add_url('/about', changefreq='monthly', priority='0.5')
    add_url('/contact', changefreq='monthly', priority='0.5')
    add_url('/privacy', changefreq='yearly', priority='0.3')
    add_url('/terms', changefreq='yearly', priority='0.3')

    # Active job listings (most important dynamic content)
    active_jobs = Job.objects.filter(
        status='ACTIVE',
        is_expired=False,
    ).select_related('category', 'employer').only(
        'slug', 'updated_at', 'created_at', 'is_featured'
    ).order_by('-is_featured', '-created_at')[:1000]

    for job in active_jobs:
        priority = '0.9' if job.is_featured else '0.8'
        add_url(
            f'/jobs/{job.slug}',
            changefreq='weekly',
            priority=priority,
            lastmod=job.updated_at or job.created_at,
        )

    # Employer company profiles
    try:
        from apps.profiles.models import EmployerProfile
        employers = EmployerProfile.objects.filter(
            Q(user__is_active=True)
        ).only('slug', 'updated_at').order_by('-updated_at')[:500]

        for employer in employers:
            add_url(
                f'/employers/{employer.id}',
                changefreq='weekly',
                priority='0.6',
                lastmod=employer.updated_at,
            )
    except ImportError:
        pass

    # Categories
    try:
        from apps.jobs.models import JobCategory
        categories = JobCategory.objects.filter(
            is_active=True
        ).only('slug', 'updated_at').order_by('name')

        for category in categories:
            add_url(
                f'/jobs?category={category.slug}',
                changefreq='weekly',
                priority='0.7',
                lastmod=category.updated_at,
            )
    except ImportError:
        pass

    xml_str = ET.tostring(urlset, encoding='utf-8', xml_declaration=True)
    response = HttpResponse(xml_str, content_type='application/xml')
    response['Cache-Control'] = 'public, max-age=3600'
    return response


def generate_robots_txt(request):
    """Generate robots.txt dynamically based on environment."""
    site_url = get_site_url()
    is_production = not getattr(settings, 'DEBUG', True)

    lines = [
        'User-agent: *',
    ]

    if not is_production:
        lines.append('Disallow: /')
    else:
        lines.append('Allow: /')
        # Disallow admin and API paths
        lines.append('Disallow: /admin/')
        lines.append('Disallow: /api/')
        lines.append('Disallow: /seeker/dashboard/')
        lines.append('Disallow: /employer/dashboard/')
        lines.append('Disallow: /employer/jobs/create/')
        lines.append('Disallow: /employer/applications/')
        lines.append('Disallow: /login/')
        lines.append('Disallow: /register/')
        lines.append('Disallow: /settings/')

    lines.append('')
    lines.append(f'Sitemap: {site_url}/sitemap.xml')
    lines.append('')

    response = HttpResponse('\n'.join(lines), content_type='text/plain')
    response['Cache-Control'] = 'public, max-age=86400'
    return response
