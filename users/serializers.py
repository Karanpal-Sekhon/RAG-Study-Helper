from rest_framework import serializers
from .models import User
import uuid

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile_image', 'password']
        read_only_fields = ['id']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def create(self, validated_data):

        # Generate unique id for the user:
        unique_id = uuid.uuid4()
        validated_data['id'] = unique_id

        user = User.objects.create_user(**validated_data)
        return user
