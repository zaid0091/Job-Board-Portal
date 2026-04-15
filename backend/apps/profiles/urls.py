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
    path('profiles/seeker/resume/parse/', views.ResumeParseCreateView.as_view(), name='seeker-resume-parse'),
    path('profiles/seeker/resume/parse/<uuid:job_id>/status/', views.ResumeParseStatusView.as_view(), name='seeker-resume-parse-status'),
    path('profiles/seeker/resume/parse/<uuid:job_id>/preview/', views.ResumeParsePreviewView.as_view(), name='seeker-resume-parse-preview'),
    path('profiles/seeker/resume/parse/<uuid:job_id>/apply/', views.ResumeParseApplyView.as_view(), name='seeker-resume-parse-apply'),
    path('profiles/seeker/resume/parse/<uuid:job_id>/discard/', views.ResumeParseDiscardView.as_view(), name='seeker-resume-parse-discard'),
    path('profiles/skills/', views.SkillListView.as_view(), name='skill-list'),
    path('', include(router.urls)),
]
