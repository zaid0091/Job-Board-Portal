"""
Cover letter draft generation, caching, and audit helpers.
"""

from __future__ import annotations

import hashlib
import json
import logging
from datetime import timedelta
from difflib import SequenceMatcher
from typing import Any

from django.conf import settings
from django.core.cache import cache
from django.utils import timezone

from core.ai.llm_client import LLMClient, LLMError
from core.sanitizers import strip_all_html

from apps.applications.models import CoverLetterAudit, CoverLetterDraft
from apps.jobs.models import Job
from apps.profiles.models import ParsedResumeResult, ResumeParseJob


logger = logging.getLogger(__name__)

DISCLAIMER = 'AI-assisted draft. Review and edit before submitting.'

_TRUNCATE_FIELD = 4000


def _truncate(text: str, limit: int = _TRUNCATE_FIELD) -> str:
    if not text:
        return ''
    text = text.strip()
    if len(text) <= limit:
        return text
    return text[: limit - 3] + '...'


def build_job_snapshot(job: Job) -> dict[str, Any]:
    employer = job.employer
    skill_names = list(job.skills_required.values_list('name', flat=True)[:50])
    return {
        'title': job.title,
        'company_name': employer.company_name if employer else '',
        'location': job.location or '',
        'job_type': job.job_type,
        'experience_level': job.experience_level,
        'description': _truncate(job.description),
        'requirements': _truncate(job.requirements),
        'responsibilities': _truncate(job.responsibilities),
        'skills_required': skill_names,
    }


def _latest_parsed_resume(user) -> dict[str, Any] | None:
    job = (
        ResumeParseJob.objects.filter(
            user=user,
            status__in=[
                ResumeParseJob.Status.REVIEW_READY,
                ResumeParseJob.Status.APPLIED,
            ],
        )
        .order_by('-completed_at', '-created_at')
        .first()
    )
    if not job:
        return None
    try:
        result = job.result
    except ParsedResumeResult.DoesNotExist:
        return None
    skills = []
    if isinstance(result.skills, list):
        for item in result.skills[:30]:
            if isinstance(item, dict) and item.get('name'):
                skills.append(item['name'])
            elif isinstance(item, str):
                skills.append(item)
    return {
        'summary': _truncate(result.summary, 2000),
        'skills': skills,
    }


def build_seeker_snapshot(user) -> dict[str, Any]:
    seeker = user.seeker_profile
    experiences = list(
        seeker.experiences.order_by('-start_date')[:3].values(
            'job_title', 'company_name', 'description', 'start_date', 'end_date', 'is_current'
        )
    )
    for exp in experiences:
        if exp.get('start_date'):
            exp['start_date'] = exp['start_date'].isoformat()
        if exp.get('end_date'):
            exp['end_date'] = exp['end_date'].isoformat()

    educations = list(
        seeker.educations.order_by('-start_date')[:3].values(
            'institution', 'degree', 'field_of_study', 'start_date', 'end_date'
        )
    )
    for edu in educations:
        if edu.get('start_date'):
            edu['start_date'] = edu['start_date'].isoformat()
        if edu.get('end_date'):
            edu['end_date'] = edu['end_date'].isoformat()

    skill_names = list(seeker.skills.values_list('name', flat=True)[:50])
    snapshot = {
        'full_name': seeker.full_name or user.get_full_name(),
        'headline': seeker.headline or '',
        'bio': _truncate(seeker.bio, 2000),
        'location': seeker.location or '',
        'experience_years': seeker.experience_years,
        'skills': skill_names,
        'experiences': experiences,
        'educations': educations,
        'parsed_resume': _latest_parsed_resume(user),
        '_version': getattr(settings, 'COVER_LETTER_PROFILE_HASH_FIELDS_VERSION', 1),
    }
    return snapshot


def compute_profile_hash(seeker_snapshot: dict[str, Any]) -> str:
    payload = json.dumps(seeker_snapshot, sort_keys=True, default=str)
    return hashlib.sha256(payload.encode('utf-8')).hexdigest()


def cache_key(user_id: str, job_id: str, profile_hash: str) -> str:
    return f'cover_letter:v1:{user_id}:{job_id}:{profile_hash}'


def _serialize_draft_for_cache(draft: CoverLetterDraft) -> dict[str, Any]:
    return {
        'draft_id': str(draft.id),
        'cover_letter': draft.cover_letter,
        'highlights': draft.highlights,
        'generator': draft.generator,
        'profile_hash': draft.profile_hash,
        'llm_model': draft.llm_model,
    }


def _matching_draft(user, job, profile_hash: str) -> CoverLetterDraft | None:
    return (
        CoverLetterDraft.objects.filter(
            user=user,
            job=job,
            profile_hash=profile_hash,
            expires_at__gt=timezone.now(),
        )
        .order_by('-created_at')
        .first()
    )


