from django.urls import path
from .views import (
    CreateWorkspaceView, WorkspaceDetailView, 
    CreateNoteView, NoteDetailView, 
    CreateVideoView, VideoDetailView, 
    WorkspaceNotesView, WorkspaceVideosView, 
    UploadNoteFileView, UploadVideoFileView, 
    UserWorkspacesView, ChatMessageView
)
import uuid

urlpatterns = [
    path('workspaces/', UserWorkspacesView.as_view(), name='workspace_list'),
    path('workspace/create', CreateWorkspaceView.as_view(), name='create_workspace'),
    path('workspace/<workspace_id>/detail', WorkspaceDetailView.as_view(), name='workspace_detail'),
    path('workspace/<workspace_id>/create_note', CreateNoteView.as_view(), name='create_note'),
    path('workspace/<workspace_id>/note/<note_id>', NoteDetailView.as_view(), name='note_detail'),
    path('workspace/<workspace_id>/create_video', CreateVideoView.as_view(), name='create_video'),
    path('workspace/<workspace_id>/video/<video_id>', VideoDetailView.as_view(), name='video_detail'),
    path('workspace/<uuid:workspace_id>/notes', WorkspaceNotesView.as_view(), name='list_notes'),
    path('workspace/<uuid:workspace_id>/videos', WorkspaceVideosView.as_view(), name='list_videos'),
    path('workspace/<workspace_id>/note/<note_id>/upload_file', UploadNoteFileView.as_view(), name='upload_note_file'),
    path('workspace/<workspace_id>/video/<video_id>/upload_file', UploadVideoFileView.as_view(), name='upload_video_file'),
    path('workspace/<workspace_id>/note/<note_id>/file/<file_id>/delete', UploadNoteFileView.as_view(), name='delete_note_file'),
    path('workspace/<workspace_id>/video/<video_id>/file/<file_id>/delete', UploadVideoFileView.as_view(), name='delete_video_file'),
    
    # Chat endpoint for multi-agent processing
    path('workspace/<uuid:workspace_id>/chat', ChatMessageView.as_view(), name='chat'),
]