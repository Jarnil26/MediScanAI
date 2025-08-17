import os
import io
import json
import re
import logging
import numpy as np
from PIL import Image
import torch
import torch.nn.functional as F
from torchvision import transforms, models
import torch.nn as nn

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt

from accounts.models import UserProfile
from .models import MedicalReport

logger = logging.getLogger(__name__)

# Load class labels from saved file generated during training
def load_class_labels(path):
    with open(path, "r") as f:
        return [line.strip().split(',', 1)[1] for line in f.readlines()]

CLASS_LABELS = load_class_labels(r'D:\\AAA_Medical_AI\\medical-ai-platform\\backend\\models\\medmnist_global_labels.txt')
NUM_CLASSES = len(CLASS_LABELS)

# Path to your unified PyTorch model
UNIFIED_MODEL_PATH = r'D:\\AAA_Medical_AI\\medical-ai-platform\\backend\\models\\medmnist_unified_model.pth'

# Create the unified ResNet18 model architecture
def create_unified_resnet18(in_channels=1, num_classes=NUM_CLASSES):
    model = models.resnet18(weights=None)
    model.conv1 = nn.Conv2d(in_channels, 64, kernel_size=7, stride=2, padding=3, bias=False)
    model.fc = nn.Linear(model.fc.in_features, num_classes)
    return model

# Load the trained model
unified_model = create_unified_resnet18()
unified_model.load_state_dict(torch.load(UNIFIED_MODEL_PATH, map_location='cpu'))
unified_model.eval()

def get_user_from_token(request):
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

def human_label(raw_label):
    # Simplify labels for better user understanding
    if "_" in raw_label:
        parts = raw_label.split("_", 1)
        return parts[1].replace("_", " ").capitalize()
    return raw_label.replace("_", " ").capitalize()

def get_urgency_from_groq(disease_label):
    try:
        import requests
        from django.conf import settings

        prompt = f"Given the medical finding '{disease_label}', what is the recommended patient urgency: low, medium, or high? Reply strictly with one of these words."

        data = {
            "model": "llama3-8b-8192",
            "messages": [{"role": "system", "content": "Medical AI"}, {"role": "user", "content": prompt}],
            "temperature": 0.0,
            "max_tokens": 10
        }
        headers = {
            'Authorization': f'Bearer {settings.GROQ_API_KEY}',
            'Content-Type': 'application/json'
        }

        res = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=data, timeout=15)
        if res.status_code == 200:
            urgency = res.json()['choices'][0]['message']['content'].strip().lower()
            if urgency in ["low", "medium", "high"]:
                return urgency
    except Exception as e:
        logger.error(f"Groq API urgency error: {e}")
    return "medium"  # default fallback

