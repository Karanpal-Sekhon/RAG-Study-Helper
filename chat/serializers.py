from rest_framework import serializers
from .models import ChatMessage, ChatSession

class ChatMessageSerializer(serializers.ModelSerializer):
    """
    Serializer for ChatMessage model - handles individual messages
    """
    class Meta:
        model = ChatMessage
        fields = ['id', 'content', 'is_user_message', 'agent_type', 'created_at']
        read_only_fields = ['id', 'created_at']

class ChatSessionListSerializer(serializers.ModelSerializer):
    """
    Serializer for listing ChatSessions without including messages
    """
    message_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatSession
        fields = ['id', 'title', 'created_at', 'updated_at', 'message_count']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_message_count(self, obj):
        """Get the number of messages in this session"""
        return obj.messages.count()

class ChatSessionDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for retrieving a ChatSession with all its messages
    """
    messages = ChatMessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = ChatSession
        fields = ['id', 'title', 'created_at', 'updated_at', 'messages']
        read_only_fields = ['id', 'created_at', 'updated_at']