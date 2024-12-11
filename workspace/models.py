import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Workspace(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)  # Use UUID for primary key
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="workspaces")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Note(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)  # Use UUID for primary key
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name="notes")
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to="notes/")
    file_text = models.TextField(default='No text extracted')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    
    def extract_text(self):
        # Extract the content of the file here
        return self.file_text


class Video(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)  # Use UUID for primary key
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name="videos")
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to="videos/")
    created_at = models.DateTimeField(auto_now_add=True)
    transcription = models.TextField(default='No text extracted')

    def __str__(self):
        return self.title
    
    def extract_text(self):
        # Extract the content of the video here
        return self.transcription
