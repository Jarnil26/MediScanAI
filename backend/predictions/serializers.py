"""
Serializers for predictions
"""
from rest_framework import serializers
from .models import Prediction

class PredictionCreateSerializer(serializers.Serializer):
    """Serializer for creating predictions"""
    symptoms = serializers.ListField(
        child=serializers.CharField(),
        min_length=1,
        error_messages={'min_length': 'At least one symptom is required.'}
    )
    additional_info = serializers.CharField(required=False, allow_blank=True)
    
    def validate_symptoms(self, value):
        """Validate symptoms list"""
        if not value:
            raise serializers.ValidationError("At least one symptom is required.")
        
        # Remove duplicates and empty strings
        cleaned_symptoms = list(set([s.strip() for s in value if s.strip()]))
        if not cleaned_symptoms:
            raise serializers.ValidationError("Valid symptoms are required.")
        
        return cleaned_symptoms

class PredictionSerializer(serializers.Serializer):
    """Serializer for prediction responses"""
    id = serializers.CharField(read_only=True)
    symptoms = serializers.ListField(child=serializers.CharField())
    additional_info = serializers.CharField()
    predicted_diseases = serializers.ListField(child=serializers.DictField())
    medications = serializers.ListField(child=serializers.DictField())
    recommendations = serializers.ListField(child=serializers.CharField())
    urgency = serializers.CharField()
    created_at = serializers.DateTimeField(read_only=True)
    ai_model_used = serializers.CharField(read_only=True)
    confidence_score = serializers.FloatField(read_only=True)
    
    # Computed fields
    top_disease = serializers.SerializerMethodField()
    
    def get_top_disease(self, obj):
        """Get the top predicted disease"""
        if obj.predicted_diseases:
            return max(obj.predicted_diseases, key=lambda x: x.get('probability', 0))
        return None

class PredictionHistorySerializer(serializers.Serializer):
    """Serializer for prediction history"""
    id = serializers.CharField(read_only=True)
    symptoms = serializers.ListField(child=serializers.CharField())
    top_disease = serializers.SerializerMethodField()
    urgency = serializers.CharField()
    created_at = serializers.DateTimeField(read_only=True)
    confidence_score = serializers.FloatField(read_only=True)
    
    def get_top_disease(self, obj):
        """Get the top predicted disease"""
        if obj.predicted_diseases:
            top = max(obj.predicted_diseases, key=lambda x: x.get('probability', 0))
            return {
                'name': top.get('name'),
                'probability': top.get('probability')
            }
        return None
