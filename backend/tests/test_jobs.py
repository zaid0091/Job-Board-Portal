import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from tests.factories import (
    EmployerUserFactory,
    SeekerUserFactory,
    JobFactory,
    JobCategoryFactory,
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
class TestJobListView:
    def test_list_jobs_unauthenticated(self, api_client):
        JobFactory.create_batch(3)
        url = reverse('jobs:job-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 3

    def test_list_jobs_with_search(self, api_client):
        JobFactory(title='Python Developer')
        JobFactory(title='Java Developer')
        url = reverse('jobs:job-list')
        response = api_client.get(url, {'search': 'Python'})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['title'] == 'Python Developer'

    def test_filter_by_job_type(self, api_client):
        from apps.jobs.models import Job
        JobFactory(job_type=Job.JobType.FULL_TIME)
        JobFactory(job_type=Job.JobType.PART_TIME)
        url = reverse('jobs:job-list')
        response = api_client.get(url, {'job_type': 'FULL_TIME'})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1

    def test_filter_remote_jobs(self, api_client):
        JobFactory(is_remote=True)
        JobFactory(is_remote=False)
        url = reverse('jobs:job-list')
        response = api_client.get(url, {'is_remote': 'true'})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1


@pytest.mark.django_db
class TestJobCreateView:
    def test_employer_can_create_job(self, employer_client):
        category = JobCategoryFactory()
        url = reverse('jobs:job-list')
        data = {
            'title': 'Senior Python Developer',
            'description': 'A' * 50,
            'job_type': 'FULL_TIME',
            'experience_level': 'SENIOR',
            'location': 'New York',
            'is_remote': False,
            'salary_min': 80000,
            'salary_max': 150000,
            'category_id': str(category.id),
        }
        response = employer_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['title'] == 'Senior Python Developer'

    def test_seeker_cannot_create_job(self, seeker_client):
        url = reverse('jobs:job-list')
        data = {
            'title': 'Test Job',
            'description': 'A' * 50,
            'job_type': 'FULL_TIME',
            'location': 'NYC',
        }
        response = seeker_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_unauthenticated_cannot_create_job(self, api_client):
        url = reverse('jobs:job-list')
        data = {'title': 'Test Job', 'description': 'Test', 'job_type': 'FULL_TIME', 'location': 'NYC'}
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestJobDetailView:
    def test_get_job_detail(self, api_client):
        job = JobFactory()
        url = reverse('jobs:job-detail', kwargs={'slug': job.slug})
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == job.title

    def test_employer_can_update_own_job(self, employer_client, employer_user):
        job = JobFactory(employer=employer_user)
        url = reverse('jobs:job-detail', kwargs={'slug': job.slug})
        response = employer_client.patch(url, {'title': 'Updated Title'}, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == 'Updated Title'

    def test_employer_cannot_update_others_job(self, employer_client):
        job = JobFactory()  # different employer
        url = reverse('jobs:job-detail', kwargs={'slug': job.slug})
        response = employer_client.patch(url, {'title': 'Hacked'}, format='json')
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_employer_can_delete_own_job(self, employer_client, employer_user):
        job = JobFactory(employer=employer_user)
        url = reverse('jobs:job-detail', kwargs={'slug': job.slug})
        response = employer_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT


@pytest.mark.django_db
class TestJobCategoryView:
    def test_list_categories(self, api_client):
        JobCategoryFactory.create_batch(5)
        url = reverse('jobs:job-categories')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 5


@pytest.mark.django_db
class TestSavedJobView:
    def test_seeker_can_save_job(self, seeker_client):
        job = JobFactory()
        url = reverse('jobs:savedjob-list')
        response = seeker_client.post(url, {'job_id': str(job.id)}, format='json')
        assert response.status_code == status.HTTP_201_CREATED

    def test_employer_cannot_save_job(self, employer_client):
        job = JobFactory()
        url = reverse('jobs:savedjob-list')
        response = employer_client.post(url, {'job_id': str(job.id)}, format='json')
        assert response.status_code == status.HTTP_403_FORBIDDEN
