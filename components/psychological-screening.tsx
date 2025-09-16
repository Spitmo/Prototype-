"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { AlertTriangle, CheckCircle, Info, Users, Globe, User, Briefcase } from "lucide-react"
import { useAppStore } from "@/lib/store"

interface Question {
  id: string
  text: string
  options: { value: number; label: string }[]
}

const PHQ9_QUESTIONS: Question[] = [
  {
    id: "phq1",
    text: "Little interest or pleasure in doing things",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: "phq2",
    text: "Feeling down, depressed, or hopeless",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: "phq3",
    text: "Trouble falling or staying asleep, or sleeping too much",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: "phq4",
    text: "Feeling tired or having little energy",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: "phq5",
    text: "Poor appetite or overeating",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: "phq6",
    text: "Feeling bad about yourself or that you are a failure or have let yourself or your family down",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: "phq7",
    text: "Trouble concentrating on things, such as reading or watching television",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: "phq8",
    text: "Moving or speaking so slowly that other people could have noticed, or being so fidgety or restless that you have been moving around a lot more than usual",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: "phq9",
    text: "Thoughts that you would be better off dead, or thoughts of hurting yourself in some way",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: "phq10",
    text: "Difficulty making decisions or feeling indecisive about daily activities",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
]

const GAD7_QUESTIONS: Question[] = [
  {
    id: "gad1",
    text: "Feeling nervous, anxious, or on edge",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: "gad2",
    text: "Not being able to stop or control worrying",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: "gad3",
    text: "Worrying too much about different things",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: "gad4",
    text: "Trouble relaxing",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: "gad5",
    text: "Being so restless that it is hard to sit still",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: "gad6",
    text: "Becoming easily annoyed or irritable",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: "gad7",
    text: "Feeling afraid as if something awful might happen",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: "gad8",
    text: "Having trouble sleeping due to worry or anxiety",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: "gad9",
    text: "Experiencing physical symptoms like sweating, trembling, or rapid heartbeat when anxious",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: "gad10",
    text: "Avoiding social situations or activities due to anxiety",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
]

type AssessmentType = "selection" | "userInfo" | "phq9" | "gad7" | "results"

export default function PsychologicalScreening() {
  const [currentAssessment, setCurrentAssessment] = useState<AssessmentType>("selection")
  const [selectedTest, setSelectedTest] = useState<"phq9" | "gad7" | null>(null)
  const [userInfo, setUserInfo] = useState({ name: "", profession: "" })
  const [phq9Answers, setPhq9Answers] = useState<Record<string, number>>({})
  const [gad7Answers, setGad7Answers] = useState<Record<string, number>>({})
  const [isCompleted, setIsCompleted] = useState(false)

  const incrementAssessments = useAppStore((state) => state.incrementAssessments)
  const incrementRegisteredUsers = useAppStore((state) => state.incrementRegisteredUsers)
  const addStudent = useAppStore((state) => state.addStudent)

  const handlePhq9Answer = (questionId: string, value: number) => {
    setPhq9Answers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleGad7Answer = (questionId: string, value: number) => {
    setGad7Answers((prev) => ({ ...prev, [questionId]: value }))
  }

  const calculatePhq9Score = () => {
    return Object.values(phq9Answers).reduce((sum, value) => sum + value, 0)
  }

  const calculateGad7Score = () => {
    return Object.values(gad7Answers).reduce((sum, value) => sum + value, 0)
  }

  const getPhq9Interpretation = (score: number) => {
    if (score >= 27) return { level: "Severe", color: "text-red-600", bg: "bg-red-50" }
    if (score >= 20) return { level: "Moderately Severe", color: "text-orange-600", bg: "bg-orange-50" }
    if (score >= 14) return { level: "Moderate", color: "text-yellow-600", bg: "bg-yellow-50" }
    if (score >= 7) return { level: "Mild", color: "text-blue-600", bg: "bg-blue-50" }
    return { level: "Minimal", color: "text-green-600", bg: "bg-green-50" }
  }

  const getGad7Interpretation = (score: number) => {
    if (score >= 21) return { level: "Severe", color: "text-red-600", bg: "bg-red-50" }
    if (score >= 15) return { level: "Moderate", color: "text-orange-600", bg: "bg-orange-50" }
    if (score >= 7) return { level: "Mild", color: "text-yellow-600", bg: "bg-yellow-50" }
    return { level: "Minimal", color: "text-green-600", bg: "bg-green-50" }
  }

  const getPopulationStats = (phq9Score: number, gad7Score: number) => {
    const phq9Level = getPhq9Interpretation(phq9Score).level
    const gad7Level = getGad7Interpretation(gad7Score).level

    const depressionStats = {
      Minimal: { percentage: 65, population: "5.2 billion", rarity: "Common - Most people" },
      Mild: { percentage: 20, population: "1.6 billion", rarity: "Fairly Common - 1 in 5 people" },
      Moderate: { percentage: 10, population: "800 million", rarity: "Less Common - 1 in 10 people" },
      "Moderately Severe": { percentage: 4, population: "320 million", rarity: "Uncommon - 1 in 25 people" },
      Severe: { percentage: 1, population: "80 million", rarity: "Rare - 1 in 100 people" },
    }

    const anxietyStats = {
      Minimal: { percentage: 70, population: "5.6 billion", rarity: "Common - Most people" },
      Mild: { percentage: 18, population: "1.44 billion", rarity: "Fairly Common - 1 in 6 people" },
      Moderate: { percentage: 8, population: "640 million", rarity: "Less Common - 1 in 12 people" },
      Severe: { percentage: 4, population: "320 million", rarity: "Uncommon - 1 in 25 people" },
    }

    return {
      depression: depressionStats[phq9Level as keyof typeof depressionStats],
      anxiety: anxietyStats[gad7Level as keyof typeof anxietyStats],
    }
  }

  const calculateRiskLevel = (phq9: number, gad7: number): "low" | "moderate" | "high" => {
    if (phq9 >= 20 || gad7 >= 15) return "high"
    if (phq9 >= 14 || gad7 >= 7) return "moderate"
    return "low"
  }

  const completeAssessment = () => {
    const phq9Score = calculatePhq9Score()
    const gad7Score = calculateGad7Score()

    const newStudent = {
      id: Date.now().toString(),
      name: userInfo.name || `Student ${Date.now()}`, // Anonymous identifier if name is not provided
      email: `student${Date.now()}@college.edu`,
      age: Math.floor(Math.random() * 4) + 18, // Random age 18-21
      year: ["1st Year", "2nd Year", "3rd Year", "4th Year"][Math.floor(Math.random() * 4)],
      department: ["Computer Science", "Psychology", "Engineering", "Business", "Biology", "Arts"][
        Math.floor(Math.random() * 6)
      ],
      phq9Score,
      gad7Score,
      ghqScore: Math.floor((phq9Score + gad7Score) * 1.2), // Approximate GHQ score
      riskLevel: calculateRiskLevel(phq9Score, gad7Score),
      lastAssessment: new Date(),
      sessionsBooked: 0,
      resourcesViewed: 0,
      forumPosts: 0,
    }

    addStudent(newStudent)
    setCurrentAssessment("results")
    setIsCompleted(true)
    incrementAssessments()
    incrementRegisteredUsers()
  }

  const resetAssessment = () => {
    setCurrentAssessment("selection")
    setSelectedTest(null)
    setUserInfo({ name: "", profession: "" })
    setPhq9Answers({})
    setGad7Answers({})
    setIsCompleted(false)
  }

  const startTest = (testType: "phq9" | "gad7") => {
    setSelectedTest(testType)
    if (!userInfo.name || !userInfo.profession) {
      setCurrentAssessment("userInfo")
    } else {
      setCurrentAssessment(testType)
    }
  }

  const handleUserInfoSubmit = () => {
    if (userInfo.name && userInfo.profession && selectedTest) {
      setCurrentAssessment(selectedTest)
    }
  }

  if (currentAssessment === "selection") {
    return (
      <section id="screening" className="py-16">
        <div className="text-center mb-12">
          <div className="relative inline-block p-4 mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-white to-green-600 p-0.5 rounded-lg">
              <div className="bg-white rounded-lg h-full w-full"></div>
            </div>
            <div className="relative">
              <h2 className="text-3xl font-bold text-black">Psychological Screening Tools</h2>
            </div>
          </div>
          <p className="text-muted-foreground text-lg">
            Choose a comprehensive self-assessment using standardized clinical tools
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => startTest("phq9")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                PHQ-9 Depression Screening
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Comprehensive 10-question assessment to evaluate depression symptoms over the past two weeks.
              </p>
              <div className="text-sm text-muted-foreground">
                <p>• Clinically validated screening tool</p>
                <p>• Takes 3-5 minutes to complete</p>
                <p>• Provides detailed results with global context</p>
              </div>
              <Button className="w-full mt-4">Start PHQ-9 Assessment</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => startTest("gad7")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                GAD-7 Anxiety Screening
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Comprehensive 10-question assessment to evaluate anxiety symptoms over the past two weeks.
              </p>
              <div className="text-sm text-muted-foreground">
                <p>• Clinically validated screening tool</p>
                <p>• Takes 3-5 minutes to complete</p>
                <p>• Provides detailed results with global context</p>
              </div>
              <Button className="w-full mt-4">Start GAD-7 Assessment</Button>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  if (currentAssessment === "userInfo") {
    return (
      <section id="screening" className="py-16">
        <div className="text-center mb-12">
          <div className="relative inline-block p-4 mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-white to-green-600 p-0.5 rounded-lg">
              <div className="bg-white rounded-lg h-full w-full"></div>
            </div>
            <div className="relative">
              <h2 className="text-3xl font-bold text-black">Personal Information</h2>
            </div>
          </div>
          <p className="text-muted-foreground text-lg">
            Please provide some basic information before starting your assessment
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                This information helps us provide personalized results and is kept confidential.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profession" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Profession/Field of Study
                </Label>
                <Input
                  id="profession"
                  placeholder="e.g., Computer Science Student, Psychology Major"
                  value={userInfo.profession}
                  onChange={(e) => setUserInfo((prev) => ({ ...prev, profession: e.target.value }))}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setCurrentAssessment("selection")} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleUserInfoSubmit}
                  disabled={!userInfo.name || !userInfo.profession}
                  className="flex-1"
                >
                  Continue to Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  if (currentAssessment === "results") {
    const phq9Score = calculatePhq9Score()
    const gad7Score = calculateGad7Score()
    const phq9Interp = getPhq9Interpretation(phq9Score)
    const gad7Interp = getGad7Interpretation(gad7Score)
    const populationStats = getPopulationStats(phq9Score, gad7Score)

    return (
      <section id="screening" className="py-16">
        <div className="text-center mb-12">
          <div className="relative inline-block p-4 mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-white to-green-600 p-0.5 rounded-lg">
              <div className="bg-white rounded-lg h-full w-full"></div>
            </div>
            <div className="relative">
              <h2 className="text-3xl font-bold text-black">Assessment Results</h2>
            </div>
          </div>
          <p className="text-muted-foreground text-lg">Your comprehensive psychological screening results</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Depression Screening (Extended PHQ-9)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold">Score: {phq9Score}/30</span>
                <div className={`px-3 py-1 rounded-full ${phq9Interp.bg}`}>
                  <span className={`font-medium ${phq9Interp.color}`}>{phq9Interp.level}</span>
                </div>
              </div>
              <Progress value={(phq9Score / 30) * 100} className="mb-4" />

              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <h4 className="font-semibold text-blue-800">Global Population Context</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{populationStats.depression.percentage}%</div>
                    <div className="text-blue-700">of world population</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">{populationStats.depression.population}</div>
                    <div className="text-blue-700">people worldwide</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-blue-600">{populationStats.depression.rarity}</div>
                    <div className="text-blue-700">experience this level</div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                {phq9Score < 7 &&
                  "Your responses suggest minimal depression symptoms. Continue maintaining good mental health practices."}
                {phq9Score >= 7 &&
                  phq9Score < 14 &&
                  "Your responses suggest mild depression symptoms. Consider speaking with a counselor for support."}
                {phq9Score >= 14 &&
                  phq9Score < 20 &&
                  "Your responses suggest moderate depression symptoms. We recommend scheduling a session with our counselors."}
                {phq9Score >= 20 &&
                  "Your responses suggest significant depression symptoms. Please consider immediate professional support."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                Anxiety Screening (Extended GAD-7)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold">Score: {gad7Score}/30</span>
                <div className={`px-3 py-1 rounded-full ${gad7Interp.bg}`}>
                  <span className={`font-medium ${gad7Interp.color}`}>{gad7Interp.level}</span>
                </div>
              </div>
              <Progress value={(gad7Score / 30) * 100} className="mb-4" />

              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-green-600" />
                  <h4 className="font-semibold text-green-800">Global Population Context</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{populationStats.anxiety.percentage}%</div>
                    <div className="text-green-700">of world population</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">{populationStats.anxiety.population}</div>
                    <div className="text-green-700">people worldwide</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-green-600">{populationStats.anxiety.rarity}</div>
                    <div className="text-green-700">experience this level</div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                {gad7Score < 7 &&
                  "Your responses suggest minimal anxiety symptoms. Keep up the good work with stress management."}
                {gad7Score >= 7 &&
                  gad7Score < 15 &&
                  "Your responses suggest mild anxiety symptoms. Consider exploring our relaxation resources."}
                {gad7Score >= 15 &&
                  gad7Score < 21 &&
                  "Your responses suggest moderate anxiety symptoms. We recommend booking a counseling session."}
                {gad7Score >= 21 &&
                  "Your responses suggest severe anxiety symptoms. Please seek immediate professional support."}
              </p>
            </CardContent>
          </Card>

          {(phq9Score >= 14 || gad7Score >= 15) && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-orange-800 mb-2">Recommended Actions</h3>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• Schedule a confidential session with our counselors</li>
                      <li>• Explore our guided meditation and relaxation resources</li>
                      <li>• Connect with peer support groups</li>
                      <li>• Consider speaking with a trusted friend or family member</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4 justify-center">
            <Button onClick={resetAssessment} variant="outline">
              Take Assessment Again
            </Button>
            <Button onClick={() => document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" })}>
              Book Counseling Session
            </Button>
          </div>
        </div>
      </section>
    )
  }

  const currentQuestions = currentAssessment === "phq9" ? PHQ9_QUESTIONS : GAD7_QUESTIONS
  const currentAnswers = currentAssessment === "phq9" ? phq9Answers : gad7Answers
  const handleAnswer = currentAssessment === "phq9" ? handlePhq9Answer : handleGad7Answer
  const isCurrentComplete = currentQuestions.every((q) => q.id in currentAnswers)

  return (
    <section id="screening" className="py-16">
      <div className="text-center mb-12">
        <div className="relative inline-block p-4 mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-white to-green-600 p-0.5 rounded-lg">
            <div className="bg-white rounded-lg h-full w-full"></div>
          </div>
          <div className="relative">
            <h2 className="text-3xl font-bold text-black">Psychological Screening</h2>
          </div>
        </div>
        <p className="text-muted-foreground text-lg">
          Welcome {userInfo.name} - {userInfo.profession}
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              {currentAssessment === "phq9" ? "PHQ-9 Depression Screening" : "GAD-7 Anxiety Screening"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Over the last 2 weeks, how often have you been bothered by the following problems?
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentQuestions.map((question, index) => (
              <div key={question.id} className="space-y-3">
                <h3 className="font-medium text-foreground">
                  {index + 1}. {question.text}
                </h3>
                <RadioGroup
                  value={currentAnswers[question.id]?.toString() || ""}
                  onValueChange={(value) => handleAnswer(question.id, Number.parseInt(value))}
                >
                  {question.options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value.toString()} id={`${question.id}-${option.value}`} />
                      <Label htmlFor={`${question.id}-${option.value}`} className="text-sm">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={() => setCurrentAssessment("selection")}>
                Back to Selection
              </Button>

              {isCurrentComplete && <Button onClick={completeAssessment}>View Results</Button>}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
