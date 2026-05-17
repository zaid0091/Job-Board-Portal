"""
JWT authentication middleware for Django Channels WebSockets.

Reads the access token from the HttpOnly cookie (same as CookieJWTAuthentication)
or from a query string ?token= for future clients.
"""

from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication

User = get_user_model()
_jwt_auth = JWTAuthentication()


@database_sync_to_async
def _get_user_from_token(raw_token: str):
    if not raw_token:
        return AnonymousUser()
    try:
        if isinstance(raw_token, str):
            raw_token = raw_token.encode('utf-8')
        validated = _jwt_auth.get_validated_token(raw_token)
        return _jwt_auth.get_user(validated)
    except Exception:
        return AnonymousUser()


def _extract_token(scope):
    headers = dict(scope.get('headers') or [])
    cookie_header = headers.get(b'cookie', b'').decode('utf-8')
    cookie_name = getattr(settings, 'JWT_AUTH_COOKIE', 'access')

    for part in cookie_header.split(';'):
        part = part.strip()
        if part.startswith(f'{cookie_name}='):
            return part.split('=', 1)[1]

    query_string = scope.get('query_string', b'').decode('utf-8')
    if query_string:
        params = parse_qs(query_string)
        token_list = params.get('token') or params.get('access')
        if token_list:
            return token_list[0]

    return None


class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        scope = dict(scope)
        token = _extract_token(scope)
        scope['user'] = await _get_user_from_token(token) if token else AnonymousUser()
        return await super().__call__(scope, receive, send)


def JWTAuthMiddlewareStack(inner):
    return JWTAuthMiddleware(inner)
