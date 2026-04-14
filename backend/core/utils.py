import os
import uuid
from django.utils.text import slugify


def generate_unique_filename(instance, filename):
    """Generate a unique filename to prevent overwrites and directory traversal."""
    ext = os.path.splitext(filename)[1].lower()
    unique_name = f'{uuid.uuid4().hex}{ext}'
    return unique_name


def get_resume_upload_path(instance, filename):
    """Generate path: resumes/{user_id}/{uuid}.pdf"""
    unique_name = generate_unique_filename(instance, filename)
    user_id = (
        instance.applicant.id if hasattr(instance, 'applicant')
        else instance.user.id
    )
    return f'resumes/{user_id}/{unique_name}'


def get_avatar_upload_path(instance, filename):
    """Generate path: avatars/{user_id}/{uuid}.jpg"""
    unique_name = generate_unique_filename(instance, filename)
    return f'avatars/{instance.user.id}/{unique_name}'
