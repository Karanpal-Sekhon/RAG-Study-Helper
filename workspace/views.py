from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Workspace, Note, Video
from .serializers import WorkspaceSerializer, NoteSerializer, VideoSerializer

# Workspace Views
class WorkspaceListCreateView(generics.ListCreateAPIView):
    serializer_class = WorkspaceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Workspace.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class WorkspaceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WorkspaceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Workspace.objects.filter(owner=self.request.user)


# Note Views
class NoteListCreateView(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(workspace__owner=self.request.user)

    def perform_create(self, serializer):
        workspace_id = self.request.data.get("workspace_id")
        workspace = Workspace.objects.get(id=workspace_id, owner=self.request.user)
        serializer.save(workspace=workspace)


class NoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(workspace__owner=self.request.user)


# Video Views
class VideoListCreateView(generics.ListCreateAPIView):
    serializer_class = VideoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Video.objects.filter(workspace__owner=self.request.user)

    def perform_create(self, serializer):
        workspace_id = self.request.data.get("workspace_id")
        workspace = Workspace.objects.get(id=workspace_id, owner=self.request.user)
        serializer.save(workspace=workspace)


class VideoDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VideoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Video.objects.filter(workspace__owner=self.request.user)
