"""
Symptom models using MongoDB
"""
from mongoengine import Document, StringField, ListField
from datetime import datetime

class Symptom(Document):
    """
    Symptom reference model
    """
    name = StringField(required=True, unique=True, max_length=100)
    category = StringField(required=True, max_length=50)
    severity_indicators = ListField(StringField())
    related_conditions = ListField(StringField())
    description = StringField()
    
    meta = {
        'collection': 'symptoms',
        'indexes': ['name', 'category']
    }
    
    def __str__(self):
        return self.name
    
    @classmethod
    def get_by_category(cls, category):
        """Get symptoms by category"""
        return cls.objects(category=category)
    
    @classmethod
    def search_symptoms(cls, query):
        """Search symptoms by name"""
        return cls.objects(name__icontains=query)
