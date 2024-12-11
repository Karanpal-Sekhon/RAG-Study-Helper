from rest_framework import serializers
from .models import Workspace, Note, Video
import uuid


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'title', 'file', 'workspace', 'created_at']

    def create(self, validated_data):
        # Generate the unique id for the Note
        unique_id = uuid.uuid4()
        validated_data[id] = unique_id

        return Note.objects.create(**validated_data) 


class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ['id', 'title', 'file', 'workspace', 'created_at']

    def create(self, validated_data):
        # Generate the unique id for the video

        unique_id = uuid.uuid4()
        validated_data[id] = unique_id

        return Video.objects.create(**validated_data) 


class WorkspaceSerializer(serializers.ModelSerializer):
    notes = NoteSerializer(many=True, read_only=True)
    videos = VideoSerializer(many=True, read_only=True)

    class Meta:
        model = Workspace
        fields = ['name', 'id', 'owner', 'notes', 'videos']
        read_only_fields = ['id','owner', 'created_at']

    def create(self, validated_data):
        # Generate the unique id for the workspace
        unique_id = uuid.uuid4()
        validated_data['id'] = unique_id
        validated_data['owner'] = self.context.get('owner')

        return Workspace.objects.create(**validated_data) 
