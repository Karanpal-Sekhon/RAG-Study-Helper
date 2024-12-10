from django.urls import path
from .views import (
    WorkspaceListCreateView, WorkspaceDetailView,
    NoteListCreateView, NoteDetailView,
    VideoListCreateView, VideoDetailView,
)

urlpatterns = [
    path('workspaces/', WorkspaceListCreateView.as_view(), name="workspace_list_create"),
    path('workspaces/<uuid:pk>/', WorkspaceDetailView.as_view(), name="workspace_detail"),
    path('notes/', NoteListCreateView.as_view(), name="note_list_create"),
    path('notes/<uuid:pk>/', NoteDetailView.as_view(), name="note_detail"),
    path('videos/', VideoListCreateView.as_view(), name="video_list_create"),
    path('videos/<uuid:pk>/', VideoDetailView.as_view(), name="video_detail"),
]
