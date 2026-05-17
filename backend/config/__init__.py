# Do not import celery here — config/celery.py sets DJANGO_SETTINGS_MODULE and
# would run before config.asgi configures development settings for local Daphne.
# Workers: celery -A config.celery worker