def get_interpreted_finding(pred_class_label, report_type, user_description):
    import requests
    from django.conf import settings

    prompt = f"""
You are an expert medical assistant.
Given a user description: "{user_description}" and an AI model prediction: "{pred_class_label}" for a {report_type} report (e.g., chest X-ray),
1. Infer and return the most plausible DISEASE NAME or finding for this image. Use clinical language, but be understandable to a patient.
2. If the prediction does not fit the image type, offer your best guess based on the description, or say 'Unable to determine reliably.'
3. Return ONLY the disease/finding name (e.g., 'Pneumonia', 'Tuberculosis', 'Normal Chest'), a dash (–) if unknown, or the most relevant clinical conclusion.
Do NOT add disclaimers or extra sentences.
"""
    data = {
        "model": "llama3-8b-8192",
        "messages": [{"role": "system", "content": "Medical AI assistant"}, {"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 30
    }
    GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
    print("Groq API Key:", GROQ_API_KEY)  # Remove after confirming
    headers = {
        'Authorization': f'Bearer {GROQ_API_KEY}',
        'Content-Type': 'application/json'
    }

    response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=data, timeout=15)
    if response.status_code == 200:
        finding = response.json()['choices'][0]['message']['content'].strip()
        return finding
    return "-"


@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_report(request):
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

    report_type = request.data.get('report_type', '').lower()
    additional_notes = request.data.get('additional_notes', '')
    uploaded_files = [file for key, file in request.FILES.items() if key.startswith('file_')]
    file_names = [file.name for file in uploaded_files]

    if not uploaded_files:
        return Response({'error': 'No files uploaded'}, status=status.HTTP_400_BAD_REQUEST)
    if not report_type:
        return Response({'error': 'Report type is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        analysis_result = analyze_by_type(report_type, uploaded_files, additional_notes)

        report = MedicalReport(
            user=user,
            report_type=report_type,
            file_names=file_names,
            additional_notes=additional_notes,
            findings=analysis_result['findings'],
            recommendations=analysis_result['recommendations'],
            urgency=analysis_result['urgency'],
            summary=analysis_result['summary'],
            confidence_score=analysis_result.get('confidence', 0)
        )
        report.save()

        return Response({
            **analysis_result,
            'reportId': str(report.id),
            'savedToHistory': True
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.error(f"Report analysis error: {e}")
        return Response({'error': 'Internal Server Error'}, status=500)

def analyze_by_type(report_type, files, notes):
    image = Image.open(files[0]).convert('RGB')
    image_types = [
        'xray', 'ct', 'ctscan', 'mri', 'ultrasound', 'ecg', 'ekg', 'brain',
        'organ', 'chest', 'mammogram', 'breast'
    ]
    text_types = [
        'blood', 'lab', 'labreport', 'bloodreport', 'prescription', 'pathology'
    ]
    if report_type in image_types:
        return analyze_image_report(image, report_type, notes)
    elif report_type in text_types:
        return analyze_text_report(image, report_type, notes)
    else:
        return generate_fallback_analysis(report_type, files, notes)

def analyze_image_report(image, report_type, user_description):
    # Convert to grayscale, resize to 224x224, tensor, batch dim
    img = image.convert("L").resize((224, 224))
    img_tensor = transforms.ToTensor()(img).unsqueeze(0)

    with torch.no_grad():
        output = unified_model(img_tensor)
        probs = F.softmax(output, dim=1)
        pred_class = int(torch.argmax(probs, dim=1).item())
        confidence = float(torch.max(probs)) * 100
        raw_label = CLASS_LABELS[pred_class]

    pretty_label = human_label(raw_label)
    is_normal = pretty_label.lower() == "normal"
    urgency = get_urgency_from_groq(pretty_label)
    summary = get_interpreted_finding(pretty_label, report_type, user_description)

    return {
        "reportType": report_type.title(),
        "findings": [{
            "category": "Image Analysis",
            "finding": pretty_label,
            "severity": "abnormal" if not is_normal else "normal",
            "description": summary
        }],
        "recommendations": [
            "Consult specialist if abnormal" if not is_normal else "Routine follow-up"
        ],
        "urgency": urgency,
        "summary": summary,
        "confidence": confidence
    }

def analyze_text_report(image, report_type, notes):
    try:
        import pytesseract
        text = pytesseract.image_to_string(image)
        return call_groq_api(report_type, text + "\n\n" + notes)
    except Exception as e:
        logger.error(f"OCR or AI error: {e}")
        return generate_fallback_analysis(report_type, [], notes)

def call_groq_api(report_type, content):
    import requests
    from django.conf import settings

    headers = {
        'Authorization': f'Bearer {settings.GROQ_API_KEY}',
        'Content-Type': 'application/json'
    }

    prompt = f"""
You are a medical AI analyzing a {report_type} report. Analyze this text:

\"\"\"{content}\"\"\"

Return analysis in JSON:
{{
  "reportType": "name",
  "findings": [{{"category": "...", "finding": "...", "severity": "...", "description": "..."}}],
  "recommendations": ["...", "..."],
  "urgency": "low|medium|high",
  "summary": "...",
  "confidence": 87
}}
"""

    data = {
        "model": "llama3-8b-8192",
        "messages": [{"role": "system", "content": "Medical AI"}, {"role": "user", "content": prompt}],
        "temperature": 0.2,
        "max_tokens": 1500
    }

    res = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=data, timeout=30)
    if res.status_code == 200:
        try:
            response_data = res.json()['choices'][0]['message']['content']
            json_str = re.sub(r'^```$', '', response_data.strip(), flags=re.MULTILINE)
            return json.loads(json_str)
        except Exception as e:
            logger.error(f"Groq parsing error: {e}")
    raise Exception("Groq API failed")

def generate_fallback_analysis(report_type, files, notes):
    return {
        "reportType": f"{report_type.title()} Report",
        "findings": [{
            "category": "General",
            "finding": "No specific abnormalities detected",
            "severity": "normal",
            "description": "Fallback default analysis"
        }],
        "recommendations": ["Consult doctor for detailed evaluation"],
        "urgency": "low",
        "summary": "Report processed, no major issues found",
        "confidence": 75
    }
