from unittest.mock import patch

from django.core.cache import cache
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.applications.models import Application, CoverLetterAudit, CoverLetterDraft
from apps.jobs.models import Job
from apps.profiles.models import EmployerProfile, SeekerProfile
from apps.users.models import User


class CoverLetterPreviewTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.employer_user = User.objects.create_user(
            email='employer@example.com',
            username='employer',
            password='Password123!@#',
            role=User.Role.EMPLOYER,
        )
        self.employer_profile = EmployerProfile.objects.get(user=self.employer_user)
        self.employer_profile.company_name = 'Acme Corp'
        self.employer_profile.save()

        self.seeker_user = User.objects.create_user(
            email='seeker@example.com',
            username='seeker',
            password='Password123!@#',
            role=User.Role.SEEKER,
        )
        seeker = SeekerProfile.objects.get(user=self.seeker_user)
        seeker.first_name = 'Jane'
        seeker.last_name = 'Doe'
        seeker.headline = 'Full Stack Developer'
        seeker.bio = 'Experienced developer passionate about web platforms.'
        seeker.save()

        self.job = Job.objects.create(
            employer=self.employer_profile,
            title='Senior Developer',
            slug='senior-developer-acme',
            description='Build scalable APIs and modern frontends.',
            requirements='Python, Django, React',
            status=Job.Status.ACTIVE,
            job_type=Job.JobType.FULL_TIME,
            experience_level=Job.ExperienceLevel.MID,
            location='Remote',
        )
        self.preview_url = reverse('application-preview-cover-letter')

    def test_seeker_can_preview_template_draft(self):
        self.client.force_authenticate(self.seeker_user)
        response = self.client.post(
            self.preview_url,
            {'job_id': str(self.job.id), 'regenerate': False},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['cover_letter'])
        self.assertTrue(response.data['draft_id'])
        self.assertEqual(response.data['generator'], 'template')
        self.assertTrue(
            CoverLetterDraft.objects.filter(user=self.seeker_user, job=self.job).exists()
        )
        self.assertTrue(
            CoverLetterAudit.objects.filter(
                user=self.seeker_user,
                job=self.job,
                action=CoverLetterAudit.Action.GENERATED,
            ).exists()
        )

    def test_employer_cannot_preview(self):
        self.client.force_authenticate(self.employer_user)
        response = self.client.post(
            self.preview_url,
            {'job_id': str(self.job.id)},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_cannot_preview_if_already_applied(self):
        Application.objects.create(
            job=self.job,
            applicant=self.seeker_user,
            cover_letter='Existing',
        )
        self.client.force_authenticate(self.seeker_user)
        response = self.client.post(
            self.preview_url,
            {'job_id': str(self.job.id)},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cache_hit_returns_same_draft(self):
        self.client.force_authenticate(self.seeker_user)
        first = self.client.post(
            self.preview_url,
            {'job_id': str(self.job.id)},
            format='json',
        )
        second = self.client.post(
            self.preview_url,
            {'job_id': str(self.job.id)},
            format='json',
        )
        self.assertEqual(first.status_code, status.HTTP_200_OK)
        self.assertEqual(second.status_code, status.HTTP_200_OK)
        self.assertTrue(second.data['cached'])
        self.assertEqual(first.data['draft_id'], second.data['draft_id'])
        self.assertEqual(
            CoverLetterDraft.objects.filter(user=self.seeker_user, job=self.job).count(),
            1,
        )

    @patch('apps.applications.services.cover_letter.generate_cover_letter')
    def test_regenerate_creates_new_draft(self, mocked_generate):
        mocked_generate.side_effect = [
            ('Letter A', ['a'], CoverLetterDraft.Generator.TEMPLATE, '', {}),
            ('Letter B', ['b'], CoverLetterDraft.Generator.TEMPLATE, '', {}),
        ]
        self.client.force_authenticate(self.seeker_user)
        self.client.post(self.preview_url, {'job_id': str(self.job.id)}, format='json')
        response = self.client.post(
            self.preview_url,
            {'job_id': str(self.job.id), 'regenerate': True},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['cover_letter'], 'Letter B')
        self.assertEqual(mocked_generate.call_count, 2)


class ApplicationCoverLetterAuditTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.employer_user = User.objects.create_user(
            email='employer2@example.com',
            username='employer2',
            password='Password123!@#',
            role=User.Role.EMPLOYER,
        )
        self.employer_profile = EmployerProfile.objects.get(user=self.employer_user)
        self.seeker_user = User.objects.create_user(
            email='seeker2@example.com',
            username='seeker2',
            password='Password123!@#',
            role=User.Role.SEEKER,
        )
        SeekerProfile.objects.get(user=self.seeker_user)
        self.job = Job.objects.create(
            employer=self.employer_profile,
            title='Backend Engineer',
            slug='backend-engineer',
            description='API development role.',
            status=Job.Status.ACTIVE,
            job_type=Job.JobType.FULL_TIME,
            experience_level=Job.ExperienceLevel.MID,
            location='Remote',
        )
        self.preview_url = reverse('application-preview-cover-letter')
        self.apply_url = reverse('application-list')
        self.client.force_authenticate(self.seeker_user)

    def test_submit_with_draft_logs_edited_before_apply(self):
        preview = self.client.post(
            self.preview_url,
            {'job_id': str(self.job.id)},
            format='json',
        )
        draft_id = preview.data['draft_id']
        response = self.client.post(
            self.apply_url,
            {
                'job': str(self.job.id),
                'cover_letter': 'Heavily edited cover letter content.',
                'cover_letter_draft_id': draft_id,
            },
            format='multipart',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            CoverLetterAudit.objects.filter(
                user=self.seeker_user,
                job=self.job,
                action=CoverLetterAudit.Action.EDITED_BEFORE_APPLY,
            ).exists()
        )

    def test_submit_unchanged_draft_logs_applied(self):
        preview = self.client.post(
            self.preview_url,
            {'job_id': str(self.job.id)},
            format='json',
        )
        draft_id = preview.data['draft_id']
        cover_letter = preview.data['cover_letter']
        response = self.client.post(
            self.apply_url,
            {
                'job': str(self.job.id),
                'cover_letter': cover_letter,
                'cover_letter_draft_id': draft_id,
            },
            format='multipart',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            CoverLetterAudit.objects.filter(
                user=self.seeker_user,
                job=self.job,
                action=CoverLetterAudit.Action.APPLIED,
            ).exists()
        )

    def test_cross_user_draft_rejected(self):
        other = User.objects.create_user(
            email='other@example.com',
            username='other',
            password='Password123!@#',
            role=User.Role.SEEKER,
        )
        draft = CoverLetterDraft.objects.create(
            user=other,
            job=self.job,
            profile_hash='abc',
            cover_letter='Private draft',
            highlights=[],
        )
        response = self.client.post(
            self.apply_url,
            {
                'job': str(self.job.id),
                'cover_letter': 'Attempt',
                'cover_letter_draft_id': str(draft.id),
            },
            format='multipart',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
