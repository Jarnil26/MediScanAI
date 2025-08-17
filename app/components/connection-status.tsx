"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Wifi, Server } from "lucide-react"

export function ConnectionStatus() {
  const [status, setStatus] = useState({
    frontend: true,
    backend: false,
    database: false,
  })

  useEffect(() => {
    checkConnections()
    const interval = setInterval(checkConnections, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

const checkConnections = async () => {
  try {
    const backendResponse = await fetch("/health");
    setStatus((prev) => ({
      ...prev,
      backend: backendResponse.ok,
    }));
  } catch (error) {
    setStatus((prev) => ({
      ...prev,
      backend: false,
    }));
  }
};



  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Alert className="w-auto bg-white border shadow-lg">
        <Server className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Wifi className="h-3 w-3" />
              <span className="text-xs">Frontend</span>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                Online
              </Badge>
            </div>
            <div className="flex items-center space-x-1">
              <Server className="h-3 w-3" />
              <span className="text-xs">Backend</span>
              <Badge
                variant="outline"
                className={
                  status.backend
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-yellow-100 text-yellow-800 border-yellow-200"
                }
              >
                {status.backend ? "Django" : "Fallback"}
              </Badge>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
