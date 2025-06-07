from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Workspace, Notes, Videos, NoteFile, VideoFile
from users.models import User
from .serializers import WorkspaceSerializer, NotesSerializer, VideosSerializer, NoteFileSerializer, VideoFileSerializer
from django.shortcuts import get_object_or_404
from .vector_store_manager import vector_store_manager

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

        # Clear the workspace vectorstore before deleting
        try:
            vector_store_manager.clear_workspace(str(workspace_id))
            print(f"Cleared vectorstore for workspace {workspace_id}")
        except Exception as e:
            print(f"Error clearing vectorstore for workspace {workspace_id}: {e}")

        # Clear agent cache for this workspace
        try:
            from Agents.rag_agent_manager import clear_agent_cache
            clear_agent_cache(str(workspace_id))
        except Exception as e:
            print(f"Error clearing agent cache for workspace {workspace_id}: {e}")

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
            note = serializer.save()
            
            # If there's initial text content, add to vectorstore
            if hasattr(note, 'file_text') and note.file_text and note.file_text.strip():
                try:
                    vector_store_manager.add_document_to_workspace(
                        workspace_id=str(workspace_id),
                        document_obj=note
                    )
                    print(f"Added note {note.id} to vectorstore for workspace {workspace_id}")
                except Exception as e:
                    print(f"Error adding note {note.id} to vectorstore: {e}")
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

        # Remove from vectorstore before deleting
        try:
            vector_store_manager.remove_document_from_workspace(
                workspace_id=str(workspace_id),
                document_id=str(note_id)
            )
            print(f"Removed note {note_id} from vectorstore for workspace {workspace_id}")
        except Exception as e:
            print(f"Error removing note {note_id} from vectorstore: {e}")

        # Clear agent cache to force refresh with updated vectorstore
        try:
            from Agents.rag_agent_manager import clear_agent_cache
            clear_agent_cache(str(workspace_id))
        except Exception as e:
            print(f"Error clearing agent cache for workspace {workspace_id}: {e}")

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
                
                # Add the file to the vectorstore
                try:
                    vector_store_manager.add_file_to_workspace(
                        workspace_id=str(workspace_id),
                        file_obj=created_file,
                        parent_document_obj=note
                    )
                    print(f"Added file {created_file.file.name} to vectorstore for workspace {workspace_id}")
                except Exception as e:
                    print(f"Error adding file {created_file.file.name} to vectorstore: {e}")
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Clear agent cache to force refresh with updated vectorstore
        if created_files:
            try:
                from Agents.rag_agent_manager import clear_agent_cache
                clear_agent_cache(str(workspace_id))
            except Exception as e:
                print(f"Error clearing agent cache for workspace {workspace_id}: {e}")

        # Serialize and return the created files
        serialized_files = NoteFileSerializer(created_files, many=True)
        return Response(serialized_files.data, status=status.HTTP_201_CREATED)

    def delete(self, request, workspace_id, note_id, file_id):
        # Fetch the note file object
        note_file = NoteFile.objects.filter(id=file_id, note__id=note_id, note__workspace__id=workspace_id, note__workspace__owner=request.user).first()
        if not note_file:
            return Response({"error": "File not found or not accessible."}, status=status.HTTP_404_NOT_FOUND)

        # Remove just this file from vectorstore
        try:
            # Remove the specific file from vectorstore
            vector_store_manager.remove_file_from_workspace(
                workspace_id=str(workspace_id),
                file_id=str(file_id)
            )
            
            print(f"Removed file {file_id} from vectorstore for workspace {workspace_id}")
        except Exception as e:
            print(f"Error removing file {file_id} from vectorstore: {e}")
        
        # Delete the file from database
        note_file.delete()

        # Clear agent cache to force refresh
        try:
            from Agents.rag_agent_manager import clear_agent_cache
            clear_agent_cache(str(workspace_id))
        except Exception as e:
            print(f"Error clearing agent cache for workspace {workspace_id}: {e}")

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
            video = serializer.save()
            
            # If there's initial transcription content, add to vectorstore
            if hasattr(video, 'transcription') and video.transcription and video.transcription.strip():
                try:
                    vector_store_manager.add_document_to_workspace(
                        workspace_id=str(workspace_id),
                        document_obj=video
                    )
                    print(f"Added video {video.id} to vectorstore for workspace {workspace_id}")
                except Exception as e:
                    print(f"Error adding video {video.id} to vectorstore: {e}")
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

        # Remove from vectorstore before deleting
        try:
            vector_store_manager.remove_document_from_workspace(
                workspace_id=str(workspace_id),
                document_id=str(video_id)
            )
            print(f"Removed video {video_id} from vectorstore for workspace {workspace_id}")
        except Exception as e:
            print(f"Error removing video {video_id} from vectorstore: {e}")

        # Clear agent cache to force refresh with updated vectorstore
        try:
            from Agents.rag_agent_manager import clear_agent_cache
            clear_agent_cache(str(workspace_id))
        except Exception as e:
            print(f"Error clearing agent cache for workspace {workspace_id}: {e}")

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
                
                # Add the file to the vectorstore (for video transcription)
                try:
                    vector_store_manager.add_file_to_workspace(
                        workspace_id=str(workspace_id),
                        file_obj=created_file,
                        parent_document_obj=video
                    )
                    print(f"Added video file {created_file.file.name} to vectorstore for workspace {workspace_id}")
                except Exception as e:
                    print(f"Error adding video file {created_file.file.name} to vectorstore: {e}")
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Clear agent cache to force refresh with updated vectorstore
        if created_files:
            try:
                from Agents.rag_agent_manager import clear_agent_cache
                clear_agent_cache(str(workspace_id))
            except Exception as e:
                print(f"Error clearing agent cache for workspace {workspace_id}: {e}")

        # Serialize and return the created files
        serialized_files = VideoFileSerializer(created_files, many=True)
        return Response(serialized_files.data, status=status.HTTP_201_CREATED)

    def delete(self, request, workspace_id, video_id, file_id):
        # Fetch the video file object
        video_file = VideoFile.objects.filter(id=file_id, video__id=video_id, video__workspace__id=workspace_id, video__workspace__owner=request.user).first()
        if not video_file:
            return Response({"error": "File not found or not accessible."}, status=status.HTTP_404_NOT_FOUND)

        # Remove just this file from vectorstore
        try:
            # Remove the specific file from vectorstore
            vector_store_manager.remove_file_from_workspace(
                workspace_id=str(workspace_id),
                file_id=str(file_id)
            )
            
            print(f"Removed video file {file_id} from vectorstore for workspace {workspace_id}")
        except Exception as e:
            print(f"Error removing video file {file_id} from vectorstore: {e}")
        
        # Delete the file from database
        video_file.delete()

        # Clear agent cache to force refresh
        try:
            from Agents.rag_agent_manager import clear_agent_cache
            clear_agent_cache(str(workspace_id))
        except Exception as e:
            print(f"Error clearing agent cache for workspace {workspace_id}: {e}")

        return Response({"message": "File deleted successfully."}, status=status.HTTP_204_NO_CONTENT)


