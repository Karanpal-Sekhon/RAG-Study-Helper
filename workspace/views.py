from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Workspace, Note, Video
from users.models import User
from .serializers import WorkspaceSerializer, NoteSerializer, VideoSerializer
from django.shortcuts import get_object_or_404

# Workspace views

# Create Workspace view
class CreateWorkspaceView(APIView):
    def post(self, request):
        req_data = request.data
        data = {}
        # Get the request data and prepare the serializer data
        owner_id = req_data.get('owner')
        # Get the user/owner
        user = User.objects.get(id = owner_id)
        data['name'] = req_data.get('name')

        serializer = WorkspaceSerializer(data=data, context = {'owner': user})
        if serializer.is_valid():
            serializer.save()
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# Retrieve Workspace view
class WorkspaceDetailView(APIView):
    def get(self, request, workspace_id):

        try:
            workspace = get_object_or_404(Workspace, id = workspace_id, owner = request.user)
        except Workspace.DoesNotExist:
            return Response({'error': 'Workspace not found or does not exist'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = WorkspaceSerializer(workspace)
        workspace_data = serializer.data

        return Response(workspace_data, status=status.HTTP_200_OK)
    
# Note view

