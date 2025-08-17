"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  Activity,
  Upload,
  FileText,
  Plus,
  Clock,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PredictionHistory {
  id: string;
  date: string;
  symptoms: string[];
  topDisease: string;
  probability: number;
  urgency: "low" | "medium" | "high";
}

interface ReportHistory {
  id: string;
  date: string;
  reportType: string;
  fileName: string;
  urgency: "low" | "medium" | "high";
  confidence: number;
  fileCount?: number;
  createdAt: string;
}

export default function DashboardPage() {
  const [history, setHistory] = useState<PredictionHistory[]>([]);
  const [reportHistory, setReportHistory] = useState<ReportHistory[]>([]);
  const [stats, setStats] = useState({
    totalPredictions: 0,
    totalReports: 0,
    avgAccuracy: 0,
    lastActivity: "",
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  interface User {
    first_name?: string;
    [key: string]: any;
  }
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
      loadUserData(token);
    } else {
      router.push("/auth/login");
    }
  }, []);

  const loadUserData = async (token: string) => {
    try {
      // Load symptom predictions
      const response = await fetch("/api/predictions/history", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data.results || data);
      }

      // 🆕 Load report history from localStorage
      loadReportHistory();
    } catch (error) {
      console.error("Failed to load user data:", error);
      // Still load report history even if API fails
      loadReportHistory();
    }
  };

  const loadReportHistory = () => {
    try {
      const savedReports = localStorage.getItem("user_reports");
      if (savedReports) {
        const reports = JSON.parse(savedReports);
        setReportHistory(reports);
      }
    } catch (error) {
      console.error("Failed to load report history:", error);
    }
  };

  useEffect(() => {
    // Load mock symptom predictions for demo
    const mockHistory: PredictionHistory[] = [
      {
        id: "1",
        date: "2024-01-15",
        symptoms: ["Fever", "Headache", "Fatigue"],
        topDisease: "Common Cold",
        probability: 87,
        urgency: "low",
      },
      {
        id: "2",
        date: "2024-01-10",
        symptoms: ["Chest pain", "Shortness of breath"],
        topDisease: "Anxiety",
        probability: 72,
        urgency: "medium",
      },
    ];

    setHistory(mockHistory);

    // Load real report history from localStorage
    loadReportHistory();
  }, []);

  useEffect(() => {
    // Calculate stats when data changes
    const allActivities = [
      ...history.map((h) => ({ date: h.date, confidence: h.probability })),
      ...reportHistory.map((r) => ({
        date: r.createdAt || r.date,
        confidence: r.confidence,
      })),
    ];

    const totalPredictions = history.length;
    const totalReports = reportHistory.length;
    const avgAccuracy =
      allActivities.length > 0
        ? Math.round(
            allActivities.reduce((acc, item) => acc + item.confidence, 0) /
              allActivities.length
          )
        : 0;

    // Find most recent activity
    const sortedActivities = allActivities.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const lastActivity =
      sortedActivities.length > 0 ? sortedActivities[0].date : "";

    setStats({
      totalPredictions,
      totalReports,
      avgAccuracy,
      lastActivity,
    });
  }, [history, reportHistory]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      default:
        return "outline";
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDateTime(dateString).date;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.first_name || "User"}!
          </h1>
          <p className="text-gray-600">
            Track your health insights with AI-powered predictions and report
            analysis.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link href="/predict">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Symptom Analysis</h3>
                    <p className="text-sm text-gray-600">
                      Get AI predictions from symptoms
                    </p>
                  </div>
                </div>
                <Plus className="h-5 w-5 text-gray-400 ml-auto" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/upload">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Upload className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Upload Reports</h3>
                    <p className="text-sm text-gray-600">
                      Analyze medical documents with AI
                    </p>
                  </div>
                </div>
                <Plus className="h-5 w-5 text-gray-400 ml-auto" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Symptom Predictions
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPredictions}</div>
              <p className="text-xs text-muted-foreground">
                AI symptom analyses
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Report Analyses
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReports}</div>
              <p className="text-xs text-muted-foreground">
                Medical documents analyzed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Accuracy
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgAccuracy}%</div>
              <p className="text-xs text-muted-foreground">
                AI confidence score
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Last Activity
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.lastActivity
                  ? getRelativeTime(stats.lastActivity)
                  : "Never"}
              </div>
              <p className="text-xs text-muted-foreground">
                Most recent analysis
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Symptom Predictions History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Symptom Predictions</CardTitle>
              <CardDescription>Your latest AI symptom analyses</CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    No symptom predictions yet
                  </p>
                  <Link href="/predict">
                    <Button size="sm">Start Symptom Analysis</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.slice(0, 3).map((prediction) => (
                    <div
                      key={prediction.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">
                            {prediction.topDisease}
                          </h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDateTime(prediction.date).date}</span>
                            <Clock className="h-3 w-3" />
                            <span>{formatDateTime(prediction.date).time}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getUrgencyColor(prediction.urgency)}>
                            {prediction.urgency}
                          </Badge>
                          <Badge variant="outline">
                            {prediction.probability}%
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {prediction.symptoms
                          .slice(0, 3)
                          .map((symptom, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {symptom}
                            </Badge>
                          ))}
                        {prediction.symptoms.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{prediction.symptoms.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {history.length > 3 && (
                    <div className="text-center pt-4">
                      <Button variant="outline" size="sm">
                        View All Predictions
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Report Analysis History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Report Analyses</CardTitle>
              <CardDescription>
                Your latest medical document analyses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportHistory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No report analyses yet</p>
                  <Link href="/upload">
                    <Button size="sm">Upload Medical Report</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {reportHistory.slice(0, 3).map((report) => {
                    const dateTime = formatDateTime(
                      report.createdAt || report.date
                    );
                    return (
                      <div
                        key={report.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium">{report.reportType}</h4>
                            <p className="text-sm text-gray-600 truncate">
                              {report.fileName}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                              <Calendar className="h-3 w-3" />
                              <span>{dateTime.date}</span>
                              <Clock className="h-3 w-3" />
                              <span>{dateTime.time}</span>
                              {report.fileCount && report.fileCount > 1 && (
                                <>
                                  <FileText className="h-3 w-3" />
                                  <span>{report.fileCount} files</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getUrgencyColor(report.urgency)}>
                              {report.urgency}
                            </Badge>
                            <Badge variant="outline">
                              {report.confidence}%
                            </Badge>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            {getRelativeTime(report.createdAt || report.date)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {reportHistory.length > 3 && (
                    <div className="text-center pt-4">
                      <Button variant="outline" size="sm">
                        View All Reports ({reportHistory.length})
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
