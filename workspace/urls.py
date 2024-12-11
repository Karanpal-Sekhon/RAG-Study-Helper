from django.urls import path
from .views import CreateWorkspaceView, WorkspaceDetailView
import uuid

urlpatterns = [
    path('workspace/create', CreateWorkspaceView.as_view(), name='create_workspace'),
    path('workspace/<workspace_id>/detail', WorkspaceDetailView.as_view(), name='workspace_detail')
]
