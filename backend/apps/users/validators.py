import magic
import os
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

    ext = os.path.splitext(file.name)[1].lower()
    if ext not in ['.pdf', '.doc', '.docx']:
        raise ValidationError(
            _('Unsupported file extension: %(ext)s. Allowed extensions: PDF, DOC, DOCX'),
            params={'ext': ext}
        )

    file_mime = None
    try:
        file_mime = magic.from_buffer(file.read(2048), mime=True)
    except Exception:
        # Fallback for environments where libmagic is unavailable/misconfigured.
        file_mime = getattr(file, 'content_type', None)
    finally:
        file.seek(0)

    if file_mime not in settings.ALLOWED_RESUME_TYPES:
        raise ValidationError(
            _('Unsupported file type: %(type)s. Allowed types: PDF, DOC, DOCX'),
            params={'type': file_mime}
        )


def validate_image_file(file):
    """Validate image file type and size."""
    validate_file_size(file, settings.MAX_IMAGE_SIZE)

    ext = os.path.splitext(file.name)[1].lower()
    if ext not in ['.jpeg', '.jpg', '.png', '.webp']:
        raise ValidationError(
            _('Unsupported image extension: %(ext)s. Allowed extensions: JPEG, JPG, PNG, WebP'),
            params={'ext': ext}
        )

    file_mime = None
    try:
        file_mime = magic.from_buffer(file.read(2048), mime=True)
    except Exception:
        file_mime = getattr(file, 'content_type', None)
    finally:
        file.seek(0)

    if file_mime not in settings.ALLOWED_IMAGE_TYPES:
        raise ValidationError(
            _('Unsupported image type: %(type)s. Allowed types: JPEG, PNG, WebP'),
            params={'type': file_mime}
        )
