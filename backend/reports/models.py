"""
Medical report models using MongoDB
"""
from mongoengine import Document, StringField, ListField, DateTimeField, FloatField, ReferenceField, FileField,DictField  
from datetime import datetime
from accounts.models import UserProfile

class MedicalReport(Document):
    """
    Medical report analysis model
    """
    user = ReferenceField(UserProfile, required=True)
    report_type = StringField(required=True, max_length=50)
    file_names = ListField(StringField())
    additional_notes = StringField()
    
    # AI Analysis Results
    findings = ListField(DictField(), required=True)
    recommendations = ListField(StringField())
    urgency = StringField(choices=['low', 'medium', 'high'], required=True)
    summary = StringField(required=True)
    
    # Metadata
    created_at = DateTimeField(default=datetime.utcnow)
    ai_model_used = StringField(default='groq-llama3')
    confidence_score = FloatField(min_value=0, max_value=100)
    
    meta = {
        'collection': 'medical_reports',
        'indexes': [
            ('user', '-created_at'),
            'report_type',
            'urgency',
            '-created_at'
        ]
    }
    
    def __str__(self):
        return f"Report for {self.user.email} - {self.report_type} - {self.created_at}"
