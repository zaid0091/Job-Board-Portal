import logging
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from core.throttles import (
    LoginRateThrottle,
    RegistrationRateThrottle,
    PasswordChangeThrottle,
    PasswordResetThrottle,
)
from .serializers import (
    GoogleLoginSerializer,
    CustomTokenObtainPairSerializer,
    RegisterSerializer,
    UserSerializer,
    ChangePasswordSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)

User = get_user_model()
logger = logging.getLogger(__name__)


def set_auth_cookies(response, access_token, refresh_token):
    secure_cookie = not settings.DEBUG
    response.set_cookie(
        getattr(settings, "JWT_AUTH_COOKIE", "access"),
        access_token,
        httponly=True,
        secure=secure_cookie,
        samesite="Lax",
        path='/',
    )
    if refresh_token:
        response.set_cookie(
            getattr(settings, "JWT_AUTH_REFRESH_COOKIE", "refresh"),
            refresh_token,
            httponly=True,
            secure=secure_cookie,
            samesite="Lax",
            path='/',
        )
    return response


class CustomTokenObtainPairView(TokenObtainPairView):
    """POST /api/v1/auth/login/ — Login with JWT tokens + user info."""

    serializer_class = CustomTokenObtainPairSerializer
    # Strict IP-based throttle: 5 attempts per minute
    throttle_classes = [LoginRateThrottle]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            tokens = response.data.pop("tokens", {})
            access_token = tokens.get("access")
            refresh_token = tokens.get("refresh")
            if access_token:
                set_auth_cookies(response, access_token, refresh_token)
        return response


class CookieTokenRefreshView(TokenRefreshView):
    """POST /api/v1/auth/token/refresh/ — Refresh JWT tokens from cookies."""

    def post(self, request, *args, **kwargs):
        refresh_cookie = getattr(settings, "JWT_AUTH_REFRESH_COOKIE", "refresh")
        refresh_token = request.COOKIES.get(refresh_cookie)

        if refresh_token is not None:
            if hasattr(request.data, "_mutable"):
                request.data._mutable = True
            request.data["refresh"] = refresh_token
            if hasattr(request.data, "_mutable"):
                request.data._mutable = False

        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            access_token = response.data.pop("access", None)
            refresh_token = response.data.pop("refresh", None)
            if access_token:
                set_auth_cookies(response, access_token, refresh_token)
        return response


