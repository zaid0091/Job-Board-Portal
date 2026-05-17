from django.contrib import admin

from .models import Conversation, Message


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'application', 'last_message_at', 'created_at']
    search_fields = ['application__applicant__email', 'application__job__title']
    raw_id_fields = ['application']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'conversation', 'sender', 'created_at']
    search_fields = ['text', 'sender__email']
    raw_id_fields = ['conversation', 'sender']
