from pathlib import Path
from typing import Any

from .contracts import ParsedResumeDocument
from .detectors import (
    detect_summary,
    detect_location,
    detect_experience_years,
    detect_skills,
    detect_experiences,
    detect_educations,
)
from .extractors import extract_docx_text, extract_pdf_text
from .llm import LLMNormalizer
from .scoring import compute_confidence


class ResumeParsingService:
    parser_version = 'v1'
    pipeline_mode = 'hybrid'

    def __init__(self):
        self.llm = LLMNormalizer()

    def parse_file(self, file_path: str) -> dict[str, Any]:
        raw_text = self._extract_text(file_path)
        document = ParsedResumeDocument(
            summary=detect_summary(raw_text),
            location=detect_location(raw_text),
            experience_years=detect_experience_years(raw_text),
            skills=detect_skills(raw_text),
            experiences=detect_experiences(raw_text),
            educations=detect_educations(raw_text),
            raw_text=raw_text[:50000],
        )

        payload = document.to_dict()
        normalized = self.llm.normalize(payload, raw_text)
        if normalized:
            payload = normalized

        payload['confidence'] = compute_confidence(payload)
        warnings = []
        if not raw_text.strip():
            warnings.append('Could not extract readable text from this file. Try a text-based PDF/DOCX export.')
        if not payload.get('skills'):
            warnings.append('No explicit skills detected. Please review manually.')
        if not payload.get('summary'):
            warnings.append('No clear summary detected.')
        payload['warnings'] = warnings
        return payload

    def _extract_text(self, file_path: str) -> str:
        path = Path(file_path)
        suffix = path.suffix.lower()
        if suffix == '.pdf':
            return extract_pdf_text(file_path)
        if suffix in {'.docx', '.doc'}:
            return extract_docx_text(file_path)
        return ''
