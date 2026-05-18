from datetime import date, timedelta

from django.utils import timezone
from django.utils.dateparse import parse_date

from apps.profiles.models import (
    Education,
    Experience,
    ProfileAutofillDraft,
    ResumeAutofillAudit,
    ResumeParseJob,
    Skill,
)
from apps.profiles.serializers import SeekerProfileSerializer


def _safe_date(value):
    if not value:
        return None
    parsed = parse_date(str(value))
    if isinstance(parsed, date):
        return parsed
    return None


def _upsert_experiences(seeker_profile, experiences):
    for item in experiences:
        if not isinstance(item, dict):
            continue
        company_name = (item.get('company_name') or '').strip()
        job_title = (item.get('job_title') or '').strip()
        start_date = _safe_date(item.get('start_date'))
        if not company_name or not job_title or not start_date:
            continue
        defaults = {
            'description': (item.get('description') or '')[:5000],
            'location': (item.get('location') or '')[:255],
            'end_date': _safe_date(item.get('end_date')),
            'is_current': bool(item.get('is_current')),
        }
        Experience.objects.update_or_create(
            seeker=seeker_profile,
            company_name=company_name[:255],
            job_title=job_title[:255],
            start_date=start_date,
            defaults=defaults,
        )


def _upsert_educations(seeker_profile, educations):
    for item in educations:
        if not isinstance(item, dict):
            continue
        institution = (item.get('institution') or '').strip()
        degree = (item.get('degree') or '').strip()
        start_date = _safe_date(item.get('start_date'))
        if not institution or not degree or not start_date:
            continue
        defaults = {
            'field_of_study': (item.get('field_of_study') or '')[:255],
            'end_date': _safe_date(item.get('end_date')),
            'grade': (item.get('grade') or '')[:50],
        }
        Education.objects.update_or_create(
            seeker=seeker_profile,
            institution=institution[:255],
            degree=degree[:255],
            start_date=start_date,
            defaults=defaults,
        )


def apply_parsed_resume_to_profile(*, user, job, payload, edited_before_apply):
    """
    Apply normalized resume payload to the seeker profile and finalize the parse job.
    Returns dict with message and serialized profile.
    """
    seeker_profile = user.seeker_profile
    before_snapshot = SeekerProfileSerializer(seeker_profile).data

    seeker_profile.bio = payload.get('summary', seeker_profile.bio or '')
    seeker_profile.location = payload.get('location', seeker_profile.location or '')
    if payload.get('headline'):
        seeker_profile.headline = payload['headline']
    if payload.get('experience_years') is not None:
        seeker_profile.experience_years = payload['experience_years']
    seeker_profile.resume = job.source_file
    seeker_profile.save()

    skill_names = [
        (item.get('name') or '').strip()
        for item in payload.get('skills', [])
        if isinstance(item, dict)
    ]
    skills_to_assign = list(Skill.objects.filter(name__in=skill_names))
    if skills_to_assign:
        seeker_profile.skills.set(skills_to_assign)

    _upsert_experiences(seeker_profile, payload.get('experiences', []))
    _upsert_educations(seeker_profile, payload.get('educations', []))

    ProfileAutofillDraft.objects.create(
        user=user,
        job=job,
        payload=payload,
        is_active=False,
        expires_at=timezone.now() + timedelta(days=7),
    )

    job.status = ResumeParseJob.Status.APPLIED
    job.last_applied_at = timezone.now()
    job.save(update_fields=['status', 'last_applied_at', 'updated_at'])

    seeker_profile.refresh_from_db()
    after_snapshot = SeekerProfileSerializer(seeker_profile).data
    ResumeAutofillAudit.objects.create(
        user=user,
        job=job,
        action=ResumeAutofillAudit.Action.APPLIED,
        before_snapshot=before_snapshot,
        after_snapshot=after_snapshot,
        metadata={'edited_before_apply': edited_before_apply},
    )

    return {
        'message': 'Autofill applied successfully.',
        'profile': SeekerProfileSerializer(seeker_profile).data,
    }
