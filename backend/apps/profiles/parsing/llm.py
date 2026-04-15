import json
import logging
from typing import Any


logger = logging.getLogger(__name__)


class LLMNormalizer:
    """
    Placeholder adapter for hybrid parsing.
    Returns deterministic payload unchanged when no LLM provider is configured.
    """

    model_name = 'disabled'

    def normalize(self, payload: dict[str, Any], raw_text: str) -> dict[str, Any]:
        _ = raw_text
        # Future-safe hook: keep output JSON-serializable and schema-aligned.
        try:
            json.dumps(payload)
        except TypeError:
            logger.warning('LLM normalization skipped due to unserializable payload.')
            return {}
        return payload
