import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ["ENVIRONMENT"] = "production"
os.environ.pop("DJANGO_SETTINGS_MODULE", None)

import config.asgi  # noqa: F401
from django.conf import settings

print("OK", "DEBUG=", settings.DEBUG, "MODULE=", settings.SETTINGS_MODULE)
