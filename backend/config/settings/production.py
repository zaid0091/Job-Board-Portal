from .base import *  # noqa
import sentry_sdk

DEBUG = False
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')  # noqa

# Security Settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
X_FRAME_OPTIONS = 'DENY'

# S3 Storage
DEFAULT_FILE_STORAGE = 'core.storage.MediaS3Storage'
AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')  # noqa
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')  # noqa
AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME')  # noqa
AWS_S3_REGION_NAME = os.environ.get('AWS_S3_REGION_NAME', 'us-east-1')  # noqa
AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
AWS_DEFAULT_ACL = 'private'
AWS_S3_OBJECT_PARAMETERS = {
    'CacheControl': 'max-age=86400',
}
AWS_QUERYSTRING_AUTH = True
AWS_QUERYSTRING_EXPIRE = 3600

# Sentry Error Tracking
sentry_sdk.init(
    dsn=os.environ.get('SENTRY_DSN'),  # noqa
    traces_sample_rate=0.1,
    profiles_sample_rate=0.1,
    environment='production',
)

# Production logging with file handler
LOGGING['root']['handlers'] = ['console', 'file']  # noqa
LOGGING['loggers']['django']['handlers'] = ['console', 'file']  # noqa
LOGGING['loggers']['apps']['handlers'] = ['console', 'file']  # noqa
