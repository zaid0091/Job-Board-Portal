from rest_framework.throttling import UserRateThrottle, AnonRateThrottle


# --- Authentication throttles (brute-force protection) ---

class LoginRateThrottle(AnonRateThrottle):
    """IP-based throttle for login attempts.  Limits brute-force attacks."""
    scope = 'login'


class RegistrationRateThrottle(AnonRateThrottle):
    """IP-based throttle for registration.  Limits spam account creation."""
    scope = 'registration'


class PasswordChangeThrottle(UserRateThrottle):
    """Per-user throttle for password changes."""
    scope = 'password_change'


# --- Resource-creation throttles ---

class ApplicationCreateThrottle(UserRateThrottle):
    scope = 'application_create'


class JobCreateThrottle(UserRateThrottle):
    scope = 'job_create'


# --- General-purpose endpoint throttles ---

class BurstAnonThrottle(AnonRateThrottle):
    """Short-window anonymous burst limiter for public read endpoints."""
    scope = 'burst_anon'


class BurstUserThrottle(UserRateThrottle):
    """Short-window authenticated burst limiter."""
    scope = 'burst_user'
