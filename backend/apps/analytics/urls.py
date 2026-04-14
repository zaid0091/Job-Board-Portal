from django.urls import path
from .views import EmployerDashboardView, PlatformStatsView, SeekerDashboardView

urlpatterns = [
    path('analytics/platform/stats/', PlatformStatsView.as_view(), name='platform-stats'),
    path('analytics/employer/dashboard/', EmployerDashboardView.as_view(), name='employer-dashboard'),
    path('analytics/seeker/dashboard/', SeekerDashboardView.as_view(), name='seeker-dashboard'),
]
