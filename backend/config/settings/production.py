from .base import *  # noqa
import sentry_sdk
import dj_database_url

DEBUG = False

# ─── ALLOWED HOSTS ───
# Render sets RENDER=True; Vercel sets VERCEL=true
_ALLOWED = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1')
ALLOWED_HOSTS = [h.strip() for h in _ALLOWED.split(',') if h.strip()]  # noqa

# ─── DATABASE: Neon Serverless PostgreSQL ───
# Use DATABASE_URL from environment (provided by Neon or Render)
_database_url = os.environ.get('DATABASE_URL')
if _database_url:
    DATABASES = {
        'default': dj_database_url.parse(
            _database_url,
            conn_max_age=600,
            conn_health_checks=True,
            ssl_require=True,
        )
    }
else:
    raise RuntimeError(
        "DATABASE_URL is not set in production.\n"
        "Get it from Neon: https://neon.tech → Your Project → Connection Details"
    )

# ─── SECURITY ───
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# ─── STATIC FILES: WhiteNoise ───
# WhiteNoise handles Django admin statics efficiently
STORAGES = {
    'default': {
        'BACKEND': 'cloudinary_storage.storage.MediaCloudinaryStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}

# ─── MEDIA FILES: Cloudinary (free tier) ───
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.environ.get('CLOUDINARY_CLOUD_NAME'),
    'API_KEY': os.environ.get('CLOUDINARY_API_KEY'),
    'API_SECRET': os.environ.get('CLOUDINARY_API_SECRET'),
    'SECURE': True,
    'MEDIA_TAG': 'jobboard',
}

# Validate Cloudinary config at startup
if not all([
    os.environ.get('CLOUDINARY_CLOUD_NAME'),
    os.environ.get('CLOUDINARY_API_KEY'),
    os.environ.get('CLOUDINARY_API_SECRET'),
]):
    import logging
    logging.getLogger(__name__).warning(
        "Cloudinary credentials not set — media uploads (resumes, avatars) will fail. "
        "Get free credentials at https://cloudinary.com"
    )

# ─── CORS: Allow Vercel frontend ───
_FRONTEND_URL = os.environ.get('FRONTEND_URL', '')
if _FRONTEND_URL:
    CORS_ALLOWED_ORIGINS = [
        _FRONTEND_URL,
        _FRONTEND_URL.replace('https://', 'https://www.'),
        # Vercel preview deployments
        f"https://{os.environ.get('VERCEL_GIT_REPO_SLUG', '').replace('/', '-')}-*.vercel.app",
    ]
CORS_ALLOW_CREDENTIALS = True

# ─── CSRF: Trust Render proxy ───
CSRF_TRUSTED_ORIGINS = [
    f"https://{host}" for host in ALLOWED_HOSTS if host not in ('localhost', '127.0.0.1')
]
if _FRONTEND_URL:
    CSRF_TRUSTED_ORIGINS.append(_FRONTEND_URL)

# ─── SENTRY (optional — disabled if no DSN) ───
_sentry_dsn = os.environ.get('SENTRY_DSN')
if _sentry_dsn:
    sentry_sdk.init(
        dsn=_sentry_dsn,
        traces_sample_rate=0.1,
        profiles_sample_rate=0.1,
        environment='production',
    )

# ─── LOGGING: Console only (Render captures stdout) ───
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
