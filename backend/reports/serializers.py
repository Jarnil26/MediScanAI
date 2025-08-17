"""
Serializers for medical reports
"""
from rest_framework import serializers
from .models import MedicalReport

class MedicalReportCreateSerializer(serializers.Serializer):
    """Serializer for creating medical reports"""
    report_type = serializers.CharField(required=True)
    additional_notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate_report_type(self, value):
        """Validate report type"""
        valid_types = [
            'blood_test', 'xray', 'mri', 'ct_scan', 'ultrasound', 
            'ecg', 'prescription', 'pathology', 'other'
        ]
        if value not in valid_types:
            raise serializers.ValidationError("Invalid report type")
        return value

class MedicalReportSerializer(serializers.Serializer):
    """Serializer for medical report responses"""
    id = serializers.CharField(read_only=True)
    report_type = serializers.CharField()
    file_names = serializers.ListField(child=serializers.CharField())
    additional_notes = serializers.CharField()
    findings = serializers.ListField(child=serializers.DictField())
    recommendations = serializers.ListField(child=serializers.CharField())
    urgency = serializers.CharField()
    summary = serializers.CharField()
    created_at = serializers.DateTimeField(read_only=True)
    ai_model_used = serializers.CharField(read_only=True)
    confidence_score = serializers.FloatField(read_only=True)
