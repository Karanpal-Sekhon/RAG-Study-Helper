from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from workspace.models import Workspace
from .models import ChatSession, ChatMessage
from unittest.mock import patch, MagicMock

User = get_user_model()

class ChatModelsTestCase(TestCase):
    """Basic tests for chat app models"""
    
    def setUp(self):
        """Set up test data"""
        # Create a test user
        self.test_user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword123',
            first_name='Test',
            last_name='User'
        )
        
        # Create a test workspace
        self.test_workspace = Workspace.objects.create(
            name='Test Workspace',
            owner=self.test_user
        )
        
        # Create a test chat session
        self.test_session = ChatSession.objects.create(
            workspace=self.test_workspace,
            user=self.test_user,
            title='Test Chat Session'
        )
    
    def test_models_creation(self):
        """Test basic model creation"""
        # Test session creation
        self.assertEqual(self.test_session.title, 'Test Chat Session')
        self.assertEqual(self.test_session.workspace, self.test_workspace)
        self.assertEqual(self.test_session.user, self.test_user)
        
        # Test message creation
        user_message = ChatMessage.objects.create(
            session=self.test_session,
            content='Test user message',
            is_user_message=True
        )
        
        ai_message = ChatMessage.objects.create(
            session=self.test_session,
            content='Test AI response',
            is_user_message=False,
            agent_type='rag_qa_agent'
        )
        
        # Verify messages
        self.assertEqual(ChatMessage.objects.count(), 2)
        self.assertEqual(user_message.content, 'Test user message')
        self.assertTrue(user_message.is_user_message)
        self.assertEqual(ai_message.content, 'Test AI response')
        self.assertEqual(ai_message.agent_type, 'rag_qa_agent')

class ChatAPITestCase(TestCase):
    """Tests for chat app API endpoints"""
    
    def setUp(self):
        """Set up test data and client"""
        # Create test user
        self.test_user = User.objects.create_user(
            username='testuser2',
            email='test2@example.com',
            password='testpassword123',
            first_name='Test',
            last_name='User'
        )
        
        # Create API client and authenticate
        self.client = APIClient()
        self.client.force_authenticate(user=self.test_user)
        
        # Create test workspace
        self.test_workspace = Workspace.objects.create(
            name='Test Workspace',
            owner=self.test_user
        )
        
        # Create test session
        self.test_session = ChatSession.objects.create(
            workspace=self.test_workspace,
            user=self.test_user,
            title='Test Chat Session'
        )
        
        # Create URLs for testing
        self.sessions_url = reverse('chat_sessions', kwargs={'workspace_id': self.test_workspace.id})
        self.session_detail_url = reverse('chat_session_detail', kwargs={
            'workspace_id': self.test_workspace.id,
            'session_id': self.test_session.id
        })
        self.message_url = reverse('chat_message', kwargs={
            'workspace_id': self.test_workspace.id,
            'session_id': self.test_session.id
        })
    
    def test_list_sessions(self):
        """Test listing chat sessions"""
        response = self.client.get(self.sessions_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Test Chat Session')
    
    def test_create_session(self):
        """Test creating a new session"""
        response = self.client.post(self.sessions_url, {'title': 'New Session'})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['title'], 'New Session')
        self.assertEqual(ChatSession.objects.count(), 2)
    
    def test_get_session_detail(self):
        """Test getting session details"""
        # Add a message to the session
        ChatMessage.objects.create(
            session=self.test_session,
            content='Test message',
            is_user_message=True
        )
        
        response = self.client.get(self.session_detail_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['title'], 'Test Chat Session')
        self.assertEqual(len(response.data['messages']), 1)
    
    def test_update_session(self):
        """Test updating a session title"""
        response = self.client.put(self.session_detail_url, {'title': 'Updated Title'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['title'], 'Updated Title')
        
        # Verify in database
        self.test_session.refresh_from_db()
        self.assertEqual(self.test_session.title, 'Updated Title')
    
    def test_delete_session(self):
        """Test deleting a session"""
        response = self.client.delete(self.session_detail_url)
        self.assertEqual(response.status_code, 204)
        self.assertEqual(ChatSession.objects.count(), 0)
    
    @patch('chat.views.multi_agent_graph')
    def test_send_message(self, mock_graph):
        """Test sending a message to the multi-agent system"""
        # Mock the multi-agent response
        mock_graph.invoke.return_value = {
            'messages': [
                MagicMock(content='Test question'),
                MagicMock(content='[RAG QA Agent]: This is a test response')
            ]
        }
        
        # Send a message
        response = self.client.post(self.message_url, {'message': 'Test question'})
        
        # Check response
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['agent_type'], 'rag_qa_agent')
        self.assertEqual(len(response.data['messages']), 2)
        
        # Check that messages were created
        self.assertEqual(ChatMessage.objects.count(), 2)
        
        # Check message content
        messages = list(ChatMessage.objects.all())
        self.assertEqual(messages[0].content, 'Test question')
        self.assertTrue(messages[0].is_user_message)
        self.assertEqual(messages[1].content, 'This is a test response')
        self.assertEqual(messages[1].agent_type, 'rag_qa_agent')
    
    def test_authorization(self):
        """Test that unauthorized users can't access endpoints"""
        # Create an unauthenticated client
        unauthenticated_client = APIClient()
        
        # Try to access endpoints
        response = unauthenticated_client.get(self.sessions_url)
        self.assertEqual(response.status_code, 401)
        
        response = unauthenticated_client.get(self.session_detail_url)
        self.assertEqual(response.status_code, 401)
        
        response = unauthenticated_client.post(self.message_url, {'message': 'Test'})
        self.assertEqual(response.status_code, 401)