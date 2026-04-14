from django.urls import path


from . import views

app_name = "users"

urlpatterns = [
    path("auth/register/", views.RegisterView.as_view(), name="register"),
    path("auth/login/", views.CustomTokenObtainPairView.as_view(), name="login"),
    path("auth/logout/", views.LogoutView.as_view(), name="logout"),
    path(
        "auth/token/refresh/",
        views.CookieTokenRefreshView.as_view(),
        name="token-refresh",
    ),
    path("auth/me/", views.CurrentUserView.as_view(), name="current-user"),
    path(
        "auth/change-password/",
        views.ChangePasswordView.as_view(),
        name="change-password",
    ),
    path(
        "auth/password/reset/request/",
        views.PasswordResetRequestView.as_view(),
        name="password-reset-request",
    ),
    path(
        "auth/password/reset/confirm/",
        views.PasswordResetConfirmView.as_view(),
        name="password-reset-confirm",
    ),
]