def _build_highlights(job_snapshot: dict, seeker_snapshot: dict) -> list[str]:
    job_skills = {s.lower() for s in job_snapshot.get('skills_required', [])}
    seeker_skills = {s.lower() for s in seeker_snapshot.get('skills', [])}
    if seeker_snapshot.get('parsed_resume', {}) and seeker_snapshot['parsed_resume'].get('skills'):
        seeker_skills |= {s.lower() for s in seeker_snapshot['parsed_resume']['skills']}
    overlap = sorted(job_skills & seeker_skills)[:5]
    highlights = []
    if overlap:
        highlights.append(f'Strong skill match: {", ".join(s.title() for s in overlap[:4])}.')
    years = seeker_snapshot.get('experience_years')
    if years:
        highlights.append(f'{years}+ years of professional experience.')
    exps = seeker_snapshot.get('experiences') or []
    if exps:
        latest = exps[0]
        highlights.append(
            f'Most recent role: {latest.get("job_title", "")} at {latest.get("company_name", "")}.'.strip()
        )
    if job_snapshot.get('location') and seeker_snapshot.get('location'):
        highlights.append(
            f'Open to opportunities in {seeker_snapshot["location"]} for roles based in {job_snapshot["location"]}.'
        )
    if len(highlights) < 3 and seeker_snapshot.get('headline'):
        highlights.append(seeker_snapshot['headline'])
    return highlights[:5]


def _generate_template(job_snapshot: dict, seeker_snapshot: dict) -> tuple[str, list[str]]:
    name = seeker_snapshot.get('full_name') or 'Applicant'
    title = job_snapshot.get('title', 'this role')
    company = job_snapshot.get('company_name') or 'your organization'
    highlights = _build_highlights(job_snapshot, seeker_snapshot)

    job_skills = {s.lower() for s in job_snapshot.get('skills_required', [])}
    seeker_skills = {s.lower() for s in seeker_snapshot.get('skills', [])}
    overlap = sorted(job_skills & seeker_skills)
    skill_phrase = ', '.join(s.title() for s in overlap[:6]) if overlap else 'the technologies listed in your posting'

    exp = (seeker_snapshot.get('experiences') or [{}])[0]
    exp_line = ''
    if exp.get('job_title') and exp.get('company_name'):
        exp_line = (
            f'In my recent position as {exp["job_title"]} at {exp["company_name"]}, '
            f'I developed strengths that align closely with {title}.'
        )
    elif seeker_snapshot.get('experience_years'):
        exp_line = (
            f'With {seeker_snapshot["experience_years"]} years of experience, '
            f'I am well prepared to contribute to {title} at {company}.'
        )

    bio = seeker_snapshot.get('bio') or ''
    if seeker_snapshot.get('parsed_resume', {}) and seeker_snapshot['parsed_resume'].get('summary'):
        bio = bio or seeker_snapshot['parsed_resume']['summary']
    bio_sentence = _truncate(bio, 400)
    if bio_sentence:
        bio_sentence = bio_sentence.split('.')[0].strip() + '.' if '.' in bio_sentence else bio_sentence

    paragraphs = [
        f'Dear Hiring Team at {company},',
        (
            f'I am writing to express my interest in the {title} position. '
            f'{bio_sentence} ' if bio_sentence else
            f'I am writing to express my interest in the {title} position. '
        ) + (
            f'My background includes hands-on experience with {skill_phrase}, '
            f'which maps directly to the requirements you outlined.'
        ),
    ]
    if exp_line:
        paragraphs.append(exp_line)
    paragraphs.append(
        f'I would welcome the opportunity to discuss how my experience can support '
        f'{company}\'s goals for this role. Thank you for your time and consideration.'
    )
    paragraphs.append(f'Sincerely,\n{name}')

    return '\n\n'.join(paragraphs), highlights


_COVER_LETTER_SYSTEM = """You write tailored job application cover letters.
Rules:
- Use ONLY facts from the provided JSON about the candidate and job.
- Do not invent employers, degrees, skills, or metrics.
- Plain text only, no HTML or markdown.
- Professional tone, about 250-400 words.
- Return JSON: {"cover_letter": "...", "highlights": ["...", "..."]} with 3-5 highlight bullets."""


def _generate_llm(job_snapshot: dict, seeker_snapshot: dict) -> tuple[str, list[str], str, dict]:
    client = LLMClient()
    if not client.is_configured:
        raise LLMError('LLM is not configured.')

    user_payload = {'job': job_snapshot, 'candidate': seeker_snapshot}
    user_json = json.dumps(user_payload, ensure_ascii=False)
    max_input = getattr(settings, 'COVER_LETTER_MAX_INPUT_CHARS', 12000)
    if len(user_json) > max_input:
        user_json = user_json[:max_input]

    result = client.generate_json(
        system=_COVER_LETTER_SYSTEM,
        user_payload=json.loads(user_json),
    )
    parsed = result['parsed']
    cover_letter = strip_all_html(str(parsed.get('cover_letter', '')))
    highlights = parsed.get('highlights') or []
    if not isinstance(highlights, list):
        highlights = []
    highlights = [strip_all_html(str(h)) for h in highlights[:5] if h]
    if not cover_letter:
        raise LLMError('LLM returned empty cover letter.')
    return cover_letter, highlights, result.get('model', client.model), result.get('token_usage', {})


