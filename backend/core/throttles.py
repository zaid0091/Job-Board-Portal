from rest_framework.throttling import UserRateThrottle, AnonRateThrottle


# --- Authentication throttles (brute-force protection) ---


class LoginRateThrottle(AnonRateThrottle):
    """IP-based throttle for login attempts.  Limits brute-force attacks."""

    scope = "login"


class RegistrationRateThrottle(AnonRateThrottle):
    """IP-based throttle for registration.  Limits spam account creation."""

    scope = "registration"


class PasswordChangeThrottle(UserRateThrottle):
    """Per-user throttle for password changes."""

    scope = "password_change"


class PasswordResetThrottle(AnonRateThrottle):
    """IP-based throttle for password reset requests.  Limits spam reset requests."""

    scope = "password_reset"


# --- Resource-creation throttles ---


class ApplicationCreateThrottle(UserRateThrottle):
    scope = "application_create"


class CoverLetterPreviewThrottle(UserRateThrottle):
    """Per-user throttle for cover letter preview generation."""

    scope = "cover_letter_preview"


class JobCreateThrottle(UserRateThrottle):
    scope = "job_create"


# --- General-purpose endpoint throttles ---


class BurstAnonThrottle(AnonRateThrottle):
    """Short-window anonymous burst limiter for public read endpoints."""

    scope = "burst_anon"


class BurstUserThrottle(UserRateThrottle):
    """Short-window authenticated burst limiter."""

    scope = "burst_user"


class AnalyticsThrottle(UserRateThrottle):
    """Per-user throttle for analytics endpoints to prevent data scraping."""

    scope = "analytics"


class ChatMessageThrottle(UserRateThrottle):
    """Limit chat message sends via REST (WebSocket has separate validation)."""

    scope = "chat_message"