class RegisterView(generics.CreateAPIView):
    """POST /api/v1/auth/register/ — Register a new user."""

    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    # Strict IP-based throttle: 3 registrations per minute
    throttle_classes = [RegistrationRateThrottle]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)

        from django.conf import settings
        from .tasks import send_welcome_email_task
        try:
            if settings.DEBUG:
                send_welcome_email_task.apply(args=[user.email, user.username])
            else:
                send_welcome_email_task.delay(user.email, user.username)
        except Exception as e:
            logger.error(f"Failed to queue/send welcome email for {user.email}: {e}")

        response = Response(
            {
                "message": "Registration successful.",
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )

        return set_auth_cookies(response, str(refresh.access_token), str(refresh))


class LogoutView(APIView):
    """POST /api/v1/auth/logout/ — Blacklist refresh token and clear cookies."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_cookie = getattr(settings, "JWT_AUTH_REFRESH_COOKIE", "refresh")
        access_cookie = getattr(settings, "JWT_AUTH_COOKIE", "access")
        secure_cookie = not settings.DEBUG

        # Blacklist refresh token if present
        refresh_token = request.COOKIES.get(refresh_cookie) or request.data.get("refresh")
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
                logger.info(f"User logged out: {request.user.email if request.user else 'Unknown'}")
            except Exception:
                pass  # Token might already be blacklisted or invalid

        # Clear cookies by setting them with empty value and max_age=0
        response = Response({"message": "Logout successful."}, status=status.HTTP_200_OK)
        response.set_cookie(access_cookie, '', max_age=0, path='/', samesite="Lax", secure=secure_cookie, httponly=True)
        response.set_cookie(refresh_cookie, '', max_age=0, path='/', samesite="Lax", secure=secure_cookie, httponly=True)

        return response


class CurrentUserView(generics.RetrieveAPIView):
    """GET /api/v1/auth/me/ — Current authenticated user info."""

    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.UpdateAPIView):
    """PUT /api/v1/auth/change-password/ — Change password."""

    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [PasswordChangeThrottle]

    PASSWORD_HISTORY_LIMIT = 5

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = self.get_object()
        old_password_hash = user.password
        new_password = serializer.validated_data["new_password"]

        user.set_password(new_password)
        user.save()

        from .models import PasswordHistory

        PasswordHistory.objects.create(user=user, password=old_password_hash)

        if user.password_history.count() > self.PASSWORD_HISTORY_LIMIT:
            recent_ids = user.password_history.order_by("-created_at")[: self.PASSWORD_HISTORY_LIMIT].values_list("id", flat=True)
            user.password_history.exclude(id__in=recent_ids).delete()

        logger.info("Password changed for user")

        return Response(
            {"message": "Password updated successfully."}, status=status.HTTP_200_OK
        )


class PasswordResetRequestView(APIView):
    """
    POST /api/v1/auth/password/reset/request/
    Request a password reset email.
    """

    permission_classes = [permissions.AllowAny]
    throttle_classes = [PasswordResetThrottle]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"].lower().strip()

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {
                    "message": "If an account with that email exists, we have sent a password reset link."
                },
                status=status.HTTP_200_OK,
            )

        from .models import PasswordResetToken

        PasswordResetToken.objects.filter(user=user, used=False).update(used=True)

        token = PasswordResetToken.create_token_for_user(user)

        reset_url = f"{settings.FRONTEND_URL}/password/reset/confirm?token={token}"

        logger.info(f"Password reset requested for: {email}")

        self._send_reset_email(user.email, reset_url)

        return Response(
            {
                "message": "If an account with that email exists, we have sent a password reset link."
            },
            status=status.HTTP_200_OK,
        )

    def _send_reset_email(self, email, reset_url):
        try:
            from core.email_services import send_password_reset_email

            send_password_reset_email(email, reset_url)
        except Exception as e:
            logger.error(f"Failed to send password reset email: {e}")


class PasswordResetConfirmView(APIView):
    """
    POST /api/v1/auth/password/reset/confirm/
    Confirm password reset with token.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data["token"]
        password = serializer.validated_data["password"]

        from .models import PasswordResetToken

        reset_token, user = PasswordResetToken.get_user_from_token(token)

        if not user:
            return Response(
                {"detail": "Invalid or expired reset token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        old_password_hash = user.password
        user.set_password(password)
        user.save()

        from .models import PasswordHistory

        PasswordHistory.objects.create(user=user, password=old_password_hash)

        reset_token.used = True
        reset_token.save()

        try:
            user.outstandingtoken_set.all().delete()
        except Exception:
            pass

        logger.info(f"Password reset completed for: {user.email}")

        return Response(
            {
                "message": "Password has been reset successfully. You can now login with your new password."
            },
            status=status.HTTP_200_OK,
        )


class GoogleLoginView(APIView):
    """
    POST /api/v1/auth/google/
    Verifies a Google OAuth id_token and issues JWT session cookies.
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    throttle_classes = [LoginRateThrottle]

    def post(self, request, *args, **kwargs):
        serializer = GoogleLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data["token"]

        try:
            idinfo = id_token.verify_oauth2_token(
                token, 
                google_requests.Request(), 
                settings.GOOGLE_CLIENT_ID
            )
            
            email = idinfo['email']
            username = idinfo.get('name', email.split("@")[0])
            
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': username,
                    'is_verified': True,
                }
            )
            
            if created:
                logger.info(f"Triggering welcome email for new Google user: {user.email}")
                from .tasks import send_welcome_email_task
                try:
                    send_welcome_email_task.delay(user.email, user.username)
                except Exception as e:
                    logger.error(f"Failed to queue welcome email for Google user {user.email}: {e}")
            else:
                logger.info(f"Google user {user.email} already exists, skipping welcome email")
                
            refresh = RefreshToken.for_user(user)
            
            logger.info(f"Google OAuth login for {user.email}")
            
            response = Response({
                "message": "Login successful",
                "user": UserSerializer(user).data
            }, status=status.HTTP_200_OK)
            
            return set_auth_cookies(response, str(refresh.access_token), str(refresh))
            
        except ValueError as e:
            logger.error(f"Google Token Verification Failed: {e}")
            return Response({"error": "Invalid Google token."}, status=status.HTTP_400_BAD_REQUEST)
