"""
Views for symptoms
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Symptom
from .serializers import SymptomSerializer, SymptomListSerializer

@api_view(['GET'])
@permission_classes([AllowAny])
def symptom_list(request):
    """Get list of all symptoms"""
    symptoms = Symptom.objects.all().order_by('category', 'name')
    serializer = SymptomListSerializer(symptoms, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def symptoms_by_category(request):
    """Get symptoms grouped by category"""
    symptoms = Symptom.objects.all().order_by('category', 'name')
    
    # Group symptoms by category
    categories = {}
    for symptom in symptoms:
        if symptom.category not in categories:
            categories[symptom.category] = []
        categories[symptom.category].append({
            'id': str(symptom.id),
            'name': symptom.name
        })
    
    return Response(categories)

@api_view(['GET'])
@permission_classes([AllowAny])
def search_symptoms(request):
    """Search symptoms by name"""
    query = request.GET.get('q', '')
    if not query:
        return Response({'error': 'Query parameter q is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    symptoms = Symptom.objects(name__icontains=query).order_by('name')
    serializer = SymptomListSerializer(symptoms, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])  # For demo purposes, in production this should be admin only
def create_sample_symptoms(request):
    """Create sample symptoms data"""
    sample_symptoms = [
        {
            'name': 'Fever',
            'category': 'General',
            'severity_indicators': ['high temperature above 101°F', 'chills', 'sweating'],
            'related_conditions': ['infection', 'inflammation', 'immune response'],
            'description': 'Elevated body temperature, often indicating infection or illness'
        },
        {
            'name': 'Headache',
            'category': 'Neurological',
            'severity_indicators': ['severe pain', 'vision changes', 'neck stiffness'],
            'related_conditions': ['tension', 'migraine', 'cluster headache', 'sinus'],
            'description': 'Pain in the head or neck region'
        },
        {
            'name': 'Cough',
            'category': 'Respiratory',
            'severity_indicators': ['blood in sputum', 'persistent for weeks', 'difficulty breathing'],
            'related_conditions': ['cold', 'bronchitis', 'pneumonia', 'asthma'],
            'description': 'Forceful expulsion of air from the lungs'
        },
        {
            'name': 'Chest Pain',
            'category': 'Cardiovascular',
            'severity_indicators': ['crushing pain', 'radiating to arm', 'shortness of breath'],
            'related_conditions': ['heart attack', 'angina', 'anxiety', 'muscle strain'],
            'description': 'Pain or discomfort in the chest area'
        },
        {
            'name': 'Nausea',
            'category': 'Gastrointestinal',
            'severity_indicators': ['persistent vomiting', 'dehydration', 'blood in vomit'],
            'related_conditions': ['gastroenteritis', 'food poisoning', 'pregnancy', 'medication side effect'],
            'description': 'Feeling of sickness with inclination to vomit'
        },
        {
            'name': 'Fatigue',
            'category': 'General',
            'severity_indicators': ['extreme exhaustion', 'inability to perform daily tasks'],
            'related_conditions': ['viral infection', 'anemia', 'depression', 'sleep disorders'],
            'description': 'Extreme tiredness or lack of energy'
        },
        {
            'name': 'Shortness of Breath',
            'category': 'Respiratory',
            'severity_indicators': ['at rest', 'blue lips or fingernails', 'chest tightness'],
            'related_conditions': ['asthma', 'heart failure', 'anxiety', 'pneumonia'],
            'description': 'Difficulty breathing or feeling breathless'
        },
        {
            'name': 'Dizziness',
            'category': 'Neurological',
            'severity_indicators': ['fainting', 'loss of balance', 'hearing changes'],
            'related_conditions': ['inner ear problems', 'low blood pressure', 'dehydration'],
            'description': 'Feeling unsteady or lightheaded'
        }
    ]
    
    created_count = 0
    for symptom_data in sample_symptoms:
        # Check if symptom already exists
        if not Symptom.objects(name=symptom_data['name']).first():
            symptom = Symptom(**symptom_data)
            symptom.save()
            created_count += 1
    
    return Response({
        'message': f'Created {created_count} sample symptoms',
        'total_symptoms': Symptom.objects.count()
    })
