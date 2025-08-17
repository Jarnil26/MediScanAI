"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Code, Database, Brain, Cloud, Shield, Zap } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">About MedAI Platform</h1>
          <p className="text-gray-600">Learn about our AI-powered medical prediction system and its architecture.</p>
        </div>

        {/* Architecture Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>System Architecture</CardTitle>
            <CardDescription>Full-stack medical AI platform built with modern technologies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Code className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">Frontend (React)</h3>
                    <p className="text-sm text-gray-600">
                      Modern React application with Next.js, TypeScript, and Tailwind CSS for responsive UI
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge variant="outline">React</Badge>
                      <Badge variant="outline">Next.js</Badge>
                      <Badge variant="outline">TypeScript</Badge>
                      <Badge variant="outline">Tailwind</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Database className="h-6 w-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">Backend (Django)</h3>
                    <p className="text-sm text-gray-600">
                      Django REST Framework with MongoDB integration for scalable API endpoints
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge variant="outline">Django</Badge>
                      <Badge variant="outline">DRF</Badge>
                      <Badge variant="outline">MongoDB</Badge>
                      <Badge variant="outline">Mongoengine</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Brain className="h-6 w-6 text-purple-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">AI Engine (Groq)</h3>
                    <p className="text-sm text-gray-600">
                      Groq API integration with LLaMA 3 and Mixtral models for medical predictions
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge variant="outline">Groq API</Badge>
                      <Badge variant="outline">LLaMA 3</Badge>
                      <Badge variant="outline">Mixtral</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Cloud className="h-6 w-6 text-orange-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">Deployment</h3>
                    <p className="text-sm text-gray-600">
                      Containerized with Docker, deployed on AWS/Render with MongoDB Atlas
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge variant="outline">Docker</Badge>
                      <Badge variant="outline">AWS</Badge>
                      <Badge variant="outline">Vercel</Badge>
                      <Badge variant="outline">Atlas</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Features */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
            <CardDescription>Advanced capabilities of our medical AI platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Zap className="h-5 w-5 text-yellow-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Real-time AI Analysis</h4>
                    <p className="text-sm text-gray-600">
                      Instant symptom analysis without background queues using synchronous Django views
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Brain className="h-5 w-5 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Intelligent Predictions</h4>
                    <p className="text-sm text-gray-600">
                      Advanced disease prediction using Groq's LLM models with dynamic prompt generation
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Database className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Comprehensive Storage</h4>
                    <p className="text-sm text-gray-600">
                      MongoDB stores user data, symptom histories, and prediction records with full CRUD operations
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Secure Authentication</h4>
                    <p className="text-sm text-gray-600">
                      Django-based user authentication with secure session management and data protection
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Code className="h-5 w-5 text-indigo-600 mt-1" />
                  <div>
                    <h4 className="font-medium">RESTful API</h4>
                    <p className="text-sm text-gray-600">
                      Clean REST endpoints for symptom submission, prediction retrieval, and history management
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Cloud className="h-5 w-5 text-orange-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Scalable Infrastructure</h4>
                    <p className="text-sm text-gray-600">
                      Cloud-native deployment with Docker containers and MongoDB Atlas for global scalability
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Implementation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Technical Implementation</CardTitle>
            <CardDescription>How the AI medical prediction system works</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Data Flow Architecture</h3>
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-center">
                      <div className="bg-blue-500 text-white px-3 py-2 rounded">React Frontend</div>
                      <p className="mt-1 text-xs">Symptom Input</p>
                    </div>
                    <div className="text-gray-400">→</div>
                    <div className="text-center">
                      <div className="bg-green-500 text-white px-3 py-2 rounded">Django API</div>
                      <p className="mt-1 text-xs">REST Endpoints</p>
                    </div>
                    <div className="text-gray-400">→</div>
                    <div className="text-center">
                      <div className="bg-purple-500 text-white px-3 py-2 rounded">Groq AI</div>
                      <p className="mt-1 text-xs">LLM Processing</p>
                    </div>
                    <div className="text-gray-400">→</div>
                    <div className="text-center">
                      <div className="bg-orange-500 text-white px-3 py-2 rounded">MongoDB</div>
                      <p className="mt-1 text-xs">Data Storage</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">AI Processing Pipeline</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>User selects symptoms through React interface</li>
                  <li>Frontend sends POST request to Django REST API</li>
                  <li>Django processes input and generates dynamic prompts</li>
                  <li>Groq API analyzes symptoms using LLaMA 3/Mixtral models</li>
                  <li>AI response parsed for diseases, medications, and recommendations</li>
                  <li>Results stored in MongoDB and returned to frontend</li>
                  <li>React displays predictions with confidence scores and urgency levels</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <Link href="/predict">
            <Button size="lg" className="px-8">
              Try AI Prediction Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
