from dataclasses import dataclass, field
from typing import Any


@dataclass
class ParsedSkill:
    name: str
    confidence: float = 0.0
    source: str = 'deterministic'


@dataclass
class ParsedExperience:
    company_name: str
    job_title: str
    description: str = ''
    location: str = ''
    start_date: str = ''
    end_date: str = ''
    is_current: bool = False
    confidence: float = 0.0


@dataclass
class ParsedEducation:
    institution: str
    degree: str
    field_of_study: str = ''
    start_date: str = ''
    end_date: str = ''
    grade: str = ''
    confidence: float = 0.0


@dataclass
class ParsedResumeDocument:
    summary: str = ''
    location: str = ''
    headline: str = ''
    experience_years: int = 0
    skills: list[ParsedSkill] = field(default_factory=list)
    experiences: list[ParsedExperience] = field(default_factory=list)
    educations: list[ParsedEducation] = field(default_factory=list)
    confidence: dict[str, float] = field(default_factory=dict)
    warnings: list[str] = field(default_factory=list)
    raw_text: str = ''

    def to_dict(self) -> dict[str, Any]:
        return {
            'summary': self.summary,
            'location': self.location,
            'headline': self.headline,
            'experience_years': self.experience_years,
            'skills': [s.__dict__ for s in self.skills],
            'experiences': [e.__dict__ for e in self.experiences],
            'educations': [e.__dict__ for e in self.educations],
            'confidence': self.confidence,
            'warnings': self.warnings,
            'raw_text': self.raw_text,
        }