# Chat and Multi-Agent Views

class ChatMessageView(APIView):
    """
    API endpoint for processing chat messages with the multi-agent system.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, workspace_id):
        # Verify the workspace exists and user has access
        workspace = Workspace.objects.filter(id=workspace_id, owner=request.user).first()
        if not workspace:
            return Response({"error": "Workspace not found or not accessible."}, status=status.HTTP_404_NOT_FOUND)
            
        # Get the query from the request
        message = request.data.get('message')
        if not message:
            return Response({"error": "Message is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Create the initial state with the user query and workspace context
            state = {
                "messages": [HumanMessage(content=message)],
                "workspace_id": str(workspace_id),
                "session_id": "direct_workspace_chat"  # For direct workspace chat without sessions
            }
            
            print(f"Processing direct workspace message for workspace {workspace_id}: {message[:100]}...")
            
            # Process through the multi-agent graph
            result = multi_agent_graph.invoke(state)
            
            # Extract the final agent response
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
            
            # Return the response with agent information
            return Response({
                "message": final_message,
                "agent_type": agent_type,
                "workspace_id": str(workspace_id)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Log the error and return a friendly message
            print(f"Error processing chat message: {str(e)}")
            return Response({
                "error": "An error occurred while processing your message. Please try again later.",
                "detail": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)