import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    // Try Django backend first
    const DJANGO_API_URL = process.env.DJANGO_API_URL || "http://localhost:8000"

    try {
      const response = await fetch(`${DJANGO_API_URL}/api/predictions/history/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader && { Authorization: authHeader }),
        },
        signal: AbortSignal.timeout(5000),
      })

      const data = await response.json()

      if (response.ok) {
        return NextResponse.json(data)
      } else {
        return NextResponse.json(data, { status: response.status })
      }
    } catch (djangoError) {
      console.log("Django backend not available, using fallback history")

      // Fallback mock history
      const mockHistory = [
        {
          id: "1",
          symptoms: ["Fever", "Headache", "Fatigue"],
          top_disease: {
            name: "Common Cold",
            probability: 87,
          },
          urgency: "low",
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
          confidence_score: 87,
        },
        {
          id: "2",
          symptoms: ["Chest pain", "Shortness of breath"],
          top_disease: {
            name: "Anxiety",
            probability: 72,
          },
          urgency: "medium",
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
          confidence_score: 72,
        },
        {
          id: "3",
          symptoms: ["Nausea", "Vomiting", "Diarrhea"],
          top_disease: {
            name: "Gastroenteritis",
            probability: 91,
          },
          urgency: "medium",
          created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
          confidence_score: 91,
        },
      ]

      return NextResponse.json({ results: mockHistory })
    }
  } catch (error) {
    console.error("History API error:", error)
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 })
  }
}
