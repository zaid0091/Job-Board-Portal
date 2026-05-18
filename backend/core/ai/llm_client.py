"""
OpenAI-compatible chat completions client for optional AI features.
"""

from __future__ import annotations

import json
import logging
from typing import Any

import requests
from django.conf import settings


logger = logging.getLogger(__name__)


class LLMError(Exception):
    """Raised when the LLM provider returns an error or is misconfigured."""


class LLMClient:
    """Thin wrapper around OpenAI-compatible chat completion APIs."""

    def __init__(
        self,
        *,
        api_key: str | None = None,
        model: str | None = None,
        base_url: str | None = None,
        timeout: int | None = None,
    ):
        self.api_key = api_key or getattr(settings, 'COVER_LETTER_LLM_API_KEY', '') or getattr(
            settings, 'OPENAI_API_KEY', ''
        )
        self.model = model or getattr(settings, 'COVER_LETTER_LLM_MODEL', '') or 'gpt-4o-mini'
        self.base_url = (
            base_url
            or getattr(settings, 'COVER_LETTER_LLM_BASE_URL', '')
            or 'https://api.openai.com/v1'
        ).rstrip('/')
        self.timeout = timeout or getattr(settings, 'COVER_LETTER_LLM_TIMEOUT', 45)

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and self.model)

    def chat_completion(
        self,
        *,
        system: str,
        user: str,
        max_tokens: int | None = None,
        temperature: float = 0.4,
    ) -> dict[str, Any]:
        if not self.is_configured:
            raise LLMError('LLM API key or model is not configured.')

        max_tokens = max_tokens or getattr(settings, 'COVER_LETTER_MAX_OUTPUT_TOKENS', 800)
        url = f'{self.base_url}/chat/completions'
        payload = {
            'model': self.model,
            'messages': [
                {'role': 'system', 'content': system},
                {'role': 'user', 'content': user},
            ],
            'max_tokens': max_tokens,
            'temperature': temperature,
        }
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json',
        }
        try:
            response = requests.post(
                url,
                headers=headers,
                json=payload,
                timeout=self.timeout,
            )
            response.raise_for_status()
        except requests.RequestException as exc:
            logger.warning('LLM request failed: %s', exc)
            raise LLMError(str(exc)) from exc

        data = response.json()
        try:
            content = data['choices'][0]['message']['content']
        except (KeyError, IndexError, TypeError) as exc:
            raise LLMError('Unexpected LLM response shape.') from exc

        usage = data.get('usage') or {}
        return {
            'content': (content or '').strip(),
            'model': data.get('model', self.model),
            'token_usage': {
                'prompt_tokens': usage.get('prompt_tokens'),
                'completion_tokens': usage.get('completion_tokens'),
                'total_tokens': usage.get('total_tokens'),
            },
        }

    def generate_json(
        self,
        *,
        system: str,
        user_payload: dict[str, Any],
        max_tokens: int | None = None,
    ) -> dict[str, Any]:
        user = json.dumps(user_payload, ensure_ascii=False)
        result = self.chat_completion(system=system, user=user, max_tokens=max_tokens)
        raw = result['content']
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            start = raw.find('{')
            end = raw.rfind('}')
            if start >= 0 and end > start:
                parsed = json.loads(raw[start : end + 1])
            else:
                raise LLMError('LLM did not return valid JSON.') from None
        if not isinstance(parsed, dict):
            raise LLMError('LLM JSON response must be an object.')
        result['parsed'] = parsed
        return result
