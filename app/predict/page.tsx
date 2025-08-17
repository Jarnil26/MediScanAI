"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle, Pill, FileText, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

const COMMON_SYMPTOMS = [
  "Fever", "Headache", "Cough", "Sore throat", "Fatigue",
  "Nausea", "Vomiting", "Diarrhea", "Abdominal pain", "Chest pain",
  "Shortness of breath", "Dizziness", "Muscle aches", "Joint pain", "Rash", "Loss of appetite"
]

interface Disease {
  name: string
  probability: number
  description: string
}

interface Medication {
  name: string
  dosage: string
  instructions: string
}

interface PredictionResult {
  diseases: Disease[]
  medications: Medication[]
  recommendations: string[]
  urgency: "low" | "medium" | "high"
}

export default function PredictPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [error, setError] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    setIsAuthenticated(!!token)
  }, [])

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms((prev) => (
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    ))
  }

  const handlePredict = async () => {
    if (selectedSymptoms.length === 0) {
      setError("Please select at least one symptom")
      return
    }

    const token = localStorage.getItem("access_token")
    if (!token) {
      setError("Please log in to use the prediction feature")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          symptoms: selectedSymptoms,
          additionalInfo,
        }),
      })

      if (response.status === 401) {
        setError("Session expired. Please log in again.")
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        localStorage.removeItem("user")
        return
      }

      if (!response.ok) {
        throw new Error("Failed to get prediction")
      }

      const result = await response.json()
      // Remap API result field 'predicted_diseases' => 'diseases' for consistent frontend usage
      setPrediction({
        diseases: result.diseases ?? result.predicted_diseases ?? [],
        medications: result.medications ?? [],
        recommendations: result.recommendations ?? [],
        urgency: result.urgency ?? "low"
      })
    } catch (err) {
      setError("Failed to get AI prediction. Please try again.")
      console.error("Prediction error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-green-100 text-green-800 border-green-200"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Medical Prediction</h1>
          <p className="text-gray-600">
            Select your symptoms and get AI-powered disease predictions and treatment recommendations.
          </p>
        </div>

        {!isAuthenticated && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please{" "}
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium">
                sign in
              </Link>{" "}
              to use the AI prediction feature.
            </AlertDescription>
          </Alert>
        )}

        {!prediction ? (
          <div className="space-y-6">
            {/* Symptom Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Your Symptoms</CardTitle>
                <CardDescription>Choose all symptoms you are currently experiencing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {COMMON_SYMPTOMS.map((symptom) => (
                    <div key={symptom} className="flex items-center space-x-2">
                      <Checkbox
                        id={symptom}
                        checked={selectedSymptoms.includes(symptom)}
                        onCheckedChange={() => handleSymptomToggle(symptom)}
                      />
                      <label
                        htmlFor={symptom}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {symptom}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>Provide any additional details about your symptoms (optional)</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Describe when symptoms started, severity, any triggers, etc."
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>

            {/* Selected Symptoms Summary */}
            {selectedSymptoms.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Selected Symptoms ({selectedSymptoms.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedSymptoms.map((symptom) => (
                      <Badge key={symptom} variant="secondary">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Predict Button */}
            <div className="flex justify-center">
              <Button
                onClick={handlePredict}
                disabled={isLoading || selectedSymptoms.length === 0 || !isAuthenticated}
                size="lg"
                className="px-8"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  "Get AI Prediction"
                )}
              </Button>
            </div>
          </div>
        ) : (
          // Prediction Results
          <div className="space-y-6">
            {/* Urgency Alert */}
            <Alert className={getUrgencyColor(prediction.urgency)}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Urgency Level: {prediction.urgency.toUpperCase()}</strong>
                {prediction.urgency === "high" && " - Seek immediate medical attention"}
                {prediction.urgency === "medium" && " - Consider consulting a healthcare provider"}
                {prediction.urgency === "low" && " - Monitor symptoms and rest"}
              </AlertDescription>
            </Alert>

            {/* Disease Predictions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Possible Conditions
                </CardTitle>
                <CardDescription>AI-predicted diseases based on your symptoms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prediction.diseases?.map((disease, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{disease.name}</h3>
                        <Badge variant="outline">{Math.round(disease.probability)}% match</Badge>
                      </div>
                      <p className="text-gray-600 text-sm">{disease.description}</p>
                      <div className="mt-2 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${disease.probability}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Medication Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Pill className="mr-2 h-5 w-5" />
                  Medication Suggestions
                </CardTitle>
                <CardDescription>AI-recommended treatments (consult a doctor before taking)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {prediction.medications?.map((med, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{med.name}</h4>
                          <p className="text-sm text-gray-600">{med.dosage}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mt-2">{med.instructions}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* General Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>General Recommendations</CardTitle>
                <CardDescription>Additional care suggestions from AI analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {prediction.recommendations?.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => {
                  setPrediction(null)
                  setSelectedSymptoms([])
                  setAdditionalInfo("")
                }}
                variant="outline"
              >
                New Prediction
              </Button>
              <Link href="/dashboard">
                <Button>View History</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
