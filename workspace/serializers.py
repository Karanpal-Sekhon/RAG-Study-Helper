from rest_framework import serializers
from .models import Workspace, Note, Video

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'title', 'file', 'workspace', 'created_at']


class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ['id', 'title', 'file', 'workspace', 'created_at']


class WorkspaceSerializer(serializers.ModelSerializer):
    notes = NoteSerializer(many=True, read_only=True)
    videos = VideoSerializer(many=True, read_only=True)

    class Meta:
        model = Workspace
        fields = ['id', 'name', 'owner', 'created_at', 'notes', 'videos']
        read_only_fields = ['owner']
