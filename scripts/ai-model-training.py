"""
AI Model Training Script for Medical Prediction Platform
This script demonstrates how to train a custom ML model as a fallback
to the Groq API integration for medical predictions.
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.multioutput import MultiOutputClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib
import json

def create_sample_medical_data():
    """
    Create sample medical training data
    In production, this would be replaced with real medical datasets
    """
    
    # Sample symptom combinations and their associated diseases
    training_data = [
        # Common Cold
        (['fever', 'headache', 'fatigue', 'runny nose'], ['common_cold']),
        (['cough', 'sore throat', 'congestion'], ['common_cold']),
        (['sneezing', 'fatigue', 'mild fever'], ['common_cold']),
        
        # Flu
        (['high fever', 'muscle aches', 'fatigue', 'headache'], ['influenza']),
        (['chills', 'cough', 'body aches'], ['influenza']),
        (['fever', 'weakness', 'respiratory symptoms'], ['influenza']),
        
        # Gastroenteritis
        (['nausea', 'vomiting', 'diarrhea'], ['gastroenteritis']),
        (['stomach pain', 'diarrhea', 'fever'], ['gastroenteritis']),
        (['vomiting', 'dehydration', 'abdominal cramps'], ['gastroenteritis']),
        
        # Anxiety
        (['chest pain', 'shortness of breath', 'rapid heartbeat'], ['anxiety']),
        (['dizziness', 'sweating', 'trembling'], ['anxiety']),
        (['panic', 'chest tightness', 'breathing difficulty'], ['anxiety']),
        
        # Migraine
        (['severe headache', 'nausea', 'light sensitivity'], ['migraine']),
        (['throbbing pain', 'vomiting', 'visual disturbances'], ['migraine']),
        (['headache', 'sound sensitivity', 'nausea'], ['migraine']),
    ]
    
    # Convert to DataFrame
    symptoms_list = []
    diseases_list = []
    
    for symptoms, diseases in training_data:
        symptoms_text = ' '.join(symptoms)
        symptoms_list.append(symptoms_text)
        diseases_list.append(diseases[0])  # Single label for simplicity
    
    df = pd.DataFrame({
        'symptoms': symptoms_list,
        'disease': diseases_list
    })
    
    return df

def train_medical_prediction_model():
    """
    Train a machine learning model for medical prediction
    """
    print("Creating sample medical training data...")
    df = create_sample_medical_data()
    
    print(f"Training data shape: {df.shape}")
    print(f"Unique diseases: {df['disease'].unique()}")
    
    # Prepare features using TF-IDF vectorization
    print("Vectorizing symptoms...")
    vectorizer = TfidfVectorizer(
        max_features=1000,
        ngram_range=(1, 2),
        stop_words='english'
    )
    
    X = vectorizer.fit_transform(df['symptoms'])
    y = df['disease']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Train Random Forest model
    print("Training Random Forest model...")
    model = RandomForestClassifier(
        n_estimators=100,
        random_state=42,
        max_depth=10
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate model
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"Model Accuracy: {accuracy:.2f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Save model and vectorizer
    print("Saving model and vectorizer...")
    joblib.dump(model, 'medical_prediction_model.pkl')
    joblib.dump(vectorizer, 'symptom_vectorizer.pkl')
    
    # Save disease mappings
    disease_mapping = {
        'common_cold': {
            'name': 'Common Cold',
            'description': 'Viral upper respiratory infection',
            'medications': ['Acetaminophen', 'Decongestants'],
            'recommendations': ['Rest', 'Hydration', 'Warm liquids']
        },
        'influenza': {
            'name': 'Influenza',
            'description': 'Seasonal flu with systemic symptoms',
            'medications': ['Oseltamivir', 'Acetaminophen'],
            'recommendations': ['Bed rest', 'Antiviral medication', 'Isolation']
        },
        'gastroenteritis': {
            'name': 'Gastroenteritis',
            'description': 'Stomach flu causing GI symptoms',
            'medications': ['Oral rehydration', 'Probiotics'],
            'recommendations': ['BRAT diet', 'Hydration', 'Rest']
        },
        'anxiety': {
            'name': 'Anxiety Disorder',
            'description': 'Mental health condition causing physical symptoms',
            'medications': ['Anxiolytics', 'Beta-blockers'],
            'recommendations': ['Breathing exercises', 'Therapy', 'Stress management']
        },
        'migraine': {
            'name': 'Migraine',
            'description': 'Severe headache with neurological symptoms',
            'medications': ['Triptans', 'NSAIDs'],
            'recommendations': ['Dark room', 'Cold compress', 'Avoid triggers']
        }
    }
    
    with open('disease_mapping.json', 'w') as f:
        json.dump(disease_mapping, f, indent=2)
    
    print("Model training completed successfully!")
    return model, vectorizer, disease_mapping

def predict_disease(symptoms_text, model_path='medical_prediction_model.pkl', 
                   vectorizer_path='symptom_vectorizer.pkl'):
    """
    Make predictions using the trained model
    """
    try:
        # Load model and vectorizer
        model = joblib.load(model_path)
        vectorizer = joblib.load(vectorizer_path)
        
        # Load disease mapping
        with open('disease_mapping.json', 'r') as f:
            disease_mapping = json.load(f)
        
        # Vectorize input symptoms
        symptoms_vector = vectorizer.transform([symptoms_text])
        
        # Make prediction
        prediction = model.predict(symptoms_vector)[0]
        probabilities = model.predict_proba(symptoms_vector)[0]
        
        # Get confidence score
        confidence = max(probabilities) * 100
        
        # Get disease information
        disease_info = disease_mapping.get(prediction, {
            'name': 'Unknown Condition',
            'description': 'Condition not found in database',
            'medications': ['Consult healthcare provider'],
            'recommendations': ['Seek medical attention']
        })
        
        result = {
            'predicted_disease': prediction,
            'confidence': confidence,
            'disease_info': disease_info
        }
        
        return result
        
    except Exception as e:
        print(f"Prediction error: {e}")
        return None

if __name__ == "__main__":
    # Train the model
    model, vectorizer, disease_mapping = train_medical_prediction_model()
    
    # Test prediction
    test_symptoms = "fever headache fatigue cough"
    result = predict_disease(test_symptoms)
    
    if result:
        print(f"\nTest Prediction:")
        print(f"Symptoms: {test_symptoms}")
        print(f"Predicted Disease: {result['disease_info']['name']}")
        print(f"Confidence: {result['confidence']:.1f}%")
        print(f"Description: {result['disease_info']['description']}")
