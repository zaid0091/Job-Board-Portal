from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Automatically create the appropriate profile when a user is created.
    """
    if created:
        from apps.profiles.models import EmployerProfile, SeekerProfile

        if instance.role == 'EMPLOYER':
            EmployerProfile.objects.create(user=instance)
        elif instance.role == 'SEEKER':
            SeekerProfile.objects.create(user=instance)
