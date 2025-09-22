  "use client"
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
  import { Button } from "@/components/ui/button"
  import { Badge } from "@/components/ui/badge"
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
  import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
  } from "@/components/ui/chart"
  import {
    Users,
    Calendar,
    TrendingUp,
    Eye,
    Brain,
    RotateCcw,
    Download,
    MessageSquare,
    Phone,
    Shield,
    Settings,
    BarChart3,
    PieChart,
    Clock,
    UserCheck,
    FileText,
    Headphones,
  } from "lucide-react"
  import { useAppStore } from "@/lib/store"
  import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart as RechartsPieChart,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
  } from "recharts"

  const weeklyTrends = [
    { week: "Week 1", bookings: 12, assessments: 28, chatbot: 45, resources: 89 },
    { week: "Week 2", bookings: 19, assessments: 34, chatbot: 52, resources: 102 },
    { week: "Week 3", bookings: 15, assessments: 41, chatbot: 38, resources: 76 },
    { week: "Week 4", bookings: 23, assessments: 29, chatbot: 61, resources: 134 },
  ]

  const severityData = [
    { name: "Minimal", value: 45, color: "#10b981" },
    { name: "Mild", value: 30, color: "#f59e0b" },
    { name: "Moderate", value: 20, color: "#f97316" },
    { name: "Severe", value: 5, color: "#ef4444" },
  ]

  const resourceUsage = [
    { name: "Meditation Videos", views: 234, category: "Video" },
    { name: "Stress Articles", views: 189, category: "Article" },
    { name: "Breathing Exercises", views: 156, category: "Exercise" },
    { name: "Sleep Guides", views: 143, category: "Article" },
    { name: "Anxiety Workbook", views: 98, category: "Exercise" },
  ]

  const chatbotQueries = [
    { query: "How to manage exam stress?", count: 45 },
    { query: "Signs of depression", count: 38 },
    { query: "Breathing exercises", count: 32 },
    { query: "Sleep problems", count: 28 },
    { query: "Anxiety symptoms", count: 24 },
  ]

  const chartConfig = {
    bookings: { label: "Bookings", color: "#3b82f6" },
    assessments: { label: "Assessments", color: "#8b5cf6" },
    chatbot: { label: "Chatbot Sessions", color: "#10b981" },
    resources: { label: "Resource Views", color: "#f59e0b" },
  }

  export default function AdminDashboard() {
    const {
      totalUsers,
      registeredUsers,
      sessionsBooked,
      resourceViews,
      forumPosts,
      emergencyContacts,
      assessmentsCompleted,
      students,
      resetMetrics,
    } = useAppStore()

    const avgMoodScore =
      students.length > 0
        ? students.reduce((sum, student) => {
            const phq9 = student.phq9Score || 0
            const gad7 = student.gad7Score || 0
            return sum + Math.max(0, 10 - (phq9 + gad7) / 2)
          }, 0) / students.length
        : 0

    const riskDistribution = students.reduce(
      (acc, student) => {
        acc[student.riskLevel] = (acc[student.riskLevel] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const chatbotSessions = Math.floor(resourceViews * 0.3) // Simulated chatbot usage
    const crisisClicks = emergencyContacts
    const forumActivity = forumPosts + Math.floor(forumPosts * 2.5) // Posts + replies

    const statCards = [
      {
        title: "Registered Users",
        value: registeredUsers,
        icon: Users,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        change: "+12%",
      },
      {
        title: "Counselling Bookings",
        value: sessionsBooked,
        icon: Calendar,
        color: "text-green-600",
        bgColor: "bg-green-50",
        change: "+8%",
      },
      {
        title: "Assessments Completed",
        value: assessmentsCompleted,
        icon: Brain,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        change: "+15%",
      },
      {
        title: "Chatbot Sessions",
        value: chatbotSessions,
        icon: MessageSquare,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        change: "+22%",
      },
      {
        title: "Resource Views",
        value: resourceViews.toLocaleString(),
        icon: Eye,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        change: "+18%",
      },
      {
        title: "Crisis Helpline Clicks",
        value: crisisClicks,
        icon: Phone,
        color: "text-red-600",
        bgColor: "bg-red-50",
        change: "+5%",
      },
      {
        title: "Forum Activity",
        value: forumActivity,
        icon: MessageSquare,
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
        change: "+25%",
      },
      {
        title: "Average Mood Score",
        value: avgMoodScore.toFixed(1),
        icon: TrendingUp,
        color: "text-teal-600",
        bgColor: "bg-teal-50",
        change: "+3%",
      },
    ]

    const downloadReport = (format: "csv" | "excel") => {
      const data = {
        summary: {
          registeredUsers,
          sessionsBooked,
          assessmentsCompleted,
          chatbotSessions,
          resourceViews,
          crisisClicks,
          forumActivity,
          avgMoodScore: avgMoodScore.toFixed(1),
        },
        riskDistribution,
        timestamp: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `mental-health-report-${new Date().toISOString().split("T")[0]}.${format === "csv" ? "json" : "json"}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    return (
      <section id="dashboard" className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="relative inline-block p-4 mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-white to-green-600 p-0.5 rounded-lg">
                <div className="bg-white rounded-lg h-full w-full"></div>
              </div>
              <div className="relative">
                <h2 className="text-3xl font-bold text-black">Mental Health Analytics Dashboard</h2>
              </div>
            </div>
            <p className="text-muted-foreground text-lg mb-6">
              Comprehensive insights for institutional mental health support
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button onClick={resetMetrics} variant="outline" size="sm">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Metrics
              </Button>
              <Button onClick={() => downloadReport("csv")} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download CSV Report
              </Button>
              <Button onClick={() => downloadReport("excel")} variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Download Excel Report
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Admin Settings
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {statCards.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {stat.change} vs last week
                      </Badge>
                    </div>
                    <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Trends & Charts</TabsTrigger>
              <TabsTrigger value="insights">Anonymous Insights</TabsTrigger>
              <TabsTrigger value="controls">Admin Controls</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5" />
                      Risk Level Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {students.length > 0 ? (
                      <ChartContainer config={chartConfig} className="h-[300px]">
                        <RechartsPieChart>
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <RechartsPieChart data={severityData} cx="50%" cy="50%" outerRadius={80}>
                            {severityData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </RechartsPieChart>
                          <ChartLegend content={<ChartLegendContent payload={undefined} />} />
                        </RechartsPieChart>
                      </ChartContainer>
                    ) : (
                      <div className="text-center py-8">
                        <PieChart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No assessment data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      Recent Assessments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {students.length > 0 ? (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {students
                          .filter((student) => student.lastAssessment)
                          .sort((a, b) => new Date(b.lastAssessment!).getTime() - new Date(a.lastAssessment!).getTime())
                          .slice(0, 8)
                          .map((student) => (
                            <div
                              key={student.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                              <div>
                                <p className="text-sm font-medium">{student.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {student.department} • {student.profession}
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge
                                  variant={
                                    student.riskLevel === "high"
                                      ? "destructive"
                                      : student.riskLevel === "moderate"
                                        ? "secondary"
                                        : "default"
                                  }
                                  className="mb-1"
                                >
                                  {student.riskLevel}
                                </Badge>
                                <p className="text-xs text-muted-foreground">
                                  {student.lastAssessment
                                    ? new Date(student.lastAssessment).toLocaleDateString()
                                    : "No assessment"}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No recent assessments</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Weekly Mental Health Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[400px]">
                    <LineChart data={weeklyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent payload={undefined} />} />
                      <Line type="monotone" dataKey="bookings" stroke="var(--color-bookings)" strokeWidth={2} />
                      <Line type="monotone" dataKey="assessments" stroke="var(--color-assessments)" strokeWidth={2} />
                      <Line type="monotone" dataKey="chatbot" stroke="var(--color-chatbot)" strokeWidth={2} />
                      <Line type="monotone" dataKey="resources" stroke="var(--color-resources)" strokeWidth={2} />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Resource Usage Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px]">
                      <BarChart data={resourceUsage}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="views" fill="#3b82f6" />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Top Chatbot Queries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {chatbotQueries.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate flex-1 mr-4">{item.query}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-muted rounded-full">
                              <div
                                className="h-2 bg-blue-500 rounded-full"
                                style={{ width: `${(item.count / chatbotQueries[0].count) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground w-8">{item.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Depression Severity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Minimal (0-4)</span>
                        <Badge variant="outline">45%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Mild (5-9)</span>
                        <Badge variant="secondary">30%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Moderate (10-14)</span>
                        <Badge variant="secondary">20%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Severe (15+)</span>
                        <Badge variant="destructive">5%</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Anxiety Levels</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Minimal (0-4)</span>
                        <Badge variant="outline">42%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Mild (5-9)</span>
                        <Badge variant="secondary">33%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Moderate (10-14)</span>
                        <Badge variant="secondary">18%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Severe (15+)</span>
                        <Badge variant="destructive">7%</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Peak Usage Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">2:00 PM - 4:00 PM</span>
                        <Badge>High</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-500" />
                        <span className="text-sm">8:00 PM - 10:00 PM</span>
                        <Badge>High</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span className="text-sm">12:00 PM - 2:00 PM</span>
                        <Badge variant="secondary">Medium</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">6:00 AM - 8:00 AM</span>
                        <Badge variant="outline">Low</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Insights & Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-green-700">Positive Trends</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>25% increase in peer support engagement</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Early intervention success rate: 78%</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Resource completion rate improved by 15%</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-orange-700">Action Items</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span>Increase counselor availability during peak hours</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span>Develop targeted interventions for high-risk students</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span>Expand stress management resources for exam periods</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="controls" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="w-5 h-5" />
                      Counselor Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Available Counselors</span>
                      <Badge variant="outline">8/12</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">On Break</span>
                      <Badge variant="secondary">2</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Busy</span>
                      <Badge variant="destructive">2</Badge>
                    </div>
                    <Button size="sm" className="w-full">
                      Manage Schedule
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Forum Moderation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pending Reviews</span>
                      <Badge variant="secondary">3</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Flagged Posts</span>
                      <Badge variant="destructive">1</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Moderators</span>
                      <Badge variant="outline">4</Badge>
                    </div>
                    <Button size="sm" className="w-full">
                      Review Queue
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Headphones className="w-5 h-5" />
                      Crisis Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Crisis Cases</span>
                      <Badge variant="destructive">2</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Response Time</span>
                      <Badge variant="outline">Less than 5 min</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">24/7 Availability</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <Button size="sm" className="w-full" variant="destructive">
                      Crisis Dashboard
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Data Management</h4>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                          <Download className="w-4 h-4 mr-2" />
                          Export All Data
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                          <FileText className="w-4 h-4 mr-2" />
                          Generate Monthly Report
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                          <Settings className="w-4 h-4 mr-2" />
                          Privacy Settings
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold">System Health</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Database Status</span>
                          <Badge variant="default">Healthy</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">API Response Time</span>
                          <Badge variant="outline">142ms</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Uptime</span>
                          <Badge variant="default">99.9%</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    )
  }
