"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Info, Server, Database } from "lucide-react"

export function DemoBanner() {
  return (
    <Alert className="bg-blue-50 border-blue-200 mb-6">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <div>
            <strong className="text-blue-800">Demo Mode Active</strong>
            <p className="text-blue-700 text-sm mt-1">
              All features are working with local storage. Django backend is not required.
            </p>
          </div>
          <div className="flex space-x-2">
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
              <Server className="h-3 w-3 mr-1" />
              Fallback
            </Badge>
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
              <Database className="h-3 w-3 mr-1" />
              Local
            </Badge>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
