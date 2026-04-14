from rest_framework import generics, viewsets, permissions
from rest_framework.parsers import MultiPartParser, FormParser

from core.permissions import IsEmployer, IsSeeker
from .models import (
    EmployerProfile, SeekerProfile,
    Skill, Experience, Education
)
from .serializers import (
    EmployerProfileSerializer, SeekerProfileSerializer,
    SkillSerializer, ExperienceSerializer, EducationSerializer,
    EmployerProfilePublicSerializer
)


class EmployerProfileView(generics.RetrieveUpdateAPIView):
    """GET/PUT/PATCH /api/v1/profiles/employer/me/"""
    serializer_class = EmployerProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsEmployer]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        return self.request.user.employer_profile


class EmployerProfilePublicView(generics.RetrieveAPIView):
    """GET /api/v1/profiles/employers/:id/"""
    serializer_class = EmployerProfilePublicSerializer
    permission_classes = [permissions.AllowAny]
    queryset = EmployerProfile.objects.all()
    lookup_field = 'id'


class SeekerProfileView(generics.RetrieveUpdateAPIView):
    """GET/PUT/PATCH /api/v1/profiles/seeker/me/"""
    serializer_class = SeekerProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsSeeker]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        return self.request.user.seeker_profile


class ExperienceViewSet(viewsets.ModelViewSet):
    """CRUD for seeker work experience."""
    serializer_class = ExperienceSerializer
    permission_classes = [permissions.IsAuthenticated, IsSeeker]

    def get_queryset(self):
        return Experience.objects.filter(
            seeker=self.request.user.seeker_profile
        )

    def perform_create(self, serializer):
        serializer.save(seeker=self.request.user.seeker_profile)


class EducationViewSet(viewsets.ModelViewSet):
    """CRUD for seeker education entries."""
    serializer_class = EducationSerializer
    permission_classes = [permissions.IsAuthenticated, IsSeeker]

    def get_queryset(self):
        return Education.objects.filter(
            seeker=self.request.user.seeker_profile
        )

    def perform_create(self, serializer):
        serializer.save(seeker=self.request.user.seeker_profile)


class SkillListView(generics.ListAPIView):
    """GET /api/v1/profiles/skills/ — List all skills."""
    serializer_class = SkillSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Skill.objects.all()
    search_fields = ['name']
    pagination_class = None
