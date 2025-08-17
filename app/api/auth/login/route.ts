import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Try Django backend first
    const DJANGO_API_URL = process.env.DJANGO_API_URL || "http://localhost:8000"

    try {
      const response = await fetch(`${DJANGO_API_URL}/api/auth/login/`, {
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
      console.log("Django backend not available, using fallback authentication")

      // Fallback authentication for development/demo
      if (!email || !password) {
        return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
      }

      // Demo credentials
      if (email === "demo@medai.com" && password === "demo123456") {
        return NextResponse.json({
          message: "Login successful",
          user: {
            id: "demo-user-id",
            email: "demo@medai.com",
            first_name: "Demo",
            last_name: "User",
          },
          tokens: {
            access: "demo-access-token-" + Date.now(),
            refresh: "demo-refresh-token-" + Date.now(),
          },
        })
      }

      // Additional demo users for testing
      const demoUsers = [
        { email: "john@medai.com", password: "password123", name: "John Doe" },
        { email: "jane@medai.com", password: "password123", name: "Jane Smith" },
        { email: "test@medai.com", password: "test123", name: "Test User" },
      ]

      const demoUser = demoUsers.find((user) => user.email === email && user.password === password)
      if (demoUser) {
        const [firstName, lastName] = demoUser.name.split(" ")
        return NextResponse.json({
          message: "Login successful",
          user: {
            id: `demo-${email.split("@")[0]}`,
            email: demoUser.email,
            first_name: firstName,
            last_name: lastName || "",
          },
          tokens: {
            access: `demo-access-${Date.now()}`,
            refresh: `demo-refresh-${Date.now()}`,
          },
        })
      }

      return NextResponse.json({ error: "Invalid email or password" }, { status: 400 })
    }
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 })
  }
}
