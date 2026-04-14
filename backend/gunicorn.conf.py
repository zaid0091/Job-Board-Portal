"""Gunicorn production config.

Usage:
    gunicorn config.wsgi:application -c gunicorn.conf.py
"""
import multiprocessing
import os

# Bind
bind = os.environ.get("GUNICORN_BIND", "0.0.0.0:8000")

# Workers — 2–4× CPU cores is a common recommendation
workers = int(os.environ.get("GUNICORN_WORKERS", multiprocessing.cpu_count() * 2 + 1))
worker_class = "gthread"
threads = int(os.environ.get("GUNICORN_THREADS", 4))

# Connections
worker_connections = 1000
max_requests = 1200
max_requests_jitter = 50

# Timeouts
timeout = 120
graceful_timeout = 30
keepalive = 5

# Logging
accesslog = "-"
errorlog = "-"
loglevel = os.environ.get("GUNICORN_LOG_LEVEL", "info")
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Process naming
proc_name = "jobboard"

# Security — limit request sizes
limit_request_line = 8190
limit_request_fields = 100
limit_request_field_size = 8190

# Preload app for memory savings with copy-on-write
preload_app = True

# Server mechanics
tmp_upload_dir = None
