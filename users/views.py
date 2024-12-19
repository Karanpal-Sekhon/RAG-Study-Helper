from django.shortcuts import render
from django.contrib.auth import get_user_model
from rest_framework import generics
from rest_framework.views import APIView
from .serializers import UserSerializer
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

User = get_user_model()  # Import the custom User model

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]




User = get_user_model()

class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get the authenticated user's info
        user = request.user
        user_data = {
            "id": str(user.id),
            "username": user.username,
            "email": user.email,
            "profile_image": user.profile_image if user.profile_image else None
        }
        return Response(user_data, status=200)