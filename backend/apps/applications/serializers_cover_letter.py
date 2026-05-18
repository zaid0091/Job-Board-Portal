from rest_framework import serializers

from apps.applications.models import CoverLetterDraft


class CoverLetterPreviewRequestSerializer(serializers.Serializer):
    job_id = serializers.UUIDField()
    regenerate = serializers.BooleanField(default=False, required=False)


class CoverLetterPreviewResponseSerializer(serializers.Serializer):
    draft_id = serializers.UUIDField()
    cover_letter = serializers.CharField()
    highlights = serializers.ListField(child=serializers.CharField())
    cached = serializers.BooleanField()
    generator = serializers.CharField()
    profile_hash = serializers.CharField()
    disclaimer = serializers.CharField()
