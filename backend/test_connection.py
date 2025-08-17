"""
Test MongoDB Atlas connection
Run this script to verify your database connection
"""
import mongoengine
import os
from decouple import config

def test_mongodb_connection():
    """Test MongoDB Atlas connection"""
    try:
        # Your MongoDB Atlas URL
        MONGODB_URL = "mongodb+srv://jarnilp:jarnil12@medaidb.mvzuq1o.mongodb.net/?retryWrites=true&w=majority&appName=Medaidb"
        
        print("🔄 Connecting to MongoDB Atlas...")
        print(f"Database: {MONGODB_URL.split('/')[-1].split('?')[0] or 'default'}")
        
        # Connect to MongoDB
        mongoengine.connect(host=MONGODB_URL)
        
        # Test the connection by creating a simple document
        from mongoengine import Document, StringField
        
        class TestConnection(Document):
            message = StringField()
            meta = {'collection': 'connection_test'}
        
        # Create and save a test document
        test_doc = TestConnection(message="Connection successful!")
        test_doc.save()
        
        # Retrieve the document
        retrieved = TestConnection.objects.first()
        
        if retrieved:
            print("✅ MongoDB Atlas connection successful!")
            print(f"✅ Test document created: {retrieved.message}")
            
            # Clean up test document
            retrieved.delete()
            print("✅ Test document cleaned up")
            
            return True
        else:
            print("❌ Could not retrieve test document")
            return False
            
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        return False

if __name__ == "__main__":
    test_mongodb_connection()
