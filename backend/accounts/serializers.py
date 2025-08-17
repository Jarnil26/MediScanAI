"""
Serializers for user accounts
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import UserProfile
import re

class UserRegistrationSerializer(serializers.Serializer):
    """Serializer for user registration"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    first_name = serializers.CharField(max_length=30)
    last_name = serializers.CharField(max_length=30)
    age = serializers.IntegerField(required=False, min_value=0, max_value=150)
    gender = serializers.ChoiceField(
        choices=['male', 'female', 'other', 'prefer_not_to_say'],
        required=False
    )
    phone_number = serializers.CharField(max_length=20, required=False)
    
    def validate_email(self, value):
        """Validate email uniqueness"""
        if UserProfile.objects(email=value).first():
            raise serializers.ValidationError("User with this email already exists.")
        return value
    
    def validate_password(self, value):
        """Validate password strength"""
        validate_password(value)
        return value
    
    def validate_phone_number(self, value):
        """Validate phone number format"""
        if value and not re.match(r'^\+?1?\d{9,15}$', value):
            raise serializers.ValidationError("Invalid phone number format.")
        return value
    
    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords do not match.")
        return attrs
    
    def create(self, validated_data):
        """Create new user"""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = UserProfile(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserProfileSerializer(serializers.Serializer):
    """Serializer for user profile"""
    id = serializers.CharField(read_only=True)
    email = serializers.EmailField(read_only=True)
    first_name = serializers.CharField(max_length=30)
    last_name = serializers.CharField(max_length=30)
    age = serializers.IntegerField(required=False, min_value=0, max_value=150)
    gender = serializers.ChoiceField(
        choices=['male', 'female', 'other', 'prefer_not_to_say'],
        required=False
    )
    phone_number = serializers.CharField(max_length=20, required=False)
    medical_history = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    date_joined = serializers.DateTimeField(read_only=True)
    
    def update(self, instance, validated_data):
        """Update user profile"""
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        """Validate login credentials"""
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = UserProfile.objects(email=email).first()
            if not user or not user.check_password(password):
                raise serializers.ValidationError("Invalid email or password.")
            
            if not user.is_active:
                raise serializers.ValidationError("User account is disabled.")
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError("Must include email and password.")
