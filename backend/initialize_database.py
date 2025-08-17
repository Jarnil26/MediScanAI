"""
Initialize MongoDB database with sample data
Run this after confirming connection works
"""
import mongoengine
from datetime import datetime
import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def initialize_database():
    """Initialize the database with sample data"""
    try:
        # Connect to MongoDB Atlas
        MONGODB_URL = "mongodb+srv://jarnilp:jarnil12@medaidb.mvzuq1o.mongodb.net/?retryWrites=true&w=majority&appName=Medaidb"
        mongoengine.connect(host=MONGODB_URL)
        print("✅ Connected to MongoDB Atlas")
        
        # Import models
        from symptoms.models import Symptom
        from accounts.models import UserProfile
        
        print("🔄 Initializing symptom database...")
        
        # Sample symptoms data
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
            },
            {
                'name': 'Sore Throat',
                'category': 'Respiratory',
                'severity_indicators': ['difficulty swallowing', 'white patches', 'swollen glands'],
                'related_conditions': ['viral infection', 'bacterial infection', 'allergies'],
                'description': 'Pain or irritation in the throat'
            },
            {
                'name': 'Vomiting',
                'category': 'Gastrointestinal',
                'severity_indicators': ['blood in vomit', 'severe dehydration', 'persistent vomiting'],
                'related_conditions': ['food poisoning', 'gastroenteritis', 'pregnancy', 'medication reaction'],
                'description': 'Forceful expulsion of stomach contents'
            },
            {
                'name': 'Diarrhea',
                'category': 'Gastrointestinal',
                'severity_indicators': ['blood in stool', 'severe dehydration', 'high fever'],
                'related_conditions': ['food poisoning', 'viral infection', 'bacterial infection', 'IBS'],
                'description': 'Loose or watery bowel movements'
            },
            {
                'name': 'Abdominal Pain',
                'category': 'Gastrointestinal',
                'severity_indicators': ['severe cramping', 'rigid abdomen', 'fever with pain'],
                'related_conditions': ['appendicitis', 'gastritis', 'food poisoning', 'IBS'],
                'description': 'Pain in the stomach or abdominal area'
            },
            {
                'name': 'Muscle Aches',
                'category': 'Musculoskeletal',
                'severity_indicators': ['severe pain', 'inability to move', 'swelling'],
                'related_conditions': ['viral infection', 'overexertion', 'fibromyalgia', 'flu'],
                'description': 'Pain or soreness in muscles'
            },
            {
                'name': 'Joint Pain',
                'category': 'Musculoskeletal',
                'severity_indicators': ['swelling', 'redness', 'inability to move joint'],
                'related_conditions': ['arthritis', 'injury', 'infection', 'autoimmune disease'],
                'description': 'Pain in joints or connecting tissues'
            },
            {
                'name': 'Rash',
                'category': 'Dermatological',
                'severity_indicators': ['spreading rapidly', 'fever with rash', 'difficulty breathing'],
                'related_conditions': ['allergic reaction', 'viral infection', 'bacterial infection', 'eczema'],
                'description': 'Skin irritation or eruption'
            },
            {
                'name': 'Loss of Appetite',
                'category': 'General',
                'severity_indicators': ['significant weight loss', 'persistent for weeks', 'severe fatigue'],
                'related_conditions': ['viral infection', 'depression', 'medication side effect', 'serious illness'],
                'description': 'Reduced desire to eat'
            }
        ]
        
        # Create symptoms
        created_count = 0
        for symptom_data in sample_symptoms:
            # Check if symptom already exists
            if not Symptom.objects(name=symptom_data['name']).first():
                symptom = Symptom(**symptom_data)
                symptom.save()
                created_count += 1
                print(f"✅ Created symptom: {symptom_data['name']}")
        
        print(f"✅ Created {created_count} symptoms")
        print(f"📊 Total symptoms in database: {Symptom.objects.count()}")
        
        # Create demo user if it doesn't exist
        print("🔄 Creating demo user...")
        demo_email = "demo@medai.com"
        if not UserProfile.objects(email=demo_email).first():
            demo_user = UserProfile(
                email=demo_email,
                first_name="Demo",
                last_name="User",
                age=30,
                gender="prefer_not_to_say"
            )
            demo_user.set_password("demo123456")
            demo_user.save()
            print("✅ Created demo user: demo@medai.com / demo123456")
        else:
            print("✅ Demo user already exists")
        
        print("🎉 Database initialization completed successfully!")
        
        # Display database statistics
        print("\n📊 Database Statistics:")
        print(f"   Users: {UserProfile.objects.count()}")
        print(f"   Symptoms: {Symptom.objects.count()}")
        print(f"   Categories: {len(set([s.category for s in Symptom.objects]))}")
        
        return True
        
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        return False

if __name__ == "__main__":
    initialize_database()
