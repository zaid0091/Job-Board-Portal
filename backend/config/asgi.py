import os

# Configure Django settings before any Django/Channels imports.
# Production Docker sets DJANGO_SETTINGS_MODULE=config.settings.production explicitly.
_settings_module = os.environ.get('DJANGO_SETTINGS_MODULE', '')
_use_production = (
    os.environ.get('ENVIRONMENT') == 'production'
    and _settings_module.endswith('.production')
)

if _use_production:
    os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings.production'
    os.environ['ENVIRONMENT'] = 'production'
else:
    # Local Daphne / dev: always use development (even if .env has ENVIRONMENT=production)
    os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings.development'
    os.environ['ENVIRONMENT'] = 'development'

from django.core.asgi import get_asgi_application

django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from core.jwt_auth_middleware import JWTAuthMiddlewareStack
from apps.notifications.routing import websocket_urlpatterns as notification_ws_patterns
from apps.chat.routing import websocket_urlpatterns as chat_ws_patterns

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': AllowedHostsOriginValidator(
        JWTAuthMiddlewareStack(
            URLRouter(notification_ws_patterns + chat_ws_patterns)
        )
    ),
})
