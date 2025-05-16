import uuid
from django.db import models
from django.contrib.auth import get_user_model
from workspace.models import Workspace

User = get_user_model()

class ChatSession(models.Model):
    """
    Model for grouping related chat messages into a session.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name="chat_sessions")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chat_sessions")
    title = models.CharField(max_length=255, default="New Chat")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
        
    def __str__(self):
        return f"{self.title} ({self.created_at.strftime('%Y-%m-%d')})"

class ChatMessage(models.Model):
    """
    Model for storing chat messages between the user and the AI agents.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name="messages")
    content = models.TextField()
    is_user_message = models.BooleanField(default=True)
    agent_type = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']

    def __str__(self):
        sender = "User" if self.is_user_message else f"AI ({self.agent_type})"
        return f"{sender}: {self.content[:50]}..."
