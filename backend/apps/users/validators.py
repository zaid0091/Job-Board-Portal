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


def validate_resume_file(file):
    """Validate resume file type and size."""
    validate_file_size(file, settings.MAX_RESUME_SIZE)

    file_mime = magic.from_buffer(file.read(2048), mime=True)
    file.seek(0)

    if file_mime not in settings.ALLOWED_RESUME_TYPES:
        raise ValidationError(
            _('Unsupported file type: %(type)s. Allowed types: PDF, DOC, DOCX'),
            params={'type': file_mime}
        )


def validate_image_file(file):
    """Validate image file type and size."""
    validate_file_size(file, settings.MAX_IMAGE_SIZE)

    file_mime = magic.from_buffer(file.read(2048), mime=True)
    file.seek(0)

    if file_mime not in settings.ALLOWED_IMAGE_TYPES:
        raise ValidationError(
            _('Unsupported image type: %(type)s. Allowed types: JPEG, PNG, WebP'),
            params={'type': file_mime}
        )
