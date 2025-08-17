"""
Check database status and collections
"""
import mongoengine
from pymongo import MongoClient

def check_database_status():
    """Check the current status of the database"""
    try:
        # Your MongoDB Atlas URL
        MONGODB_URL = "mongodb+srv://jarnilp:jarnil12@medaidb.mvzuq1o.mongodb.net/?retryWrites=true&w=majority&appName=Medaidb"
        
        print("🔄 Connecting to MongoDB Atlas...")
        
        # Connect using pymongo for admin operations
        client = MongoClient(MONGODB_URL)
        
        # Get database (will use default database from connection string)
        db = client.get_default_database()
        
        print(f"✅ Connected to database: {db.name}")
        
        # List all collections
        collections = db.list_collection_names()
        print(f"📁 Collections found: {len(collections)}")
        
        for collection_name in collections:
            collection = db[collection_name]
            count = collection.count_documents({})
            print(f"   📄 {collection_name}: {count} documents")
            
            # Show sample document if exists
            if count > 0:
                sample = collection.find_one()
                if sample:
                    # Remove _id for cleaner display
                    sample.pop('_id', None)
                    print(f"      Sample: {str(sample)[:100]}...")
        
        if not collections:
            print("📭 No collections found. Database is empty.")
            print("💡 Run 'python initialize_database.py' to create sample data")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ Database check failed: {e}")
        return False

if __name__ == "__main__":
    check_database_status()
