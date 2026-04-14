#!/usr/bin/env python
"""Test script to verify Resend email configuration."""

import os
import sys

# Load .env file manually
env_path = os.path.join(os.path.dirname(__file__), "backend", ".env")
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                os.environ.setdefault(key.strip(), value.strip())

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")

import django

django.setup()

from core.email_services import send_password_reset_email

# Test email
test_email = "onboarding@resend.dev"
test_url = "http://localhost:5173/password/reset/confirm?token=test-token-123"

print(f"Sending test email to: {test_email}")
print(f"Reset URL: {test_url}")
print("-" * 50)

result = send_password_reset_email(test_email, test_url)

if result:
    print("Email sent successfully!")
else:
    print("Failed to send email. Check logs for details.")
