import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.chat.models import Conversation, Message
from apps.chat.services import create_message, get_or_create_conversation, message_to_packet
from tests.factories import (
    ApplicationFactory,
    EmployerUserFactory,
    JobFactory,
    SeekerUserFactory,
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


@pytest.fixture
def application(employer_user, seeker_user):
    job = JobFactory(employer=employer_user)
    return ApplicationFactory(job=job, applicant=seeker_user)


@pytest.fixture
def conversation(application):
    return get_or_create_conversation(application)


@pytest.mark.django_db
class TestOpenConversation:
    def test_seeker_opens_conversation(self, seeker_client, application):
        url = reverse('chat:conversation-open-conversation')
        response = seeker_client.post(
            url,
            {'application_id': str(application.id)},
            format='json',
        )
        assert response.status_code == status.HTTP_200_OK
        assert Conversation.objects.filter(application=application).exists()

    def test_unrelated_user_cannot_open(self, api_client, application):
        other = SeekerUserFactory()
        api_client.force_authenticate(user=other)
        url = reverse('chat:conversation-open-conversation')
        response = api_client.post(
            url,
            {'application_id': str(application.id)},
            format='json',
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestConversationAccess:
    def test_participant_can_retrieve(self, seeker_client, conversation):
        url = reverse('chat:conversation-detail', kwargs={'pk': conversation.id})
        response = seeker_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_non_participant_cannot_retrieve(self, seeker_client, conversation):
        other = SeekerUserFactory()
        seeker_client.force_authenticate(user=other)
        url = reverse('chat:conversation-detail', kwargs={'pk': conversation.id})
        response = seeker_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestMessages:
    def test_create_message_and_packet_shape(self, conversation, seeker_user):
        message = create_message(conversation, seeker_user, 'Hello there')
        packet = message_to_packet(message)
        assert packet['type'] == 'chat.message'
        assert packet['message']['sender_id'] == str(seeker_user.id)
        assert packet['message']['text'] == 'Hello there'
        assert 'timestamp' in packet['message']

    def test_message_history(self, seeker_client, conversation, seeker_user):
        create_message(conversation, seeker_user, 'First')
        url = reverse('chat:conversation-messages', kwargs={'pk': conversation.id})
        response = seeker_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1

    def test_send_message_via_rest(self, seeker_client, conversation):
        url = reverse('chat:conversation-messages', kwargs={'pk': conversation.id})
        response = seeker_client.post(
            url,
            {'text': 'Hello via REST'},
            format='json',
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['text'] == 'Hello via REST'
        assert Message.objects.filter(conversation=conversation).count() == 1

    def test_mark_read(self, employer_client, conversation, seeker_user):
        msg = create_message(conversation, seeker_user, 'Hi')
        url = reverse('chat:conversation-mark-read', kwargs={'pk': conversation.id})
        response = employer_client.post(
            url,
            {'up_to_message_id': str(msg.id)},
            format='json',
        )
        assert response.status_code == status.HTTP_200_OK
        conversation.refresh_from_db()
        assert conversation.employer_last_read_at is not None


@pytest.mark.django_db
class TestConversationParticipantModel:
    def test_is_participant_seeker_and_employer(self, conversation, seeker_user, employer_user):
        assert conversation.is_participant(seeker_user)
        assert conversation.is_participant(employer_user)
        assert not conversation.is_participant(SeekerUserFactory())
