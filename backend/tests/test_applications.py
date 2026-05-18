import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from tests.factories import (
    EmployerUserFactory,
    SeekerUserFactory,
    JobFactory,
    ApplicationFactory,
)


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def employer_user():
    return EmployerUserFactory()


@pytest.fixture
def seeker_user():
    return SeekerUserFactory()


@pytest.fixture
def employer_client(api_client, employer_user):
    api_client.force_authenticate(user=employer_user)
    return api_client


@pytest.fixture
def seeker_client(api_client, seeker_user):
    api_client.force_authenticate(user=seeker_user)
    return api_client


@pytest.mark.django_db
class TestApplicationCreateView:
    def test_seeker_can_apply(self, seeker_client):
        job = JobFactory()
        url = reverse('applications:application-list')
        data = {
            'job_id': str(job.id),
            'cover_letter': 'I am a great fit for this role.',
        }
        response = seeker_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED

    def test_employer_cannot_apply(self, employer_client):
        job = JobFactory()
        url = reverse('applications:application-list')
        data = {'job_id': str(job.id), 'cover_letter': 'Applying.'}
        response = employer_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_cannot_apply_twice(self, seeker_client, seeker_user):
        job = JobFactory()
        ApplicationFactory(job=job, applicant=seeker_user)
        url = reverse('applications:application-list')
        data = {'job_id': str(job.id), 'cover_letter': 'Again.'}
        response = seeker_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_unauthenticated_cannot_apply(self, api_client):
        job = JobFactory()
        url = reverse('applications:application-list')
        data = {'job_id': str(job.id), 'cover_letter': 'Test.'}
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestApplicationListView:
    def test_seeker_sees_own_applications(self, seeker_client, seeker_user):
        ApplicationFactory.create_batch(3, applicant=seeker_user)
        ApplicationFactory()  # someone else's
        url = reverse('applications:application-list')
        response = seeker_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 3

    def test_employer_sees_applications_for_their_jobs(self, employer_client, employer_user):
        job = JobFactory(employer=employer_user)
        ApplicationFactory.create_batch(2, job=job)
        ApplicationFactory()  # for someone else's job
        url = reverse('applications:application-list')
        response = employer_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 2


@pytest.mark.django_db
class TestApplicationStatusUpdate:
    def test_employer_can_update_status(self, employer_client, employer_user):
        job = JobFactory(employer=employer_user)
        application = ApplicationFactory(job=job)
        url = reverse('applications:application-update-status', kwargs={'pk': application.id})
        response = employer_client.patch(url, {'status': 'REVIEWING'}, format='json')
        assert response.status_code == status.HTTP_200_OK

    def test_seeker_cannot_update_status(self, seeker_client, seeker_user):
        application = ApplicationFactory(applicant=seeker_user)
        url = reverse('applications:application-update-status', kwargs={'pk': application.id})
        response = seeker_client.patch(url, {'status': 'REVIEWING'}, format='json')
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_invalid_status_transition(self, employer_client, employer_user):
        from apps.applications.models import Application
        job = JobFactory(employer=employer_user)
        application = ApplicationFactory(job=job, status=Application.Status.PENDING)
        url = reverse('applications:application-update-status', kwargs={'pk': application.id})
        response = employer_client.patch(url, {'status': 'ACCEPTED'}, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.django_db(transaction=False)
    def test_employer_status_update_notifies_seeker(self, employer_client, employer_user):
        from apps.notifications.models import Notification

        job = JobFactory(employer=employer_user)
        application = ApplicationFactory(job=job)
        applicant_id = application.applicant_id
        url = reverse('applications:application-update-status', kwargs={'pk': application.id})

        response = employer_client.post(url, {'status': 'REVIEWING'}, format='json')
        assert response.status_code == status.HTTP_200_OK

        notification = Notification.objects.filter(
            user_id=applicant_id,
            notification_type=Notification.Type.APPLICATION_STATUS,
            related_object_id=str(application.id),
        ).first()
        assert notification is not None
        assert 'REVIEWING' in notification.message or 'Under Review' in notification.message


@pytest.mark.django_db
class TestApplicationWithdraw:
    def test_seeker_can_withdraw(self, seeker_client, seeker_user):
        application = ApplicationFactory(applicant=seeker_user)
        url = reverse('applications:application-withdraw', kwargs={'pk': application.id})
        response = seeker_client.post(url)
        assert response.status_code == status.HTTP_200_OK

    def test_employer_cannot_withdraw(self, employer_client, employer_user):
        job = JobFactory(employer=employer_user)
        application = ApplicationFactory(job=job)
        url = reverse('applications:application-withdraw', kwargs={'pk': application.id})
        response = employer_client.post(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN
