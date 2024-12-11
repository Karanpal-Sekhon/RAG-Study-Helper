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


class Notes(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)  # Use UUID for primary key
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name="notes")
    title = models.CharField(max_length=255)
    file_text = models.TextField(default='No text extracted')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    def extract_text(self):
        # Extract the content of the files here
        return self.file_text


class NoteFile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    note = models.ForeignKey(Notes, on_delete=models.CASCADE, related_name="files")
    file = models.FileField(upload_to="notes/")

    def __str__(self):
        return f"File for {self.note.title}"


class Videos(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)  # Use UUID for primary key
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name="videos")
    title = models.CharField(max_length=255)
    transcription = models.TextField(default='No text extracted')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    def extract_text(self):
        # Extract the content of the video transcription
        return self.transcription


class VideoFile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    video = models.ForeignKey(Videos, on_delete=models.CASCADE, related_name="files")
    file = models.FileField(upload_to="videos/")

    def __str__(self):
        return f"File for {self.video.title}"