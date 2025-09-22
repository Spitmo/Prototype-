"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { doc, onSnapshot, collection } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Calendar, Brain, TrendingUp, AlertTriangle } from "lucide-react"

interface AnalyticsData {
  registeredUsers: number
  sessionsBooked: number
  assessmentsCompleted: number
  lastUpdated?: any
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<AnalyticsData | null>(null)
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 🔥 Listen to analytics + students (aggregated)
    const unsub1 = onSnapshot(
      doc(db, "analytics", "global"),
      (snap) => {
        if (snap.exists()) {
          setMetrics(snap.data() as AnalyticsData)
        } else {
          setMetrics({
            registeredUsers: 0,
            sessionsBooked: 0,
            assessmentsCompleted: 0,
          })
        }
        setLoading(false)
      },
      () => {
        setError("Access denied: Admin privileges required")
        setLoading(false)
      }
    )

    const unsub2 = onSnapshot(
      collection(db, "students"),
      (snap) => {
        const studentData = snap.docs.map((d) => d.data())
        setStudents(studentData)
      },
      () => {
        console.log("Cannot access student details → aggregated only")
      }
    )

    return () => {
      unsub1()
      unsub2()
    }
  }, [])

  // ✅ Risk distribution aggregation
  const getRiskDistribution = () => {
    if (students.length === 0) return { low: 0, moderate: 0, high: 0 }

    return students.reduce(
      (acc, student) => {
        const level = student.riskLevel || "unknown"
        acc[level] = (acc[level] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
  }

  // ✅ Avg score calculation (aggregate only)
  const getAvgScore = () => {
    if (students.length === 0) return 0
    const valid = students.filter(
      (s) => s.phq9Score !== undefined && s.gad7Score !== undefined
    )
    if (valid.length === 0) return 0
    const total = valid.reduce(
      (sum, s) => sum + (s.phq9Score + s.gad7Score) / 2,
      0
    )
    return total / valid.length
  }

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
        <div className="container mx-auto px-4 text-center">Loading analytics...</div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
        <div className="container mx-auto px-4 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-red-600">{error}</h2>
          <p className="text-gray-600">Please ensure you have admin privileges.</p>
        </div>
      </section>
    )
  }

  const riskDistribution = getRiskDistribution()
  const avgScore = getAvgScore()

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-6">Admin Dashboard</h2>
        <p className="text-center text-gray-600 mb-8">
          Aggregated analytics only – No personal data shown
        </p>

        {/* Top Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <p className="text-sm">Registered Users</p>
              <p className="text-2xl font-bold">{metrics?.registeredUsers || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-sm">Sessions Booked</p>
              <p className="text-2xl font-bold">{metrics?.sessionsBooked || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Brain className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <p className="text-sm">Assessments Completed</p>
              <p className="text-2xl font-bold">{metrics?.assessmentsCompleted || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <p className="text-sm">Avg Assessment Score</p>
              <p className="text-2xl font-bold">{avgScore.toFixed(1)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="risk">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="risk">Risk Distribution</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          {/* Risk Distribution */}
          <TabsContent value="risk">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {Object.entries(riskDistribution).map(([level, count]) => (
                <Card key={level}>
                  <CardContent className="p-4 text-center">
                    <p
                      className={`text-sm font-medium capitalize ${
                        level === "high"
                          ? "text-red-600"
                          : level === "moderate"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {level}
                    </p>
                    <p className="text-2xl font-bold">{String(count)}</p>
                    <p className="text-xs text-gray-500">students</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Summary */}
          <TabsContent value="summary">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">System Summary</h3>
                <div className="space-y-2 text-sm">
                  <p>Total Students: {students.length}</p>
                  <p>
                    Last Updated:{" "}
                    {metrics?.lastUpdated
                      ? new Date(metrics.lastUpdated.toDate()).toLocaleString()
                      : "N/A"}
                  </p>
                  <p>Data Privacy: No personal information is displayed</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
