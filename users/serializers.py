from django.contrib.auth.models import User
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password'] # fields we want to serialize when we accept a new user, and returning a new user
        # Accept a password when creating a new user, however we do not want to return a password, when returning a user  
        extra_kwargs = {
            'password': {
                "write_only": True
            }
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    
    
