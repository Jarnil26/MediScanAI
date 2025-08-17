import json
import logging
import re
import requests
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.conf import settings

from accounts.models import UserProfile
from .models import Prediction
from .serializers import PredictionCreateSerializer, PredictionSerializer, PredictionHistorySerializer

logger = logging.getLogger(__name__)

class PredictionPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50

def get_user_from_token(request):
    """Extract user from JWT token"""
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')
    if auth_header.startswith('Bearer '):
        try:
            import jwt
            token = auth_header.split(' ')[1]
            decoded = jwt.decode(token, options={"verify_signature": False})
            user_id = decoded.get('user_id')
            return UserProfile.objects(id=user_id).first()
        except Exception as e:
            logger.error(f"Token decode error: {e}")
    return None

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_prediction(request):
    """Create a new medical prediction"""
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    serializer = PredictionCreateSerializer(data=request.data)
    if serializer.is_valid():
        symptoms = serializer.validated_data['symptoms']
        additional_info = serializer.validated_data.get('additional_info', '')
        try:
            prediction_result = generate_ai_prediction(symptoms, additional_info)
            prediction = Prediction(
                user=user,
                symptoms=symptoms,
                additional_info=additional_info,
                predicted_diseases=prediction_result['diseases'],
                medications=prediction_result['medications'],
                recommendations=prediction_result['recommendations'],
                urgency=prediction_result['urgency'],
                confidence_score=prediction_result.get('confidence_score', 0)
            )
            prediction.save()
            response_serializer = PredictionSerializer(prediction)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Prediction generation error: {e}")
            return Response(
                {'error': 'Failed to generate prediction. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def prediction_history(request):
    """Get user's prediction history"""
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    predictions = Prediction.objects(user=user).order_by('-created_at')
    paginator = PredictionPagination()
    page = paginator.paginate_queryset(predictions, request)
    if page is not None:
        serializer = PredictionHistorySerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
    serializer = PredictionHistorySerializer(predictions, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def prediction_detail(request, prediction_id):
    """Get detailed prediction"""
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    try:
        prediction = Prediction.objects(id=prediction_id, user=user).first()
        if not prediction:
            return Response({'error': 'Prediction not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = PredictionSerializer(prediction)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': 'Invalid prediction ID'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats(request):
    """Get user prediction statistics"""
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    predictions = Prediction.objects(user=user)
    total_predictions = predictions.count()
    if total_predictions == 0:
        return Response({
            'total_predictions': 0,
            'avg_confidence': 0,
            'last_prediction': None,
            'urgency_breakdown': {'low': 0, 'medium': 0, 'high': 0}
        })
    avg_confidence = sum([p.confidence_score or 0 for p in predictions]) / total_predictions
    last_prediction = predictions.order_by('-created_at').first()
    urgency_breakdown = {'low': 0, 'medium': 0, 'high': 0}
    for prediction in predictions:
        urgency_breakdown[prediction.urgency] += 1
    return Response({
        'total_predictions': total_predictions,
        'avg_confidence': round(avg_confidence, 1),
        'last_prediction': last_prediction.created_at if last_prediction else None,
        'urgency_breakdown': urgency_breakdown
    })

def extract_json_from_text(text):
    """
    Extract the first JSON object from mixed text, handling multi-line and text-wrapped JSON.
    """
    try:
        # This matches from the first '{' to the last '}' (greedy, covers large JSON blocks)
        match = re.search(r'\{[\s\S]*\}', text)
        if match:
            return json.loads(match.group())
        else:
            logger.error("No JSON object found in Groq API response.")
            return None
    except Exception as e:
        logger.error(f"Error parsing JSON from Groq API response: {e}")
        return None

def generate_ai_prediction(symptoms, additional_info=""):
    """
    Generate AI prediction using Groq API (with fallback).
    """
    try:
        if getattr(settings, 'GROQ_API_KEY', None):
            return call_groq_api(symptoms, additional_info)
        else:
            return generate_mock_prediction(symptoms, additional_info)
    except Exception as e:
        logger.error(f"AI prediction error: {e}")
        return generate_mock_prediction(symptoms, additional_info)

def call_groq_api(symptoms, additional_info):
    """
    Call Groq API and robustly parse disease predictions.
    """
    prompt = f"""
You are a medical AI assistant. Analyze the following patient symptom information carefully.

Symptoms: {', '.join(symptoms)}
Additional Information: {additional_info}

Please provide a detailed medical prediction including:
1. Top 3 most likely medical conditions (with probability percentages and brief descriptions)
2. Recommended over-the-counter medications (with dosages and instructions)
3. General care recommendations
4. Urgency level (low, medium, high)

Return your response as a JSON object with the following structure:

{{
  "diseases": [
    {{"name": "condition_name", "probability": 90, "description": "brief_description"}},
    {{"name": "condition_name", "probability": 75, "description": "brief_description"}},
    {{"name": "condition_name", "probability": 50, "description": "brief_description"}}
  ],
  "medications": [
    {{"name": "medication_name", "dosage": "dosage_info", "instructions": "usage_instructions"}}
  ],
  "recommendations": ["recommendation1", "recommendation2"],
  "urgency": "low|medium|high",
  "confidence_score": 87
}}
"""
    headers = {
        'Authorization': f'Bearer {settings.GROQ_API_KEY}',
        'Content-Type': 'application/json'
    }

    data = {
        'model': 'llama3-8b-8192',
        'messages': [
            {
                'role': 'system',
                'content': (
                    'You are a medical AI assistant. Provide accurate medical information '
                    'emphasizing consulting healthcare professionals.'
                )
            },
            {'role': 'user', 'content': prompt}
        ],
        'temperature': 0.3,
        'max_tokens': 1000
    }

    response = requests.post(
        'https://api.groq.com/openai/v1/chat/completions',
        headers=headers,
        json=data,
        timeout=30
    )
    if response.status_code == 200:
        result = response.json()
        content = result['choices'][0]['message']['content']
        parsed = extract_json_from_text(content)
        print("Parsed JSON:", parsed)  # Debugging line, remove after confirming
        if parsed:
            return parsed
        else:
            logger.error("Failed to extract JSON from Groq API response content")
            return generate_mock_prediction(symptoms, additional_info)
    else:
        logger.error(f"Groq API error: {response.status_code} {response.text}")
        return generate_mock_prediction(symptoms, additional_info)

def generate_mock_prediction(symptoms, additional_info):
    """
    Generate mock prediction for testing/fallback.
    """
    symptom_lower = [s.lower() for s in symptoms]

    if any(s in symptom_lower for s in ['fever', 'headache', 'fatigue']):
        return {
            'diseases': [
                {'name': 'Common Cold', 'probability': 87, 'description': 'Viral upper respiratory infection'},
                {'name': 'Influenza', 'probability': 72, 'description': 'Seasonal flu with systemic symptoms'},
                {'name': 'COVID-19', 'probability': 45, 'description': 'Coronavirus infection'}
            ],
            'medications': [
                {'name': 'Acetaminophen', 'dosage': '500mg every 6 hours', 'instructions': 'Take with food'},
                {'name': 'Ibuprofen', 'dosage': '200mg every 8 hours', 'instructions': 'Anti-inflammatory'}
            ],
            'recommendations': [
                'Get plenty of rest and stay hydrated',
                'Monitor symptoms and seek medical attention if they worsen',
                'Avoid contact with others to prevent spread'
            ],
            'urgency': 'low',
            'confidence_score': 82
        }
    elif any(s in symptom_lower for s in ['chest pain', 'shortness of breath']):
        return {
            'diseases': [
                {'name': 'Anxiety Disorder', 'probability': 78, 'description': 'Panic attack or anxiety-related symptoms'},
                {'name': 'Asthma', 'probability': 65, 'description': 'Respiratory condition'},
                {'name': 'Heart Condition', 'probability': 35, 'description': 'Potential cardiac issue'}
            ],
            'medications': [
                {'name': 'Deep breathing exercises', 'dosage': 'As needed', 'instructions': 'Practice relaxation techniques'},
                {'name': 'Antihistamine', 'dosage': 'As directed', 'instructions': 'If allergic reaction suspected'}
            ],
            'recommendations': [
                'Practice deep breathing exercises',
                'Seek immediate medical attention if symptoms persist',
                'Consider stress management techniques'
            ],
            'urgency': 'medium',
            'confidence_score': 75
        }
    else:
        return {
            'diseases': [
                {'name': 'General Malaise', 'probability': 60, 'description': 'Non-specific symptoms'},
                {'name': 'Viral Syndrome', 'probability': 45, 'description': 'Common viral infection'}
            ],
            'medications': [
                {'name': 'Rest and hydration', 'dosage': 'As needed', 'instructions': 'Support body recovery'},
                {'name': 'Over-the-counter pain relief', 'dosage': 'As directed', 'instructions': 'For symptom management'}
            ],
            'recommendations': [
                'Monitor symptoms closely',
                'Maintain good hydration',
                'Consult healthcare provider if symptoms worsen'
            ],
            'urgency': 'low',
            'confidence_score': 65
        }
