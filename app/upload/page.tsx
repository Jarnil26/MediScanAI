"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileText,
  ImageIcon,
  X,
  Loader2,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Camera,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface UploadedFile {
  file: File;
  preview?: string;
  type: string;
  id: string;
}

interface AnalysisResult {
  reportType: string;
  findings: Array<{
    category: string;
    finding: string;
    severity: "normal" | "abnormal" | "critical";
    description: string;
  }>;
  recommendations: string[];
  urgency: "low" | "medium" | "high";
  summary: string;
  confidence: number;
  reportId?: string;
  savedToHistory?: boolean;
}

const REPORT_TYPES = [
  { value: "blood_test", label: "Blood Test / Lab Results" },
  { value: "xray", label: "X-Ray" },
  { value: "mri", label: "MRI Scan" },
  { value: "ct_scan", label: "CT Scan" },
  { value: "ultrasound", label: "Ultrasound" },
  { value: "ecg", label: "ECG/EKG" },
  { value: "prescription", label: "Prescription" },
  { value: "pathology", label: "Pathology Report" },
  { value: "other", label: "Other Medical Document" },
];

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [reportType, setReportType] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsAuthenticated(!!token);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => {
      const fileType = file.type.startsWith("image/") ? "image" : "document";
      const id = Math.random().toString(36).substr(2, 9);

      const uploadedFile: UploadedFile = {
        file,
        type: fileType,
        id,
      };

      // Create preview for images
      if (fileType === "image") {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === id ? { ...f, preview: e.target?.result as string } : f
            )
          );
        };
        reader.readAsDataURL(file);
      }

      return uploadedFile;
    });

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    onDrop(selectedFiles);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setError("Please upload at least one medical report");
      return;
    }

    if (!reportType) {
      setError("Please select the type of medical report");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Please log in to analyze medical reports");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Prepare form data
      const formData = new FormData();
      files.forEach((fileObj, index) => {
        formData.append(`file_${index}`, fileObj.file);
      });
      formData.append("report_type", reportType);
      formData.append("additional_notes", additionalNotes);

      const response = await fetch(
        "http://localhost:8000/api/reports/analyze/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.status === 401) {
        setError("Session expired. Please log in again.");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to analyze report");
      }

      const result = await response.json();
      setAnalysisResult(result);

      // ✅ Save to localStorage for dashboard stats
      const newReport = {
        id: result.reportId || crypto.randomUUID(),
        date: new Date().toISOString(), // for fallback
        createdAt: new Date().toISOString(), // required for lastActivity
        reportType: result.reportType,
        fileName: files.map((f) => f.file.name).join(", "),
        urgency: result.urgency,
        confidence: Number(result.confidence) || 0, // ensure numeric
        fileCount: files.length,
      };

      const existingReports = JSON.parse(
        localStorage.getItem("user_reports") || "[]"
      );
      const updatedReports = [newReport, ...existingReports];
      localStorage.setItem("user_reports", JSON.stringify(updatedReports));

      // 🆕 Show success message if saved to history
      if (result.savedToHistory) {
        console.log("✅ Report analysis saved to dashboard history");
      }
    } catch (err) {
      setError("Failed to analyze medical report. Please try again.");
      console.error("Analysis error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "abnormal":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <Stethoscope className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Medical Report Analysis
            </h1>
          </div>
          <p className="text-gray-600">
            Upload your medical reports, lab results, or imaging studies for
            AI-powered analysis and insights.
          </p>
        </div>

        {!isAuthenticated && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please{" "}
              <Link
                href="/auth/login"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                sign in
              </Link>{" "}
              to analyze medical reports.
            </AlertDescription>
          </Alert>
        )}

        {!analysisResult ? (
          <div className="space-y-6">
            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Medical Reports</CardTitle>
                <CardDescription>
                  Supported formats: PDF, JPG, PNG, DOCX. Maximum file size:
                  10MB per file.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Drag and Drop Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <Upload className="h-12 w-12 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-900">
                          Drop files here or click to browse
                        </p>
                        <p className="text-sm text-gray-500">
                          Upload lab results, X-rays, prescriptions, or other
                          medical documents
                        </p>
                      </div>
                      <Input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.docx,.doc"
                        onChange={handleFileInput}
                        className="hidden"
                        id="file-upload"
                      />
                      <Label htmlFor="file-upload">
                        <Button
                          variant="outline"
                          className="cursor-pointer bg-transparent"
                          asChild
                        >
                          <span>
                            <Camera className="mr-2 h-4 w-4" />
                            Choose Files
                          </span>
                        </Button>
                      </Label>
                    </div>
                  </div>

                  {/* Uploaded Files */}
                  {files.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-medium">
                        Uploaded Files ({files.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {files.map((fileObj) => (
                          <div
                            key={fileObj.id}
                            className="border rounded-lg p-4 bg-white"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  {fileObj.type === "image" ? (
                                    fileObj.preview ? (
                                      <img
                                        src={
                                          fileObj.preview || "/placeholder.svg"
                                        }
                                        alt="Preview"
                                        className="w-12 h-12 object-cover rounded"
                                      />
                                    ) : (
                                      <ImageIcon className="h-12 w-12 text-gray-400" />
                                    )
                                  ) : (
                                    <FileText className="h-12 w-12 text-gray-400" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {fileObj.file.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {(fileObj.file.size / 1024 / 1024).toFixed(
                                      2
                                    )}{" "}
                                    MB
                                  </p>
                                  <Badge variant="outline" className="mt-1">
                                    {fileObj.type === "image"
                                      ? "Image"
                                      : "Document"}
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(fileObj.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Report Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Report Information</CardTitle>
                <CardDescription>
                  Help us understand your medical report for better analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="report-type">Type of Medical Report *</Label>
                  <Select onValueChange={setReportType} value={reportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the type of medical report" />
                    </SelectTrigger>
                    <SelectContent>
                      {REPORT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additional-notes">
                    Additional Notes (Optional)
                  </Label>
                  <Textarea
                    id="additional-notes"
                    placeholder="Any specific concerns, symptoms, or context about these reports..."
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Upload Progress */}
            {isAnalyzing && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Analyzing medical report...
                      </span>
                      <span className="text-sm text-gray-500">
                        {uploadProgress}%
                      </span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>AI is processing your medical data...</span>
                    </div>
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

            {/* Analyze Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleAnalyze}
                disabled={
                  isAnalyzing ||
                  files.length === 0 ||
                  !reportType ||
                  !isAuthenticated
                }
                size="lg"
                className="px-8"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Report...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Analyze Medical Report
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Analysis Results */
          <div className="space-y-6">
            {/* Success Message */}
            {analysisResult.savedToHistory && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  ✅ Analysis complete! Your report has been saved to your
                  dashboard history.
                </AlertDescription>
              </Alert>
            )}

            {/* Urgency Alert */}
            <Alert className={getUrgencyColor(analysisResult.urgency)}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>
                  Analysis Complete - Urgency Level:{" "}
                  {analysisResult.urgency.toUpperCase()}
                </strong>
                {analysisResult.urgency === "high" &&
                  " - Consult your healthcare provider immediately"}
                {analysisResult.urgency === "medium" &&
                  " - Schedule an appointment with your doctor"}
                {analysisResult.urgency === "low" &&
                  " - Results appear normal, continue routine care"}
              </AlertDescription>
            </Alert>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Analysis Summary</span>
                  <Badge variant="outline">
                    {analysisResult.confidence}% confidence
                  </Badge>
                </CardTitle>
                <CardDescription>
                  AI analysis of your {analysisResult.reportType} report
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{analysisResult.summary}</p>
              </CardContent>
            </Card>

            {/* Detailed Findings */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Findings</CardTitle>
                <CardDescription>
                  Specific observations from your medical report
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisResult.findings.map((finding, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{finding.category}</h4>
                          <p className="text-sm text-gray-600">
                            {finding.finding}
                          </p>
                        </div>
                        <Badge variant={getSeverityColor(finding.severity)}>
                          {finding.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mt-2">
                        {finding.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>
                  Suggested next steps based on your report analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysisResult.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Disclaimer</CardTitle>
                <CardDescription className="text-red-600">
                  The predictions from our AI model are not guaranteed to be
                  100% accurate. Please consult a medical professional before
                  making health decisions.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => {
                  setAnalysisResult(null);
                  setFiles([]);
                  setReportType("");
                  setAdditionalNotes("");
                  setUploadProgress(0);
                }}
                variant="outline"
              >
                Analyze Another Report
              </Button>
              <Link href="/dashboard">
                <Button>View Dashboard</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
