from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from apps.jobs.seo_views import generate_sitemap, generate_robots_txt

def health_check(request):
    """Health check endpoint for Render / load balancers."""
    return JsonResponse({'status': 'ok'})

urlpatterns = [
    path('admin/', admin.site.urls),

    # Health check (used by Render)
    path('api/v1/health/', health_check, name='health'),

    # SEO endpoints (must be before API catch-all)
    path('sitemap.xml', generate_sitemap, name='sitemap'),
    path('robots.txt', generate_robots_txt, name='robots'),

    # API v1
    path('api/v1/', include([
        path('', include('apps.users.urls')),
        path('', include('apps.profiles.urls')),
        path('', include('apps.jobs.urls')),
        path('', include('apps.applications.urls')),
        path('', include('apps.notifications.urls')),
        path('', include('apps.chat.urls')),
        path('', include('apps.analytics.urls')),
    ])),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

    try:
        import debug_toolbar
        urlpatterns += [path('__debug__/', include(debug_toolbar.urls))]
    except ImportError:
        pass
