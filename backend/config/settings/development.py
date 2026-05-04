import os

_environment = os.environ.get("DJANGO_SETTINGS_MODULE", "")

# Security: Fail-safe to prevent using development settings in production
if os.environ.get("ENVIRONMENT") == "production" or "production" in _environment:
    raise RuntimeError(
        "ERROR: Development settings cannot be used in production! "
        "Set ENVIRONMENT=development or use config.settings.production."
    )

from .base import *  # noqa

# Enable local memory cache for development
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "unique-snowflake",
    }
}

DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# Generate a unique dev key per install to prevent accidental reuse
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", os.urandom(64).hex())

# SQLite for local development (no PostgreSQL required)
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# Remove django.contrib.postgres for SQLite compatibility
INSTALLED_APPS = [app for app in INSTALLED_APPS if app != "django.contrib.postgres"]  # noqa

# Use console email backend in development
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Local file storage instead of S3
DEFAULT_FILE_STORAGE = "django.core.files.storage.FileSystemStorage"

# Disable throttling in development
REST_FRAMEWORK["DEFAULT_THROTTLE_CLASSES"] = []  # noqa

# Django Debug Toolbar
try:
    import debug_toolbar  # noqa

    INSTALLED_APPS += ["debug_toolbar"]  # noqa
    MIDDLEWARE.insert(0, "debug_toolbar.middleware.DebugToolbarMiddleware")  # noqa
except ImportError:
    pass

INTERNAL_IPS = ["127.0.0.1"]

# CORS - Allow all in development with credentials
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

# Run Celery tasks synchronously in development (no broker needed)
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True
CELERY_BROKER_URL = "memory://"
CELERY_RESULT_BACKEND = "cache"
CELERY_CACHE_BACKEND = "memory"

# Add browsable API renderer in development
REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] = [
    "rest_framework.renderers.JSONRenderer",
    "rest_framework.renderers.BrowsableAPIRenderer",
]
# To use Redis cache:
# 1. Install Redis server and start it (https://redis.io/download or use Docker: docker run -p 6379:6379 redis)
# 2. Install django-redis in your virtualenv:
#    pip install django-redis
# 3. Restart your Django server.
