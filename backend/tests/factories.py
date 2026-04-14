import factory
from factory.django import DjangoModelFactory
from django.contrib.auth import get_user_model

from apps.jobs.models import Job, JobCategory
from apps.applications.models import Application

User = get_user_model()


class UserFactory(DjangoModelFactory):
    class Meta:
        model = User

    email = factory.Sequence(lambda n: f'user{n}@example.com')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    password = factory.PostGenerationMethodCall('set_password', 'testpass123')
    is_active = True
    is_email_verified = True


class EmployerUserFactory(UserFactory):
    role = User.Role.EMPLOYER


class SeekerUserFactory(UserFactory):
    role = User.Role.SEEKER


class AdminUserFactory(UserFactory):
    role = User.Role.ADMIN
    is_staff = True


class JobCategoryFactory(DjangoModelFactory):
    class Meta:
        model = JobCategory

    name = factory.Sequence(lambda n: f'Category {n}')
    slug = factory.LazyAttribute(lambda o: o.name.lower().replace(' ', '-'))


class JobFactory(DjangoModelFactory):
    class Meta:
        model = Job

    title = factory.Faker('job')
    description = factory.Faker('paragraph', nb_sentences=5)
    employer = factory.SubFactory(EmployerUserFactory)
    job_type = Job.JobType.FULL_TIME
    experience_level = Job.ExperienceLevel.MID
    location = factory.Faker('city')
    is_remote = False
    status = Job.Status.ACTIVE
    salary_min = 50000
    salary_max = 100000


class ApplicationFactory(DjangoModelFactory):
    class Meta:
        model = Application

    job = factory.SubFactory(JobFactory)
    applicant = factory.SubFactory(SeekerUserFactory)
    cover_letter = factory.Faker('paragraph', nb_sentences=3)
    status = Application.Status.PENDING
