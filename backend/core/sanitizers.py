"""
Centralised HTML / text sanitization utilities.

Uses bleach to strip dangerous tags and attributes, preventing stored-XSS
(OWASP A03:2021 – Injection).  All rich-text user input MUST pass through
``sanitize_html`` before being persisted.
"""

import bleach

# Tags allowed in rich-text fields (job descriptions, requirements, etc.)
ALLOWED_TAGS = [
    'p', 'br', 'strong', 'em', 'u', 'b', 'i',
    'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'a', 'blockquote', 'code', 'pre', 'hr',
    'span', 'sub', 'sup',
]

ALLOWED_ATTRIBUTES = {
    'a': ['href', 'title', 'rel'],
    'span': ['class'],
}

# Only allow safe URL schemes in links
ALLOWED_PROTOCOLS = ['http', 'https', 'mailto']


def sanitize_html(value: str) -> str:
    """Sanitize an HTML string, keeping only safe tags/attributes."""
    if not value:
        return value
    return bleach.clean(
        value,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        protocols=ALLOWED_PROTOCOLS,
        strip=True,
    )


def strip_all_html(value: str) -> str:
    """Strip ALL HTML tags — for plain-text fields like bios, cover letters."""
    if not value:
        return value
    return bleach.clean(value, tags=[], strip=True).strip()
