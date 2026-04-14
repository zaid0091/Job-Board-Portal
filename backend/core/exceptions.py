import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import Throttled
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError as DRFValidationError

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that provides consistent error responses.
    Includes OWASP-friendly 429 handling with Retry-After header.
    """
    # Convert Django ValidationError to DRF ValidationError
    if isinstance(exc, DjangoValidationError):
        if hasattr(exc, 'message_dict'):
            exc = DRFValidationError(detail=exc.message_dict)
        else:
            exc = DRFValidationError(detail=exc.messages)

    response = exception_handler(exc, context)

    if response is not None:
        # Add status code to response body
        response.data['status_code'] = response.status_code

        # Graceful 429 — include human-readable message & Retry-After hint
        if isinstance(exc, Throttled):
            retry_after = int(exc.wait) if exc.wait else 60
            response['Retry-After'] = str(retry_after)
            response.data = {
                'status_code': 429,
                'detail': 'Request was throttled. Please try again later.',
                'retry_after_seconds': retry_after,
            }

        # Log server errors
        if response.status_code >= 500:
            logger.error(
                'Server Error: %s',
                exc,
                exc_info=True,
                extra={'context': str(context)}
            )

    return response
