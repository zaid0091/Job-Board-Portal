from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.profiles.models import ParsedResumeResult, ResumeParseJob, SeekerProfile, Skill
from apps.users.models import User


class ResumeParsingApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='seeker@example.com',
            username='seeker',
            password='Password123!@#',
            role=User.Role.SEEKER,
        )
        SeekerProfile.objects.get_or_create(user=self.user)
        self.client.force_authenticate(self.user)

    @patch('apps.profiles.views.run_resume_parse_job.delay')
    def test_create_resume_parse_job(self, mocked_delay):
        resume = SimpleUploadedFile(
            'resume.pdf',
            b'%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF',
            content_type='application/pdf',
        )
        response = self.client.post(
            '/api/v1/profiles/seeker/resume/parse/',
            {'resume': resume},
            format='multipart',
        )
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.assertEqual(ResumeParseJob.objects.count(), 1)
        mocked_delay.assert_called_once()

    def test_apply_resume_autofill_updates_profile(self):
        profile = self.user.seeker_profile
        skill = Skill.objects.create(name='Python', slug='python', category='Programming')
        job = ResumeParseJob.objects.create(
            user=self.user,
            status=ResumeParseJob.Status.REVIEW_READY,
            source_file=SimpleUploadedFile(
                'resume.pdf',
                b'%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF',
                content_type='application/pdf',
            ),
            source_hash='abc' * 21 + 'a',
        )
        ParsedResumeResult.objects.create(
            job=job,
            summary='Backend engineer with platform experience.',
            location='Lagos, Nigeria',
            skills=[{'name': 'Python', 'confidence': 0.9}],
            experiences=[],
            educations=[],
            normalized_payload={
                'summary': 'Backend engineer with platform experience.',
                'location': 'Lagos, Nigeria',
                'skills': [{'name': 'Python', 'confidence': 0.9}],
                'experiences': [],
                'educations': [],
                'experience_years': 6,
            },
        )

        response = self.client.post(
            f'/api/v1/profiles/seeker/resume/parse/{job.id}/apply/',
            {'headline': 'Senior Backend Engineer'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        profile.refresh_from_db()
        self.assertEqual(profile.location, 'Lagos, Nigeria')
        self.assertEqual(profile.bio, 'Backend engineer with platform experience.')
        self.assertEqual(profile.headline, 'Senior Backend Engineer')
        self.assertEqual(profile.experience_years, 6)
        self.assertIn(skill, profile.skills.all())

    def test_preview_and_discard_parsed_resume(self):
        job = ResumeParseJob.objects.create(
            user=self.user,
            status=ResumeParseJob.Status.REVIEW_READY,
            source_file=SimpleUploadedFile(
                'resume.pdf',
                b'%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF',
                content_type='application/pdf',
            ),
            source_hash='f' * 64,
        )
        ParsedResumeResult.objects.create(
            job=job,
            summary='Data engineer profile',
            location='Abuja, Nigeria',
            skills=[{'name': 'SQL', 'confidence': 0.8}],
            experiences=[],
            educations=[],
            normalized_payload={'summary': 'Data engineer profile'},
        )
        preview_response = self.client.get(f'/api/v1/profiles/seeker/resume/parse/{job.id}/preview/')
        self.assertEqual(preview_response.status_code, status.HTTP_200_OK)
        self.assertEqual(preview_response.data['summary'], 'Data engineer profile')

        discard_response = self.client.post(f'/api/v1/profiles/seeker/resume/parse/{job.id}/discard/', {}, format='json')
        self.assertEqual(discard_response.status_code, status.HTTP_200_OK)
        job.refresh_from_db()
        self.assertEqual(job.status, ResumeParseJob.Status.DISCARDED)
