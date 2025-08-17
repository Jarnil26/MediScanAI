"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Stethoscope, Brain, Database, Zap } from "lucide-react"
import Link from "next/link"
import { DemoBanner } from "./components/demo-banner"

export default function HomePage() {
  const [stats, setStats] = useState({
    totalPredictions: 0,
    activeUsers: 0,
    accuracy: 0,
  })

  useEffect(() => {
    // Simulate loading stats
    setStats({
      totalPredictions: 1247,
      activeUsers: 89,
      accuracy: 94.2,
    })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">MedAI Platform</h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/auth/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <DemoBanner />

        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">AI-Powered Medical Prediction Platform</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Advanced symptom analysis using Django, React, MongoDB, and Groq AI integration for intelligent disease
            prediction and treatment recommendations.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/auth/register">
              <Button size="lg" className="px-8">
                <Brain className="mr-2 h-5 w-5" />
                Start Free Trial
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="px-8 bg-transparent">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPredictions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">+5% from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Accuracy</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.accuracy}%</div>
              <p className="text-xs text-muted-foreground">Powered by Groq AI</p>
            </CardContent>
          </Card>
        </div>

        {/* Architecture Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Technology Stack</CardTitle>
              <CardDescription>Full-stack architecture with modern technologies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Badge variant="secondary">Frontend</Badge>
                <span className="text-sm">React with Next.js, Tailwind CSS</span>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="secondary">Backend</Badge>
                <span className="text-sm">Django REST Framework</span>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="secondary">Database</Badge>
                <span className="text-sm">MongoDB Atlas</span>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="secondary">AI Engine</Badge>
                <span className="text-sm">Groq API (LLaMA 3, Mixtral)</span>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="secondary">Deployment</Badge>
                <span className="text-sm">Docker, AWS/Render, Vercel</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Features</CardTitle>
              <CardDescription>Advanced medical AI capabilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Intelligent Symptom Analysis</p>
                  <p className="text-sm text-gray-600">AI-powered disease prediction from symptoms</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Treatment Recommendations</p>
                  <p className="text-sm text-gray-600">Personalized medication and care suggestions</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Medical History Tracking</p>
                  <p className="text-sm text-gray-600">Comprehensive patient data management</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Real-time Predictions</p>
                  <p className="text-sm text-gray-600">Instant AI analysis without queues</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
