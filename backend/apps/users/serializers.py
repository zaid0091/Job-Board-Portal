from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer that includes user role and profile info."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["email"] = user.email
        token["username"] = user.username
        token["role"] = user.role
        token["is_verified"] = user.is_verified
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Nest tokens under 'tokens' key to match frontend AuthResponse type
        tokens = {
            "access": data.pop("access"),
            "refresh": data.pop("refresh"),
        }
        data["tokens"] = tokens
        data["user"] = {
            "id": str(self.user.id),
            "email": self.user.email,
            "username": self.user.username,
            "role": self.user.role,
            "is_verified": self.user.is_verified,
            "full_name": self.user.get_full_name(),
        }
        return data


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""

    password = serializers.CharField(
        write_only=True,
        min_length=10,
        validators=[validate_password],
        style={"input_type": "password"},
        help_text="Must be at least 10 characters.",
    )
    password_confirm = serializers.CharField(
        write_only=True, style={"input_type": "password"}
    )
    role = serializers.ChoiceField(
        choices=[
            (User.Role.EMPLOYER, "Employer"),
            (User.Role.SEEKER, "Job Seeker"),
        ]
    )
    username = serializers.CharField(min_length=3, max_length=150)

    class Meta:
        model = User
        fields = ["id", "email", "username", "password", "password_confirm", "role"]
        read_only_fields = ["id"]

    def validate_email(self, value):
        email = value.lower().strip()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return email

    def validate_username(self, value):
        username = value.strip()
        if len(username) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters.")
        return username

    def validate(self, data):
        if data["password"] != data["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        return data

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        return user


class UserSerializer(serializers.ModelSerializer):
    """Read-only serializer for basic user information."""

    full_name = serializers.CharField(source="get_full_name", read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "role",
            "is_verified",
            "full_name",
            "date_joined",
        ]
        read_only_fields = fields


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change."""

    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)

    PASSWORD_HISTORY_LIMIT = 5

    def validate(self, data):
        if data["new_password"] != data["new_password_confirm"]:
            raise serializers.ValidationError(
                {"new_password_confirm": "Passwords do not match."}
            )
        return data

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def validate_new_password(self, value):
        user = self.context["request"].user
        password_history = user.password_history.all()[: self.PASSWORD_HISTORY_LIMIT]
        for history in password_history:
            if (
                user.check_password(value)
                and user.make_password(value) == history.password
            ):
                raise serializers.ValidationError(
                    "Cannot reuse a recent password. Please choose a different password."
                )
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for requesting a password reset."""

    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        email = value.lower().strip()
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return email
        return email


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for confirming a password reset with token."""

    token = serializers.CharField(required=True)
    password = serializers.CharField(
        required=True,
        validators=[validate_password],
        write_only=True,
        style={"input_type": "password"},
    )
    password_confirm = serializers.CharField(
        required=True, write_only=True, style={"input_type": "password"}
    )

    def validate(self, data):
        if data["password"] != data["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        return data

    def validate_token(self, value):
        from .models import PasswordResetToken

        reset_token, user = PasswordResetToken.get_user_from_token(value)
        if not user:
            raise serializers.ValidationError("Invalid or expired reset token.")
        return value

    def validate_password(self, value):
        return value

    def validate(self, data):
        from .models import PasswordResetToken
        from django.contrib.auth.password_validation import (
            validate_password as django_validate,
        )

        try:
            django_validate(data["password"])
        except Exception as e:
            raise serializers.ValidationError({"password": str(e)})
        return data
