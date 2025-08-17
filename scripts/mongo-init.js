// MongoDB initialization script for Medical AI Platform
// This script runs when MongoDB container starts for the first time

// Declare the db variable
const db = db.getSiblingDB("medai_db")

// Create collections with validation schemas
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "password_hash", "first_name", "last_name"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$",
        },
        password_hash: { bsonType: "string" },
        first_name: { bsonType: "string" },
        last_name: { bsonType: "string" },
        date_joined: { bsonType: "date" },
        is_active: { bsonType: "bool" },
        profile: {
          bsonType: "object",
          properties: {
            age: { bsonType: "int", minimum: 0, maximum: 150 },
            gender: { enum: ["male", "female", "other", "prefer_not_to_say"] },
            medical_history: { bsonType: "array", items: { bsonType: "string" } },
          },
        },
      },
    },
  },
})

db.createCollection("predictions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "symptoms", "predicted_diseases", "created_at"],
      properties: {
        user_id: { bsonType: "objectId" },
        symptoms: { bsonType: "array", items: { bsonType: "string" } },
        additional_info: { bsonType: "string" },
        predicted_diseases: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["name", "probability"],
            properties: {
              name: { bsonType: "string" },
              probability: { bsonType: "double", minimum: 0, maximum: 100 },
              description: { bsonType: "string" },
            },
          },
        },
        medications: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              name: { bsonType: "string" },
              dosage: { bsonType: "string" },
              instructions: { bsonType: "string" },
            },
          },
        },
        recommendations: { bsonType: "array", items: { bsonType: "string" } },
        urgency: { enum: ["low", "medium", "high"] },
        created_at: { bsonType: "date" },
        ai_model_used: { bsonType: "string" },
        confidence_score: { bsonType: "double", minimum: 0, maximum: 100 },
      },
    },
  },
})

db.createCollection("symptoms", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "category"],
      properties: {
        name: { bsonType: "string" },
        category: { bsonType: "string" },
        severity_indicators: { bsonType: "array", items: { bsonType: "string" } },
        related_conditions: { bsonType: "array", items: { bsonType: "string" } },
      },
    },
  },
})

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ date_joined: -1 })

db.predictions.createIndex({ user_id: 1, created_at: -1 })
db.predictions.createIndex({ symptoms: 1 })
db.predictions.createIndex({ created_at: -1 })
db.predictions.createIndex({ urgency: 1 })

db.symptoms.createIndex({ name: 1 }, { unique: true })
db.symptoms.createIndex({ category: 1 })

// Insert sample symptoms data
db.symptoms.insertMany([
  {
    name: "Fever",
    category: "General",
    severity_indicators: ["high temperature above 101°F", "chills", "sweating"],
    related_conditions: ["infection", "inflammation", "immune response"],
  },
  {
    name: "Headache",
    category: "Neurological",
    severity_indicators: ["severe pain", "vision changes", "neck stiffness"],
    related_conditions: ["tension", "migraine", "cluster headache", "sinus"],
  },
  {
    name: "Cough",
    category: "Respiratory",
    severity_indicators: ["blood in sputum", "persistent for weeks", "difficulty breathing"],
    related_conditions: ["cold", "bronchitis", "pneumonia", "asthma"],
  },
  {
    name: "Chest Pain",
    category: "Cardiovascular",
    severity_indicators: ["crushing pain", "radiating to arm", "shortness of breath"],
    related_conditions: ["heart attack", "angina", "anxiety", "muscle strain"],
  },
  {
    name: "Nausea",
    category: "Gastrointestinal",
    severity_indicators: ["persistent vomiting", "dehydration", "blood in vomit"],
    related_conditions: ["gastroenteritis", "food poisoning", "pregnancy", "medication side effect"],
  },
  {
    name: "Fatigue",
    category: "General",
    severity_indicators: ["extreme exhaustion", "inability to perform daily tasks"],
    related_conditions: ["viral infection", "anemia", "depression", "sleep disorders"],
  },
  {
    name: "Shortness of Breath",
    category: "Respiratory",
    severity_indicators: ["at rest", "blue lips or fingernails", "chest tightness"],
    related_conditions: ["asthma", "heart failure", "anxiety", "pneumonia"],
  },
  {
    name: "Dizziness",
    category: "Neurological",
    severity_indicators: ["fainting", "loss of balance", "hearing changes"],
    related_conditions: ["inner ear problems", "low blood pressure", "dehydration"],
  },
])

print("MongoDB initialization completed successfully!")
print("Created collections: users, predictions, symptoms")
print("Created indexes for optimal performance")
print("Inserted sample symptoms data")
