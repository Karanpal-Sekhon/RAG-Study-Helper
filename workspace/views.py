from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Workspace, Notes, Videos, NoteFile, VideoFile
from users.models import User
from .serializers import WorkspaceSerializer, NotesSerializer, VideosSerializer, NoteFileSerializer, VideoFileSerializer
from django.shortcuts import get_object_or_404

# Workspace views

class UserWorkspacesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Fetch all workspaces owned by the authenticated user
        workspaces = Workspace.objects.filter(owner=request.user)
        serializer = WorkspaceSerializer(workspaces, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# Create Workspace view
class CreateWorkspaceView(APIView):
    def post(self, request):
        # prepare serializer data
        data = request.data.copy()
        data['owner'] = request.user.id

        # Create and sa
        serializer = WorkspaceSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# Retrieve Workspace view
class WorkspaceDetailView(APIView):
    def get(self, request, workspace_id):
        # Get workspace obj
        try:
            workspace = get_object_or_404(Workspace, id = workspace_id, owner = request.user)
        except Workspace.DoesNotExist:
            return Response({'error': 'Workspace not found or does not exist'}, status=status.HTTP_404_NOT_FOUND)
        
        # serialize object and return data
        serializer = WorkspaceSerializer(workspace)
        workspace_data = serializer.data
        return Response(workspace_data, status=status.HTTP_200_OK)

    def delete(self, request, workspace_id):
        # Fetch the workspace object
        workspace = Workspace.objects.filter(id=workspace_id, owner=request.user).first()
        if not workspace:
            return Response({"error": "Workspace not found or not accessible."}, status=status.HTTP_404_NOT_FOUND)

        # Delete the workspace
        workspace.delete()
        return Response({"message": "Workspace deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
    

class WorkspaceVideosView(APIView):

    def get(self, request, workspace_id):
        # Fetch the workspace for the authenticated user
        workspace = Workspace.objects.filter(id=workspace_id, owner=request.user).first()
        if not workspace:
            return Response({"error": "Workspace not found or not accessible."}, status=status.HTTP_404_NOT_FOUND)
        
        # Get all videos for the workspace
        videos = Videos.objects.filter(workspace=workspace)
        serializer = VideosSerializer(videos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class WorkspaceNotesView(APIView):

    def get(self, request, workspace_id):
        # Fetch the workspace for the authenticated user
        workspace = Workspace.objects.filter(id=workspace_id, owner=request.user).first()
        if not workspace:
            return Response({"error": "Workspace not found or not accessible."}, status=status.HTTP_404_NOT_FOUND)
        
        # Get all notes for the workspace
        notes = Notes.objects.filter(workspace=workspace)
        serializer = NotesSerializer(notes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    
# Note views

# Create Note View
class CreateNoteView(APIView):
    def post(self, request, workspace_id):
        try:
            workspace = get_object_or_404(Workspace, id = workspace_id, owner = request.user)
        except Workspace.DoesNotExist:
            return Response({'error': 'Workspace not found or does not exist'}, status=status.HTTP_404_NOT_FOUND)
        # prepare serializer data
        data = {
            'title': request.data['title'],
            'workspace': workspace.id
        }
        serializer = NotesSerializer(data = data)
        if serializer.is_valid():
            serializer.save()
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# Retrieve Note View
class NoteDetailView(APIView):
    def get(self, request, workspace_id, note_id):
        try:
            note = get_object_or_404(Notes, id = note_id, workspace = workspace_id)
        except Notes.DoesNotExist:
            return Response({'error': 'Note not found or does not exist'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = NotesSerializer(note)
        note_data = serializer.data
        return Response(note_data, status=status.HTTP_200_OK)
    
    def delete(self, request, workspace_id, note_id):
        # Fetch the note object
        note = Notes.objects.filter(id=note_id, workspace__id=workspace_id, workspace__owner=request.user).first()
        if not note:
            return Response({"error": "Note not found or not accessible."}, status=status.HTTP_404_NOT_FOUND)

        # Delete the note
        note.delete()
        return Response({"message": "Note deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
    

class UploadNoteFileView(APIView):
    permission_classes = [IsAuthenticated]


    def post(self, request, workspace_id, note_id):
        # Fetch the note object
        note = Notes.objects.filter(id=note_id, workspace__id=workspace_id, workspace__owner=request.user).first()
        if not note:
            return Response({"error": "Note not found or not accessible."}, status=status.HTTP_404_NOT_FOUND)

        # Get the uploaded files from the request
        files = request.FILES.getlist('files')  # Use `getlist` to fetch multiple files
        if not files:
            return Response({"error": "No files uploaded."}, status=status.HTTP_400_BAD_REQUEST)

        # Create NoteFile objects for each uploaded file
        created_files = []
        for file in files:
            # Pass the `note` instance directly
            serializer = NoteFileSerializer(data={'file': file})
            if serializer.is_valid():
                created_file = serializer.save(note=note)  # Pass the note instance directly
                created_files.append(created_file)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Serialize and return the created files
        serialized_files = NoteFileSerializer(created_files, many=True)
        return Response(serialized_files.data, status=status.HTTP_201_CREATED)

    def delete(self, request, workspace_id, note_id, file_id):
        # Fetch the note file object
        note_file = NoteFile.objects.filter(id=file_id, note__id=note_id, note__workspace__id=workspace_id, note__workspace__owner=request.user).first()
        if not note_file:
            return Response({"error": "File not found or not accessible."}, status=status.HTTP_404_NOT_FOUND)

        # Delete the note file
        note_file.delete()
        return Response({"message": "File deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

# Video views

# Create video view
class CreateVideoView(APIView):
    def post(self, request, workspace_id):
        try:
            workspace = get_object_or_404(Workspace, id = workspace_id, owner = request.user)
        except Workspace.DoesNotExist:
            return Response({'error': 'Workspace not found or does not exist'}, status=status.HTTP_404_NOT_FOUND)
        
        title = request.data['title']
        data = {
            'title': title,
            'workspace': workspace.id
        }
        serializer = VideosSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
class VideoDetailView(APIView):
    def get(self, request, workspace_id, video_id):
        try:
            video = get_object_or_404(Videos, id = video_id, workspace = workspace_id)
        except Videos.DoesNotExist:
            return Response({'error': 'Workspace not found or does not exist'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = VideosSerializer(video)
        video_data = serializer.data
        return Response(video_data, status=status.HTTP_200_OK)
    
    def delete(self, request, workspace_id, video_id):
        # Fetch the video object
        video = Videos.objects.filter(id=video_id, workspace__id=workspace_id, workspace__owner=request.user).first()
        if not video:
            return Response({"error": "Video not found or not accessible."}, status=status.HTTP_404_NOT_FOUND)

        # Delete the video
        video.delete()
        return Response({"message": "Video deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
    
class UploadVideoFileView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, workspace_id, video_id):
        # Fetch the video object
        video = Videos.objects.filter(id=video_id, workspace__id=workspace_id, workspace__owner=request.user).first()
        if not video:
            return Response({"error": "Video not found or not accessible."}, status=status.HTTP_404_NOT_FOUND)

        # Get the uploaded files from the request
        files = request.FILES.getlist('files')  # Use `getlist` to fetch multiple files
        if not files:
            return Response({"error": "No files uploaded."}, status=status.HTTP_400_BAD_REQUEST)

        # Create VideoFile objects for each uploaded file
        created_files = []
        for file in files:
            serializer = VideoFileSerializer(data={'file': file})
            if serializer.is_valid():
                created_file = serializer.save(video=video)  # Pass the video instance directly
                created_files.append(created_file)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Serialize and return the created files
        serialized_files = VideoFileSerializer(created_files, many=True)
        return Response(serialized_files.data, status=status.HTTP_201_CREATED)

    def delete(self, request, workspace_id, video_id, file_id):
        # Fetch the video file object
        video_file = VideoFile.objects.filter(id=file_id, video__id=video_id, video__workspace__id=workspace_id, video__workspace__owner=request.user).first()
        if not video_file:
            return Response({"error": "File not found or not accessible."}, status=status.HTTP_404_NOT_FOUND)

        # Delete the video file
        video_file.delete()
        return Response({"message": "File deleted successfully."}, status=status.HTTP_204_NO_CONTENT)