"""
User account models using MongoDB
"""
from mongoengine import Document, StringField, EmailField, DateTimeField, BooleanField, IntField, ListField
from django.contrib.auth.hashers import make_password, check_password
from datetime import datetime

class UserProfile(Document):
    """
    Custom user model using MongoDB
    """
    email = EmailField(required=True, unique=True)
    password_hash = StringField(required=True, max_length=128)
    first_name = StringField(required=True, max_length=30)
    last_name = StringField(required=True, max_length=30)
    date_joined = DateTimeField(default=datetime.utcnow)
    is_active = BooleanField(default=True)
    last_login = DateTimeField()
    
    # Profile information
    age = IntField(min_value=0, max_value=150)
    gender = StringField(choices=['male', 'female', 'other', 'prefer_not_to_say'])
    medical_history = ListField(StringField())
    phone_number = StringField(max_length=20)
    
    meta = {
        'collection': 'users',
        'indexes': ['email', 'date_joined']
    }
    
    def set_password(self, raw_password):
        """Set password with Django's password hashing"""
        self.password_hash = make_password(raw_password)
    
    def check_password(self, raw_password):
        """Check password against hash"""
        return check_password(raw_password, self.password_hash)
    
    def get_full_name(self):
        """Return full name"""
        return f"{self.first_name} {self.last_name}".strip()
    
    def get_short_name(self):
        """Return short name"""
        return self.first_name
    
    def __str__(self):
        return self.email
    
    @property
    def is_authenticated(self):
        return True
    
    @property
    def is_anonymous(self):
        return False
