from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'profiles/experiences', views.ExperienceViewSet, basename='experience')
router.register(r'profiles/educations', views.EducationViewSet, basename='education')

urlpatterns = [
    path('profiles/employer/', views.EmployerProfileView.as_view(), name='employer-profile'),
    path('profiles/employer/<uuid:id>/', views.EmployerProfilePublicView.as_view(), name='employer-public'),
    path('profiles/seeker/', views.SeekerProfileView.as_view(), name='seeker-profile'),
    path('profiles/skills/', views.SkillListView.as_view(), name='skill-list'),
    path('', include(router.urls)),
]
