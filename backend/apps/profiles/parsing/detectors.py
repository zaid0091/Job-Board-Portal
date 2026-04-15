import re

from apps.profiles.models import SkillAlias, Skill
from .contracts import ParsedEducation, ParsedExperience, ParsedSkill


EMAIL_RE = re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}')
LOCATION_RE = re.compile(r'([A-Za-z ]+,\s*[A-Za-z ]+)')
YEARS_RE = re.compile(r'(\d{1,2})\+?\s+years', re.IGNORECASE)
SECTION_RE = re.compile(
    r'(professional summary|summary|profile|about me|objective)\s*[:\-]?\s*(.+?)(?:\n\s*\n|\n[A-Z][A-Za-z ]{2,}:|\Z)',
    re.IGNORECASE | re.DOTALL,
)

COMMON_SKILLS = [
    'python', 'java', 'javascript', 'typescript', 'react', 'node.js', 'nodejs',
    'django', 'flask', 'fastapi', 'sql', 'postgresql', 'mysql', 'mongodb',
    'redis', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git',
    'html', 'css', 'tailwind', 'rest api', 'graphql', 'linux', 'c++', 'c#',
    'machine learning', 'data analysis', 'excel', 'power bi',
]


def detect_summary(text: str) -> str:
    if not text:
        return ''
    section = SECTION_RE.search(text)
    if section:
        candidate = section.group(2).strip()
        if candidate:
            return re.sub(r'\s+', ' ', candidate)[:1200]

    cleaned = EMAIL_RE.sub('', text).strip()
    lines = [line.strip() for line in cleaned.splitlines() if line.strip()]
    meaningful = []
    for line in lines:
        low = line.lower()
        if any(token in low for token in ['education', 'experience', 'skills', 'projects', 'certifications']):
            continue
        if len(line.split()) >= 7:
            meaningful.append(line)
        if len(meaningful) >= 3:
            break
    if meaningful:
        return ' '.join(meaningful)[:1200]
    return ' '.join(lines[:4])[:1200]


def detect_location(text: str) -> str:
    for line in text.splitlines()[:20]:
        match = LOCATION_RE.search(line)
        if match:
            return match.group(1)[:255]
    return ''


def detect_experience_years(text: str) -> int:
    match = YEARS_RE.search(text)
    if not match:
        return 0
    return int(match.group(1))


def detect_skills(text: str) -> list[ParsedSkill]:
    text_lower = text.lower()
    parsed: list[ParsedSkill] = []
    for skill in Skill.objects.all():
        if skill.name.lower() in text_lower:
            parsed.append(ParsedSkill(name=skill.name, confidence=0.92))
    for alias in SkillAlias.objects.select_related('skill').all():
        if alias.alias.lower() in text_lower:
            parsed.append(ParsedSkill(name=alias.skill.name, confidence=0.86))

    # Built-in fallback taxonomy for empty/sparse DB skill dictionaries.
    for skill in COMMON_SKILLS:
        if skill in text_lower:
            normalized = skill.replace('nodejs', 'Node.js').replace('rest api', 'REST API')
            parsed.append(ParsedSkill(name=normalized.title() if normalized.islower() else normalized, confidence=0.74, source='builtin'))

    deduped: dict[str, ParsedSkill] = {}
    for item in parsed:
        existing = deduped.get(item.name)
        if not existing or item.confidence > existing.confidence:
            deduped[item.name] = item
    return sorted(deduped.values(), key=lambda x: x.name)


def detect_experiences(_: str) -> list[ParsedExperience]:
    return []


def detect_educations(_: str) -> list[ParsedEducation]:
    return []
