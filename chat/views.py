from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from workspace.models import Workspace
from .models import ChatSession, ChatMessage
from .serializers import ChatMessageSerializer, ChatSessionListSerializer, ChatSessionDetailSerializer

# Import the multi-agent system
import sys
import os
import importlib.util
from pathlib import Path

# Get the project root directory
project_root = Path(__file__).resolve().parent.parent

# Ensure the Agents directory is in the Python path
agents_dir = os.path.join(project_root, 'Agents')
if agents_dir not in sys.path:
    sys.path.append(agents_dir)

# Import multi-agent and factory
# Need to fix module name for imports with hyphens
multi_agent_spec = importlib.util.spec_from_file_location(
    "multi_agent", 
    os.path.join(agents_dir, "multi-agent.py")
)
multi_agent = importlib.util.module_from_spec(multi_agent_spec)
sys.modules["multi_agent"] = multi_agent
multi_agent_spec.loader.exec_module(multi_agent)

# Get the graph from the multi-agent module
multi_agent_graph = multi_agent.graph

# Import agent factory
from Agents.agent_factory import AgentFactory

# Import LangChain message types for graph input/output
from langchain_core.messages import HumanMessage, AIMessage

class ChatSessionView(APIView):
    """
    API endpoint for listing and creating chat sessions
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, workspace_id):
        """List all chat sessions for a workspace"""
        # Verify the workspace exists and user has access
        workspace = get_object_or_404(Workspace, id=workspace_id, owner=request.user)
        
        # Get all chat sessions for this workspace
        sessions = ChatSession.objects.filter(
            workspace=workspace,
            user=request.user
        )
        
        serializer = ChatSessionListSerializer(sessions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request, workspace_id):
        """Create a new chat session"""
        # Verify the workspace exists and user has access
        workspace = get_object_or_404(Workspace, id=workspace_id, owner=request.user)
        
        # Create a new session
        session = ChatSession.objects.create(
            workspace=workspace,
            user=request.user,
            title=request.data.get('title', 'New Chat')
        )
        
        serializer = ChatSessionListSerializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ChatSessionDetailView(APIView):
    """
    API endpoint for retrieving, updating, or deleting a specific chat session
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, workspace_id, session_id):
        """Retrieve a chat session with all messages"""
        # Verify the workspace exists and user has access
        workspace = get_object_or_404(Workspace, id=workspace_id, owner=request.user)
        
        # Get the chat session
        session = get_object_or_404(
            ChatSession, 
            id=session_id, 
            workspace=workspace,
            user=request.user
        )
        
        serializer = ChatSessionDetailSerializer(session)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request, workspace_id, session_id):
        """Update a chat session (e.g., title)"""
        # Verify the workspace exists and user has access
        workspace = get_object_or_404(Workspace, id=workspace_id, owner=request.user)
        
        # Get the chat session
        session = get_object_or_404(
            ChatSession, 
            id=session_id, 
            workspace=workspace,
            user=request.user
        )
        
        # Update the title if provided
        title = request.data.get('title')
        if title:
            session.title = title
            session.save()
        
        serializer = ChatSessionListSerializer(session)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def delete(self, request, workspace_id, session_id):
        """Delete a chat session"""
        # Verify the workspace exists and user has access
        workspace = get_object_or_404(Workspace, id=workspace_id, owner=request.user)
        
        # Get the chat session
        session = get_object_or_404(
            ChatSession, 
            id=session_id, 
            workspace=workspace,
            user=request.user
        )
        
        # Delete the session (and all its messages via cascade)
        session.delete()
        
        return Response(status=status.HTTP_204_NO_CONTENT)

class ChatMessageView(APIView):
    """
    API endpoint for sending messages to the multi-agent system
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, workspace_id, session_id):
        """Process a new message through the multi-agent system"""
        # Verify the workspace exists and user has access
        workspace = get_object_or_404(Workspace, id=workspace_id, owner=request.user)
        
        # Get the chat session
        session = get_object_or_404(
            ChatSession, 
            id=session_id, 
            workspace=workspace,
            user=request.user
        )
        
        # Get the message content
        message_content = request.data.get('message')
        if not message_content:
            return Response(
                {"error": "Message content is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Save the user message
        user_message = ChatMessage.objects.create(
            session=session,
            content=message_content,
            is_user_message=True
        )
        
        try:
            # Process the message through the multi-agent system
            # Create the initial state with the user message
            state = {"messages": [HumanMessage(content=message_content)]}
            
            # Add workspace_id for context in the multi-agent system
            state["workspace_id"] = str(workspace_id)
            
            # Process the message
            result = multi_agent_graph.invoke(state)
            
            # Extract the final message
            final_message = result["messages"][-1].content
            agent_type = "unknown"
            
            # Try to extract agent type from response format
            if "[RAG QA Agent]:" in final_message:
                agent_type = "rag_qa_agent"
                final_message = final_message.replace("[RAG QA Agent]: ", "")
            elif "[Flashcard Agent]:" in final_message:
                agent_type = "flashcard_agent"
                final_message = final_message.replace("[Flashcard Agent]: ", "")
            elif "[Exam Agent]:" in final_message:
                agent_type = "exam_agent"
                final_message = final_message.replace("[Exam Agent]: ", "")
            elif "[Resource Agent]:" in final_message:
                agent_type = "resource_agent"
                final_message = final_message.replace("[Resource Agent]: ", "")
            
            # Save the AI response
            ai_message = ChatMessage.objects.create(
                session=session,
                content=final_message,
                is_user_message=False,
                agent_type=agent_type
            )
            
            # Return both messages
            messages = [
                ChatMessageSerializer(user_message).data,
                ChatMessageSerializer(ai_message).data
            ]
            
            # Update session's updated_at timestamp
            session.save()  # Triggers auto_now field update
            
            return Response({
                "messages": messages,
                "agent_type": agent_type
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Log the error
            print(f"Error processing message: {str(e)}")
            
            # Create an error message from the AI
            error_message = "I'm sorry, I encountered an error processing your request. Please try again later."
            
            ai_message = ChatMessage.objects.create(
                session=session,
                content=error_message,
                is_user_message=False,
                agent_type="error"
            )
            
            return Response({
                "error": "An error occurred while processing your message",
                "messages": [
                    ChatMessageSerializer(user_message).data,
                    ChatMessageSerializer(ai_message).data
                ],
                "detail": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)