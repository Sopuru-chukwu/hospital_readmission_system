import multiprocessing
import os

# Gunicorn Production WSGI Server Configuration

port = os.getenv("PORT", "8000")
bind = os.getenv("GUNICORN_BIND", f"0.0.0.0:{port}")
workers = int(os.getenv("GUNICORN_WORKERS", os.getenv("WEB_CONCURRENCY", "2")))
worker_class = "uvicorn.workers.UvicornWorker"

# Timeout & Keepalive
timeout = int(os.getenv("GUNICORN_TIMEOUT", "120"))
keepalive = int(os.getenv("GUNICORN_KEEPALIVE", "5"))

# Logging
loglevel = os.getenv("GUNICORN_LOGLEVEL", "info")
accesslog = "-"
errorlog = "-"

# Security & Process Limits
max_requests = 1000
max_requests_jitter = 50
preload_app = True
