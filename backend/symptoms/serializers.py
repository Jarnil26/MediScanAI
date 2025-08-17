"""
Serializers for symptoms
"""
from rest_framework import serializers
from .models import Symptom

class SymptomSerializer(serializers.Serializer):
    """Serializer for symptom data"""
    id = serializers.CharField(read_only=True)
    name = serializers.CharField(max_length=100)
    category = serializers.CharField(max_length=50)
    severity_indicators = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    related_conditions = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    description = serializers.CharField(required=False)

class SymptomListSerializer(serializers.Serializer):
    """Simplified serializer for symptom lists"""
    id = serializers.CharField(read_only=True)
    name = serializers.CharField()
    category = serializers.CharField()
