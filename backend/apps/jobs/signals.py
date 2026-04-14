from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from .models import Job


@receiver(post_save, sender=Job)
def update_category_job_count_on_save(sender, instance, **kwargs):
    """Update category job count when a job is saved."""
    if instance.category:
        active_count = Job.objects.filter(
            category=instance.category,
            status=Job.Status.ACTIVE
        ).count()
        instance.category.job_count = active_count
        instance.category.save(update_fields=['job_count'])


@receiver(post_delete, sender=Job)
def update_category_job_count_on_delete(sender, instance, **kwargs):
    """Update category job count when a job is deleted."""
    if instance.category_id:
        try:
            from .models import JobCategory
            category = JobCategory.objects.get(id=instance.category_id)
            active_count = Job.objects.filter(
                category=category,
                status=Job.Status.ACTIVE
            ).count()
            category.job_count = active_count
            category.save(update_fields=['job_count'])
        except Exception:
            pass
