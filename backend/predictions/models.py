"""
Prediction models using MongoDB
"""
from mongoengine import Document, StringField, ListField, DateTimeField, FloatField, ReferenceField, IntField,DictField  
from datetime import datetime
from accounts.models import UserProfile

class Prediction(Document):
    """
    Medical prediction model
    """
    user = ReferenceField(UserProfile, required=True)
    symptoms = ListField(StringField(), required=True)
    additional_info = StringField()
    
    # AI Prediction Results
    predicted_diseases = ListField(DictField(), required=True)  # List of disease predictions
    medications = ListField(DictField())  # List of medication recommendations
    recommendations = ListField(StringField())  # General recommendations
    urgency = StringField(choices=['low', 'medium', 'high'], required=True)
    
    # Metadata
    created_at = DateTimeField(default=datetime.utcnow)
    ai_model_used = StringField(default='groq-llama3')
    confidence_score = FloatField(min_value=0, max_value=100)
    
    meta = {
        'collection': 'predictions',
        'indexes': [
            ('user', '-created_at'),
            'symptoms',
            'urgency',
            '-created_at'
        ]
    }
    
    def __str__(self):
        return f"Prediction for {self.user.email} - {self.created_at}"
    
    @property
    def top_disease(self):
        """Get the disease with highest probability"""
        if self.predicted_diseases:
            return max(self.predicted_diseases, key=lambda x: x.get('probability', 0))
        return None
