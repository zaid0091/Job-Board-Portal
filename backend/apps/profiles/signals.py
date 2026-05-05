from django.core.cache import cache
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from .models import Skill, EmployerProfile


@receiver(post_save, sender=Skill)
@receiver(post_delete, sender=Skill)
def invalidate_skills_cache(sender, **kwargs):
    """Invalidate skills list cache when a skill is created, updated, or deleted."""
    cache.delete('skills')


@receiver(post_save, sender=EmployerProfile)
@receiver(post_delete, sender=EmployerProfile)
def invalidate_employer_caches(sender, instance, **kwargs):
    """Invalidate platform stats and employer dashboard cache on profile changes."""
    cache.delete('platform_stats')
    try:
        cache.delete(f'employer_dashboard_{instance.user_id}')
    except Exception:
        pass
