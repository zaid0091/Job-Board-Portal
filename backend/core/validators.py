import magic
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


def validate_file_size(file, max_size):
    """Validate file does not exceed maximum size."""
    if file.size > max_size:
        max_mb = max_size / (1024 * 1024)
        raise ValidationError(
            _('File size %(size)s MB exceeds maximum allowed size of %(max)s MB.'),
            params={
                'size': round(file.size / (1024 * 1024), 2),
                'max': max_mb
            }
        )
