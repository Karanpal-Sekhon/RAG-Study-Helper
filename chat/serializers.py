from rest_framework import serializers
from .models import ChatMessage, ChatSession

class ChatMessageSerializer(serializers.ModelSerializer):
    """
    Serializer for ChatMessage model - handles individual messages
    """
    sender = serializers.SerializerMethodField()
    timestamp = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'content', 'sender', 'agent_type', 'timestamp', 'is_user_message']
        read_only_fields = ['id', 'timestamp']
    
    def get_sender(self, obj):
        """Return 'user' or 'assistant' based on is_user_message"""
        return 'user' if obj.is_user_message else 'assistant'

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