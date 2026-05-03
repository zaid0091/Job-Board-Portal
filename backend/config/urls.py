from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # API v1
    path('api/v1/', include([
        path('', include('apps.users.urls')),
        path('', include('apps.profiles.urls')),
        path('', include('apps.jobs.urls')),
        path('', include('apps.applications.urls')),
        path('', include('apps.notifications.urls')),
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
