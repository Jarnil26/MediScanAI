import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get("authorization")

    // Try Django backend first
    const DJANGO_API_URL = process.env.DJANGO_API_URL || "http://localhost:8000"

    try {
      const response = await fetch(`${DJANGO_API_URL}/api/predictions/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader && { Authorization: authHeader }),
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
      })

      const data = await response.json()

      if (response.ok) {
        return NextResponse.json(data)
      } else {
        return NextResponse.json(data, { status: response.status })
      }
    } catch (djangoError) {
      console.log("Django backend not available, using enhanced symptom analysis")

      const { symptoms, additionalInfo } = body

      if (!symptoms || symptoms.length === 0) {
        return NextResponse.json({ error: "Symptoms are required" }, { status: 400 })
      }

      // Use Groq API if available
      const GROQ_API_KEY = process.env.GROQ_API_KEY
      if (GROQ_API_KEY) {
        try {
          console.log("🤖 Using Groq AI for symptom analysis...")
          const groqAnalysis = await analyzeWithGroq(symptoms, additionalInfo, GROQ_API_KEY)
          return NextResponse.json(groqAnalysis)
        } catch (groqError) {
          console.log("❌ Groq API failed")
        }
      }

      // Enhanced local symptom analysis
      console.log("🧠 Using enhanced local symptom analysis...")
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const intelligentPrediction = generateIntelligentPrediction(symptoms, additionalInfo)
      return NextResponse.json(intelligentPrediction)
    }
  } catch (error) {
    console.error("Prediction API error:", error)
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 })
  }
}

async function analyzeWithGroq(symptoms: string[], additionalInfo: string, apiKey: string) {
  const prompt = `
You are an expert medical AI analyzing symptoms to predict possible diseases.

Patient Symptoms: ${symptoms.join(", ")}
Additional Information: ${additionalInfo}

Analyze these specific symptoms and provide accurate disease predictions. Do NOT default to common cold unless respiratory symptoms are present.

Provide response in JSON format:
{
  "diseases": [
    {
      "name": "Disease Name",
      "probability": 85,
      "description": "Medical description"
    }
  ],
  "medications": [
    {
      "name": "Medication",
      "dosage": "Dosage info",
      "instructions": "Instructions"
    }
  ],
  "recommendations": ["recommendation1", "recommendation2"],
  "urgency": "low|medium|high",
  "confidence_score": 85
}

IMPORTANT GUIDELINES:
- Match diseases to actual symptoms presented
- If chest pain + shortness of breath → consider cardiac/anxiety
- If nausea + vomiting + diarrhea → consider GI conditions
- If headache + dizziness → consider neurological
- If joint pain + muscle aches → consider musculoskeletal
- If rash + fever → consider infectious/allergic
- Only suggest common cold if respiratory symptoms present
- Be specific and accurate based on symptom combination
`

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content:
            "You are a medical AI assistant specializing in symptom analysis. Provide accurate disease predictions based on specific symptom combinations, not generic responses.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 1000,
    }),
  })

  if (response.ok) {
    const result = await response.json()
    const content = result.choices[0].message.content

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (parseError) {
      console.log("Failed to parse Groq response")
    }
  }

  throw new Error("Groq API failed")
}

function generateIntelligentPrediction(symptoms: string[], additionalInfo: string) {
  console.log(`🔍 Analyzing symptoms: ${symptoms.join(", ")}`)

  // Convert symptoms to lowercase for matching
  const symptomSet = new Set(symptoms.map((s) => s.toLowerCase()))

  // Analyze symptom patterns
  const analysis = analyzeSymptomPatterns(symptomSet, additionalInfo)

  console.log(`📋 Detected patterns:`, analysis.patterns)
  console.log(`🎯 Top condition: ${analysis.topCondition}`)

  return analysis.prediction
}

function analyzeSymptomPatterns(symptomSet: Set<string>, additionalInfo: string) {
  const info = additionalInfo.toLowerCase()

  // Define symptom categories and their associated conditions
  const symptomPatterns = {
    // Cardiovascular
    cardiac: {
      symptoms: ["chest pain", "shortness of breath", "rapid heartbeat", "dizziness", "fatigue"],
      conditions: [
        {
          name: "Anxiety/Panic Attack",
          probability: 78,
          description:
            "Anxiety disorder causing physical symptoms including chest discomfort and breathing difficulties",
          urgency: "medium",
          medications: [
            {
              name: "Deep Breathing Exercises",
              dosage: "As needed",
              instructions: "Practice slow, controlled breathing",
            },
            {
              name: "Lorazepam (if prescribed)",
              dosage: "0.5-1mg",
              instructions: "Only if prescribed by doctor for anxiety",
            },
          ],
          recommendations: [
            "Practice relaxation techniques and deep breathing",
            "Avoid caffeine and stimulants",
            "Consider counseling or therapy for anxiety management",
            "Seek immediate care if chest pain is severe or persistent",
          ],
        },
        {
          name: "Heart Palpitations",
          probability: 65,
          description: "Irregular or rapid heartbeat, often benign but requires evaluation",
          urgency: "medium",
        },
      ],
    },

    // Gastrointestinal
    gastrointestinal: {
      symptoms: ["nausea", "vomiting", "diarrhea", "abdominal pain", "loss of appetite"],
      conditions: [
        {
          name: "Gastroenteritis",
          probability: 89,
          description: "Stomach flu causing inflammation of the digestive tract",
          urgency: "medium",
          medications: [
            { name: "Oral Rehydration Solution", dosage: "As needed", instructions: "Drink small amounts frequently" },
            {
              name: "Loperamide",
              dosage: "2mg after each loose stool",
              instructions: "For diarrhea control, max 8mg/day",
            },
            { name: "Ondansetron", dosage: "4mg every 8 hours", instructions: "For nausea relief if prescribed" },
          ],
          recommendations: [
            "Stay hydrated with clear fluids and electrolyte solutions",
            "Follow BRAT diet (Bananas, Rice, Applesauce, Toast)",
            "Rest and avoid solid foods initially",
            "Seek medical attention if symptoms persist >48 hours or signs of dehydration",
          ],
        },
        {
          name: "Food Poisoning",
          probability: 76,
          description: "Illness caused by contaminated food or beverages",
          urgency: "medium",
        },
      ],
    },

    // Neurological
    neurological: {
      symptoms: ["headache", "dizziness", "fatigue"],
      conditions: [
        {
          name: "Tension Headache",
          probability: 82,
          description: "Most common type of headache caused by muscle tension and stress",
          urgency: "low",
          medications: [
            { name: "Ibuprofen", dosage: "400mg every 6-8 hours", instructions: "Take with food, max 1200mg/day" },
            { name: "Acetaminophen", dosage: "500mg every 6 hours", instructions: "Max 3000mg/day" },
          ],
          recommendations: [
            "Apply cold or warm compress to head and neck",
            "Practice stress management and relaxation techniques",
            "Maintain regular sleep schedule",
            "Stay hydrated and avoid known triggers",
          ],
        },
        {
          name: "Migraine",
          probability: 68,
          description: "Severe headache often accompanied by nausea and light sensitivity",
          urgency: "medium",
        },
      ],
    },

    // Respiratory (for actual cold/flu)
    respiratory: {
      symptoms: ["fever", "cough", "sore throat", "runny nose", "congestion"],
      conditions: [
        {
          name: "Common Cold",
          probability: 87,
          description: "Viral upper respiratory infection with typical cold symptoms",
          urgency: "low",
          medications: [
            { name: "Acetaminophen", dosage: "500mg every 6 hours", instructions: "For fever and aches" },
            { name: "Throat Lozenges", dosage: "As needed", instructions: "For sore throat relief" },
            { name: "Decongestant", dosage: "As directed", instructions: "For nasal congestion" },
          ],
          recommendations: [
            "Get plenty of rest and stay hydrated",
            "Use humidifier or breathe steam",
            "Gargle with warm salt water for sore throat",
            "Avoid contact with others to prevent spread",
          ],
        },
      ],
    },

    // Musculoskeletal
    musculoskeletal: {
      symptoms: ["muscle aches", "joint pain", "fatigue"],
      conditions: [
        {
          name: "Muscle Strain/Overuse",
          probability: 84,
          description: "Muscle pain and stiffness from physical activity or poor posture",
          urgency: "low",
          medications: [
            { name: "Ibuprofen", dosage: "400mg every 8 hours", instructions: "Anti-inflammatory for muscle pain" },
            {
              name: "Topical Pain Relief",
              dosage: "Apply 3-4 times daily",
              instructions: "Menthol or capsaicin cream",
            },
          ],
          recommendations: [
            "Rest affected muscles and avoid overexertion",
            "Apply ice for acute injuries, heat for chronic pain",
            "Gentle stretching and light movement",
            "Consider physical therapy if pain persists",
          ],
        },
      ],
    },

    // Dermatological
    dermatological: {
      symptoms: ["rash"],
      conditions: [
        {
          name: "Allergic Reaction",
          probability: 79,
          description: "Skin reaction to allergens causing rash and possible itching",
          urgency: "medium",
          medications: [
            { name: "Antihistamine (Benadryl)", dosage: "25mg every 6 hours", instructions: "For allergic reactions" },
            { name: "Hydrocortisone Cream", dosage: "Apply twice daily", instructions: "Topical steroid for rash" },
          ],
          recommendations: [
            "Identify and avoid potential allergens",
            "Keep skin clean and moisturized",
            "Avoid scratching to prevent infection",
            "Seek immediate care if breathing difficulties occur",
          ],
        },
      ],
    },
  }

  // Find matching patterns
  const matches = []

  for (const [category, pattern] of Object.entries(symptomPatterns)) {
    const matchCount = pattern.symptoms.filter((symptom) => symptomSet.has(symptom)).length
    const matchPercentage = (matchCount / pattern.symptoms.length) * 100

    if (matchCount > 0) {
      matches.push({
        category,
        matchCount,
        matchPercentage,
        conditions: pattern.conditions,
      })
    }
  }

  // Sort by match strength
  matches.sort((a, b) => b.matchPercentage - a.matchPercentage)

  console.log(
    `🔍 Pattern matches:`,
    matches.map((m) => `${m.category}: ${m.matchCount}/${m.matchPercentage.toFixed(1)}%`),
  )

  // If no good matches, provide general analysis
  if (matches.length === 0 || matches[0].matchPercentage < 20) {
    return {
      patterns: ["general"],
      topCondition: "General Symptoms",
      prediction: generateGeneralSymptomAnalysis(Array.from(symptomSet), additionalInfo),
    }
  }

  // Use the best matching pattern
  const bestMatch = matches[0]
  const topCondition = bestMatch.conditions[0]

  return {
    patterns: [bestMatch.category],
    topCondition: topCondition.name,
    prediction: {
      diseases: bestMatch.conditions.map((condition) => ({
        name: condition.name,
        probability: Math.max(condition.probability - (100 - bestMatch.matchPercentage), 60),
        description: condition.description,
      })),
      medications: topCondition.medications || [
        { name: "Symptomatic Treatment", dosage: "As needed", instructions: "Treat symptoms as they arise" },
      ],
      recommendations: topCondition.recommendations || [
        "Monitor symptoms closely",
        "Rest and stay hydrated",
        "Consult healthcare provider if symptoms worsen",
      ],
      urgency: topCondition.urgency || "low",
      confidence_score: Math.round(bestMatch.matchPercentage + 20),
    },
  }
}

function generateGeneralSymptomAnalysis(symptoms: string[], additionalInfo: string) {
  return {
    diseases: [
      {
        name: "Non-Specific Symptoms",
        probability: 65,
        description: "Combination of symptoms that may indicate various conditions requiring further evaluation",
      },
      {
        name: "Stress-Related Symptoms",
        probability: 55,
        description: "Physical symptoms that may be related to stress, anxiety, or lifestyle factors",
      },
      {
        name: "Viral Syndrome",
        probability: 45,
        description: "General viral infection with non-specific symptoms",
      },
    ],
    medications: [
      { name: "Symptomatic Relief", dosage: "As needed", instructions: "Treat individual symptoms appropriately" },
      { name: "Rest and Hydration", dosage: "Adequate amounts", instructions: "Support body's natural healing" },
    ],
    recommendations: [
      "Monitor symptoms and note any changes or patterns",
      "Ensure adequate rest, nutrition, and hydration",
      "Consider stress management if symptoms may be stress-related",
      "Consult healthcare provider for proper evaluation and diagnosis",
      "Keep a symptom diary to help identify triggers or patterns",
    ],
    urgency: "low",
    confidence_score: 70,
  }
}
