from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Trip

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class TripSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Trip
        fields = [
            'id', 'user', 'destination', 'start_date', 'duration',
            'travelers', 'budget', 'interests', 'created_at',
            'travel_mode', 'accommodation', 
            'itinerary', 'packing_list', 'generated_at'  # ✅ Add these
        ]
        read_only_fields = ['id', 'user', 'created_at', 'itinerary', 'packing_list', 'generated_at']
        extra_kwargs = {
            'travel_mode': {'required': False, 'allow_blank': True},
            'accommodation': {'required': False, 'allow_blank': True},
        }