"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { CheckCircle, Info, User, Briefcase } from "lucide-react"
import { useAppStore } from "@/lib/store"

interface Question {
  id: string
  text: string
  options: { value: number; label: string }[]
}

function getOptions() {
  return [
    { value: 0, label: "Not at all" },
    { value: 1, label: "Several days" },
    { value: 2, label: "More than half the days" },
    { value: 3, label: "Nearly every day" },
  ]
}

// ✅ PHQ-9
const PHQ9_QUESTIONS: Question[] = [
  { id: "phq1", text: "Little interest or pleasure in doing things", options: getOptions() },
  { id: "phq2", text: "Feeling down, depressed, or hopeless", options: getOptions() },
  { id: "phq3", text: "Trouble falling or staying asleep, or sleeping too much", options: getOptions() },
  { id: "phq4", text: "Feeling tired or having little energy", options: getOptions() },
  { id: "phq5", text: "Poor appetite or overeating", options: getOptions() },
  { id: "phq6", text: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down", options: getOptions() },
  { id: "phq7", text: "Trouble concentrating on things, such as reading or watching television", options: getOptions() },
  { id: "phq8", text: "Moving or speaking so slowly that other people could have noticed. Or the opposite — being so fidgety or restless that you have been moving more than usual", options: getOptions() },
  { id: "phq9", text: "Thoughts that you would be better off dead, or thoughts of hurting yourself in some way", options: getOptions() },
]

// ✅ GAD-7
const GAD7_QUESTIONS: Question[] = [
  { id: "gad1", text: "Feeling nervous, anxious, or on edge", options: getOptions() },
  { id: "gad2", text: "Not being able to stop or control worrying", options: getOptions() },
  { id: "gad3", text: "Worrying too much about different things", options: getOptions() },
  { id: "gad4", text: "Trouble relaxing", options: getOptions() },
  { id: "gad5", text: "Being so restless that it is hard to sit still", options: getOptions() },
  { id: "gad6", text: "Becoming easily annoyed or irritable", options: getOptions() },
  { id: "gad7", text: "Feeling afraid as if something awful might happen", options: getOptions() },
]

type AssessmentType = "selection" | "userInfo" | "phq9" | "gad7" | "results"

export default function PsychologicalScreening() {
  const [currentAssessment, setCurrentAssessment] = useState<AssessmentType>("selection")
  const [selectedTest, setSelectedTest] = useState<"phq9" | "gad7" | null>(null)
  const [userInfo, setUserInfo] = useState({ name: "", profession: "" })
  const [phq9Answers, setPhq9Answers] = useState<Record<string, number>>({})
  const [gad7Answers, setGad7Answers] = useState<Record<string, number>>({})

  const incrementAssessments = useAppStore((s) => s.incrementAssessments)
  const addStudent = useAppStore((s) => s.addStudent)

  const handlePhq9Answer = (id: string, val: number) => setPhq9Answers((p) => ({ ...p, [id]: val }))
  const handleGad7Answer = (id: string, val: number) => setGad7Answers((p) => ({ ...p, [id]: val }))

  const calculatePhq9 = () => Object.values(phq9Answers).reduce((a, b) => a + b, 0)
  const calculateGad7 = () => Object.values(gad7Answers).reduce((a, b) => a + b, 0)

  // ✅ Scoring
  type LevelType = "Minimal" | "Mild" | "Moderate" | "Moderately Severe" | "Severe";

  const getPhq9Interpretation = (s: number): { level: LevelType; color: string; bg: string } => {
    if (s >= 20) return { level: "Severe", color: "text-red-600", bg: "bg-red-50" }
    if (s >= 15) return { level: "Moderately Severe", color: "text-orange-600", bg: "bg-orange-50" }
    if (s >= 10) return { level: "Moderate", color: "text-yellow-600", bg: "bg-yellow-50" }
    if (s >= 5) return { level: "Mild", color: "text-blue-600", bg: "bg-blue-50" }
    return { level: "Minimal", color: "text-green-600", bg: "bg-green-50" }
  }
  const getGad7Interpretation = (s: number): { level: LevelType; color: string; bg: string } => {
    if (s >= 15) return { level: "Severe", color: "text-red-600", bg: "bg-red-50" }
    if (s >= 10) return { level: "Moderate", color: "text-orange-600", bg: "bg-orange-50" }
    if (s >= 5) return { level: "Mild", color: "text-yellow-600", bg: "bg-yellow-50" }
    return { level: "Minimal", color: "text-green-600", bg: "bg-green-50" }
  }

  // 🌍 Global + India dynamic stats
  const getGlobalStats = (
    test: "phq9" | "gad7",
    level: "Minimal" | "Mild" | "Moderate" | "Moderately Severe" | "Severe"
  ) => {
    if (test === "phq9") {
      const stats: {
        Minimal: string;
        Mild: string;
        Moderate: string;
        "Moderately Severe": string;
        Severe: string;
      } = {
        Minimal: "Globally ~65% report minimal symptoms. In India, most students fall in this range.",
        Mild: "About 20% globally, ~18% in India experience mild depressive symptoms.",
        Moderate: "Around 10% globally and ~8% in India experience moderate depression.",
        "Moderately Severe": "About 4% globally and ~3% in India report moderately severe depression.",
        Severe: "Roughly 1% globally and ~0.5-1% in India experience severe depression.",
      }
      return stats[level]
    }
    const stats: {
      Minimal: string;
      Mild: string;
      Moderate: string;
      "Moderately Severe": string;
      Severe: string;
    } = {
      Minimal: "Globally ~70% report minimal anxiety. In India, a majority fall here.",
      Mild: "About 18% globally, ~15% in India experience mild anxiety symptoms.",
      Moderate: "Around 8% globally and ~6% in India experience moderate anxiety.",
      "Moderately Severe": "About 4% globally and ~3% in India report moderately severe anxiety.",
      Severe: "Around 4% globally and ~3% in India report severe anxiety.",
    }
    return stats[level]
  }

  const completeAssessment = () => {
    const phq9 = calculatePhq9()
    const gad7 = calculateGad7()

    addStudent({
      id: Date.now().toString(),
      name: userInfo.name || `Student ${Date.now()}`,
      email: `student${Date.now()}@college.edu`,
      phq9Score: phq9,
      gad7Score: gad7,
      riskLevel: phq9 >= 15 || gad7 >= 15 ? "high" : phq9 >= 10 || gad7 >= 10 ? "moderate" : "low",
      lastAssessment: new Date(),
      age: 0,
      year: "",
      department: "",
      sessionsBooked: 0,
      resourcesViewed: 0,
      forumPosts: 0
    })

    incrementAssessments()
    setCurrentAssessment("results")
  }

  // --- UI Screens ---
  if (currentAssessment === "selection") {
    return (
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Psychological Screening Tools</h2>
          <p className="text-muted-foreground">Choose a standardized self-assessment</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card onClick={() => { setSelectedTest("phq9"); setCurrentAssessment("userInfo"); }} className="cursor-pointer">
            <CardHeader><CardTitle>PHQ-9 Depression</CardTitle></CardHeader>
            <CardContent><Button className="w-full mt-4">Start PHQ-9</Button></CardContent>
          </Card>
          <Card onClick={() => { setSelectedTest("gad7"); setCurrentAssessment("userInfo"); }} className="cursor-pointer">
            <CardHeader><CardTitle>GAD-7 Anxiety</CardTitle></CardHeader>
            <CardContent><Button className="w-full mt-4">Start GAD-7</Button></CardContent>
          </Card>
        </div>
      </section>
    )
  }

  if (currentAssessment === "userInfo") {
    return (
      <section className="py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader><CardTitle>Your Info</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Name" value={userInfo.name} onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })} />
              <Input placeholder="Profession / Study" value={userInfo.profession} onChange={(e) => setUserInfo({ ...userInfo, profession: e.target.value })} />
              <Button disabled={!userInfo.name || !userInfo.profession} onClick={() => setCurrentAssessment(selectedTest!)}>
                Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  if (currentAssessment === "phq9" || currentAssessment === "gad7") {
    const qns = currentAssessment === "phq9" ? PHQ9_QUESTIONS : GAD7_QUESTIONS
    const answers = currentAssessment === "phq9" ? phq9Answers : gad7Answers
    const handle = currentAssessment === "phq9" ? handlePhq9Answer : handleGad7Answer
    const allDone = qns.every((q) => q.id in answers)

    return (
      <section className="py-16">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" /> {currentAssessment === "phq9" ? "PHQ-9 Depression" : "GAD-7 Anxiety"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {qns.map((q, i) => (
                <div key={q.id}>
                  <p>{i + 1}. {q.text}</p>
                  <RadioGroup value={answers[q.id]?.toString() || ""} onValueChange={(v) => handle(q.id, parseInt(v))}>
                    {q.options.map((o) => (
                      <div key={o.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={o.value.toString()} id={`${q.id}-${o.value}`} />
                        <Label htmlFor={`${q.id}-${o.value}`}>{o.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
              {allDone && <Button onClick={completeAssessment}>View Results</Button>}
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  if (currentAssessment === "results") {
    const phq9 = calculatePhq9()
    const gad7 = calculateGad7()
    const hasPhq9 = selectedTest === "phq9"
    const hasGad7 = selectedTest === "gad7"

    return (
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Your Assessment Results</h2>
        </div>
        <div className="max-w-4xl mx-auto space-y-6">
          {hasPhq9 && (
            <Card>
              <CardHeader><CardTitle>PHQ-9 Depression Score</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold">{phq9}/27</span>
                  <span className={`px-3 py-1 rounded-full ${getPhq9Interpretation(phq9).bg} ${getPhq9Interpretation(phq9).color}`}>
                    {getPhq9Interpretation(phq9).level}
                  </span>
                </div>
                <Progress value={(phq9 / 27) * 100} className="mb-4" />
                {/* 🌍 Highlighted box */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mt-4">
                  <p className="text-sm text-blue-800 font-medium">
                    {getGlobalStats("phq9", getPhq9Interpretation(phq9).level)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {hasGad7 && (
            <Card>
              <CardHeader><CardTitle>GAD-7 Anxiety Score</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold">{gad7}/21</span>
                  <span className={`px-3 py-1 rounded-full ${getGad7Interpretation(gad7).bg} ${getGad7Interpretation(gad7).color}`}>
                    {getGad7Interpretation(gad7).level}
                  </span>
                </div>
                <Progress value={(gad7 / 21) * 100} className="mb-4" />
                {/* 🌍 Highlighted box */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mt-4">
                  <p className="text-sm text-blue-800 font-medium">
                    {getGlobalStats("gad7", getGad7Interpretation(gad7).level)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4 justify-center">
            <Button onClick={() => setCurrentAssessment("selection")} variant="outline">Take Again</Button>
            <Button onClick={() => document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" })}>
              Book Counseling
            </Button>
            {!hasGad7 && <Button onClick={() => setCurrentAssessment("gad7")}>Take GAD-7</Button>}
            {!hasPhq9 && <Button onClick={() => setCurrentAssessment("phq9")}>Take PHQ-9</Button>}
          </div>
        </div>
      </section>
    )
  }

  return null
}
