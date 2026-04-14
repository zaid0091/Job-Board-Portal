from storages.backends.s3boto3 import S3Boto3Storage


class MediaS3Storage(S3Boto3Storage):
    """Custom S3 storage for media files with signed URLs."""
    location = 'media'
    default_acl = 'private'
    file_overwrite = False
    querystring_auth = True
    querystring_expire = 3600


class PublicMediaS3Storage(S3Boto3Storage):
    """S3 storage for public media (company logos, avatars)."""
    location = 'media/public'
    default_acl = 'public-read'
    file_overwrite = False
    querystring_auth = False