def generate_cover_letter(
    job_snapshot: dict,
    seeker_snapshot: dict,
) -> tuple[str, list[str], str, str, dict]:
    """
    Returns (cover_letter, highlights, generator, llm_model, token_usage).
    """
    use_llm = getattr(settings, 'COVER_LETTER_ENABLE_LLM', False)
    if use_llm:
        try:
            letter, highlights, model, usage = _generate_llm(job_snapshot, seeker_snapshot)
            return letter, highlights, CoverLetterDraft.Generator.LLM, model, usage
        except LLMError as exc:
            if not getattr(settings, 'COVER_LETTER_FALLBACK_ON_LLM_ERROR', True):
                raise
            logger.warning('Cover letter LLM failed, using template: %s', exc)

    letter, highlights = _generate_template(job_snapshot, seeker_snapshot)
    return letter, highlights, CoverLetterDraft.Generator.TEMPLATE, '', {}


def get_or_create_draft(
    *,
    user,
    job: Job,
    regenerate: bool = False,
) -> tuple[CoverLetterDraft, bool]:
    """
    Return (draft, cached). cached=True when served from cache/DB without regeneration.
    """
    seeker_snapshot = build_seeker_snapshot(user)
    profile_hash = compute_profile_hash(seeker_snapshot)
    key = cache_key(str(user.id), str(job.id), profile_hash)

    if not regenerate:
        cached_payload = cache.get(key)
        if cached_payload:
            try:
                draft = CoverLetterDraft.objects.get(
                    id=cached_payload['draft_id'],
                    user=user,
                    job=job,
                )
                if not draft.is_expired:
                    return draft, True
            except CoverLetterDraft.DoesNotExist:
                cache.delete(key)

        existing = _matching_draft(user, job, profile_hash)
        if existing:
            cache.set(
                key,
                _serialize_draft_for_cache(existing),
                timeout=getattr(settings, 'COVER_LETTER_CACHE_TTL_SECONDS', 86400),
            )
            return existing, True

    job_snapshot = build_job_snapshot(job)
    cover_letter, highlights, generator, llm_model, token_usage = generate_cover_letter(
        job_snapshot, seeker_snapshot
    )
    ttl = getattr(settings, 'COVER_LETTER_CACHE_TTL_SECONDS', 86400)
    expires_at = timezone.now() + timedelta(seconds=ttl)

    draft = CoverLetterDraft.objects.create(
        user=user,
        job=job,
        profile_hash=profile_hash,
        cover_letter=cover_letter,
        highlights=highlights,
        generator=generator,
        llm_model=llm_model,
        token_usage=token_usage,
        expires_at=expires_at,
    )
    cache.set(key, _serialize_draft_for_cache(draft), timeout=ttl)
    return draft, False


def invalidate_draft_cache(draft: CoverLetterDraft) -> None:
    key = cache_key(str(draft.user_id), str(draft.job_id), draft.profile_hash)
    cache.delete(key)


def record_audit(
    *,
    user,
    job: Job,
    action: str,
    draft: CoverLetterDraft | None = None,
    before_snapshot: dict | None = None,
    after_snapshot: dict | None = None,
    metadata: dict | None = None,
) -> CoverLetterAudit:
    return CoverLetterAudit.objects.create(
        user=user,
        job=job,
        draft=draft,
        action=action,
        before_snapshot=before_snapshot or {},
        after_snapshot=after_snapshot or {},
        metadata=metadata or {},
    )


def text_snapshot(text: str, max_len: int = 500) -> dict[str, str]:
    normalized = (text or '').strip()
    digest = hashlib.sha256(normalized.encode('utf-8')).hexdigest()
    return {
        'hash': digest,
        'preview': normalized[:max_len],
        'length': len(normalized),
    }


def edit_distance_ratio(original: str, edited: str) -> float:
    return SequenceMatcher(None, (original or '').strip(), (edited or '').strip()).ratio()


def audit_application_cover_letter(
    *,
    user,
    job: Job,
    draft: CoverLetterDraft,
    submitted_cover_letter: str,
) -> None:
    before = text_snapshot(draft.cover_letter)
    after = text_snapshot(submitted_cover_letter)
    ratio = edit_distance_ratio(draft.cover_letter, submitted_cover_letter)
    if ratio >= 0.999:
        action = CoverLetterAudit.Action.APPLIED
    else:
        action = CoverLetterAudit.Action.EDITED_BEFORE_APPLY
    record_audit(
        user=user,
        job=job,
        action=action,
        draft=draft,
        before_snapshot=before,
        after_snapshot=after,
        metadata={'edit_distance_ratio': round(ratio, 4)},
    )
    invalidate_draft_cache(draft)
