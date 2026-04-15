from typing import Any


def compute_confidence(payload: dict[str, Any]) -> dict[str, float]:
    skills = payload.get('skills') or []
    experiences = payload.get('experiences') or []
    educations = payload.get('educations') or []
    summary = payload.get('summary') or ''
    location = payload.get('location') or ''

    skills_conf = min(1.0, 0.35 + (len(skills) * 0.05)) if skills else 0.2
    experiences_conf = min(1.0, 0.3 + (len(experiences) * 0.12)) if experiences else 0.2
    educations_conf = min(1.0, 0.3 + (len(educations) * 0.15)) if educations else 0.2
    summary_conf = 0.85 if summary else 0.2
    location_conf = 0.8 if location else 0.2
    overall = round((skills_conf + experiences_conf + educations_conf + summary_conf + location_conf) / 5, 3)

    return {
        'overall': overall,
        'summary': round(summary_conf, 3),
        'location': round(location_conf, 3),
        'skills': round(skills_conf, 3),
        'experiences': round(experiences_conf, 3),
        'educations': round(educations_conf, 3),
    }
