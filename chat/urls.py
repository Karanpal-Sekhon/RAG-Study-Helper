from django.urls import path
from .views import ChatSessionView, ChatSessionDetailView, ChatMessageView

urlpatterns = [
    # Session management endpoints
    path('workspace/<uuid:workspace_id>/chat/sessions/', 
         ChatSessionView.as_view(), 
         name='chat_sessions'),
    
    path('workspace/<uuid:workspace_id>/chat/session/<uuid:session_id>/', 
         ChatSessionDetailView.as_view(), 
         name='chat_session_detail'),
    
    # Message endpoint
    path('workspace/<uuid:workspace_id>/chat/session/<uuid:session_id>/message/', 
         ChatMessageView.as_view(), 
         name='chat_message'),
]