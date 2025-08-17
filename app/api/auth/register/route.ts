import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Try Django backend first
    const DJANGO_API_URL = process.env.DJANGO_API_URL || "http://localhost:8000"

    try {
      const response = await fetch(`${DJANGO_API_URL}/api/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(5000), // 5 second timeout
      })

      const data = await response.json()

      if (response.ok) {
        return NextResponse.json(data)
      } else {
        return NextResponse.json(data, { status: response.status })
      }
    } catch (djangoError) {
      console.log("Django backend not available, using fallback registration")

      // Enhanced fallback registration for development/demo
      const userData = body

      // Comprehensive validation
      const errors: Record<string, string> = {}

      if (!userData.email) {
        errors.email = "Email is required"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
        errors.email = "Please enter a valid email address"
      }

      if (!userData.password) {
        errors.password = "Password is required"
      } else if (userData.password.length < 8) {
        errors.password = "Password must be at least 8 characters long"
      }

      if (!userData.password_confirm) {
        errors.password_confirm = "Password confirmation is required"
      } else if (userData.password !== userData.password_confirm) {
        errors.password_confirm = "Passwords do not match"
      }

      if (!userData.first_name) {
        errors.first_name = "First name is required"
      }

      if (!userData.last_name) {
        errors.last_name = "Last name is required"
      }

      // Age validation
      if (userData.age && (userData.age < 0 || userData.age > 150)) {
        errors.age = "Please enter a valid age between 0 and 150"
      }

      // Phone validation
      if (userData.phone_number && !/^\+?[\d\s\-$$$$]{10,}$/.test(userData.phone_number)) {
        errors.phone_number = "Please enter a valid phone number"
      }

      if (Object.keys(errors).length > 0) {
        return NextResponse.json(errors, { status: 400 })
      }

      // Check if email already exists (simulate with common emails)
      const existingEmails = ["demo@medai.com", "admin@medai.com", "test@medai.com", "john@medai.com", "jane@medai.com"]

      if (existingEmails.includes(userData.email.toLowerCase())) {
        return NextResponse.json({ email: "User with this email already exists" }, { status: 400 })
      }

      // Simulate successful registration
      const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      return NextResponse.json({
        message: "User registered successfully",
        user: {
          id: userId,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
        },
        tokens: {
          access: `access-token-${userId}`,
          refresh: `refresh-token-${userId}`,
        },
      })
    }
  } catch (error) {
    console.error("Registration API error:", error)
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 })
  }
}
