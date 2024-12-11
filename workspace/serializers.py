from rest_framework import serializers
from .models import Workspace, Notes, Videos, NoteFile, VideoFile
import uuid


class NoteFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = NoteFile
        fields = ['id', 'file']

    def create(self, validated_data):
        # Generate unique id for the file
        unique_id = uuid.uuid4()
        validated_data['id'] = unique_id

        return NoteFile.objects.create(**validated_data)
    
class VideoFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoFile
        fields = ['id', 'file']
    
    def create(self, validated_data):
        # Generate unique id for the file
        unique_id = uuid.uuid4()
        validated_data['id'] = unique_id

        return VideoFile.objects.create(**validated_data)

class NotesSerializer(serializers.ModelSerializer):
    files = NoteFileSerializer(many=True, read_only=True)  # Use nested serializer for related files
    
    class Meta:
        model = Notes
        fields = ['id', 'title', 'workspace', 'files', 'created_at']
        extra_kwargs = {
            'files': {'required': False},
        }

    def create(self, validated_data):
        # Generate the unique id for the Note
        unique_id = uuid.uuid4()
        validated_data['id'] = unique_id

        return Notes.objects.create(**validated_data) 


class VideosSerializer(serializers.ModelSerializer):
    files = VideoFileSerializer(many=True, read_only=True)  # Use the correct serializer for related files

    class Meta:
        model = Videos
        fields = ['id', 'title', 'files', 'workspace', 'created_at']
        extra_kwargs = {
            'files': {'required': False},
        }

    def create(self, validated_data):
        # Generate the unique id for the video
        unique_id = uuid.uuid4()
        validated_data['id'] = unique_id

        return Videos.objects.create(**validated_data)



class WorkspaceSerializer(serializers.ModelSerializer):
    notes = NotesSerializer(many=True, read_only=True)
    videos = VideosSerializer(many=True, read_only=True)

    class Meta:
        model = Workspace
        fields = ['name', 'id', 'owner', 'notes', 'videos']
        read_only_fields = ['id', 'created_at'] # auto generated fields

    def create(self, validated_data):
        # Generate the unique id for the workspace
        unique_id = uuid.uuid4()
        validated_data['id'] = unique_id

        return Workspace.objects.create(**validated_data) 
