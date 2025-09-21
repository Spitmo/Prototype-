"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { AlertTriangle, CheckCircle, Info, User, Briefcase } from "lucide-react"
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

const PHQ9_QUESTIONS: Question[] = [
  { id: "phq1", text: "Little interest or pleasure in doing things", options: getOptions() },
  { id: "phq2", text: "Feeling down, depressed, or hopeless", options: getOptions() },
  { id: "phq3", text: "Trouble falling or staying asleep, or sleeping too much", options: getOptions() },
  { id: "phq4", text: "Feeling tired or having little energy", options: getOptions() },
  { id: "phq5", text: "Poor appetite or overeating", options: getOptions() },
  { id: "phq6", text: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down", options: getOptions() },
  { id: "phq7", text: "Trouble concentrating on things, such as reading or watching television", options: getOptions() },
  { id: "phq8", text: "Moving or speaking so slowly that other people could have noticed. Or the opposite — being so fidgety or restless that you have been moving around more than usual", options: getOptions() },
  { id: "phq9", text: "Thoughts that you would be better off dead, or thoughts of hurting yourself in some way", options: getOptions() },
]

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

  const incrementAssessments = useAppStore((state) => state.incrementAssessments)
  const addStudent = useAppStore((state) => state.addStudent)

  const handlePhq9Answer = (id: string, value: number) => setPhq9Answers((p) => ({ ...p, [id]: value }))
  const handleGad7Answer = (id: string, value: number) => setGad7Answers((p) => ({ ...p, [id]: value }))

  const calculatePhq9Score = () => Object.values(phq9Answers).reduce((a, b) => a + b, 0)
  const calculateGad7Score = () => Object.values(gad7Answers).reduce((a, b) => a + b, 0)

  // ✅ Official scoring
  const getPhq9Interpretation = (score: number) => {
    if (score >= 20) return { level: "Severe", color: "text-red-600", bg: "bg-red-50" }
    if (score >= 15) return { level: "Moderately Severe", color: "text-orange-600", bg: "bg-orange-50" }
    if (score >= 10) return { level: "Moderate", color: "text-yellow-600", bg: "bg-yellow-50" }
    if (score >= 5) return { level: "Mild", color: "text-blue-600", bg: "bg-blue-50" }
    return { level: "Minimal", color: "text-green-600", bg: "bg-green-50" }
  }

  const getGad7Interpretation = (score: number) => {
    if (score >= 15) return { level: "Severe", color: "text-red-600", bg: "bg-red-50" }
    if (score >= 10) return { level: "Moderate", color: "text-orange-600", bg: "bg-orange-50" }
    if (score >= 5) return { level: "Mild", color: "text-yellow-600", bg: "bg-yellow-50" }
    return { level: "Minimal", color: "text-green-600", bg: "bg-green-50" }
  }

  const completeAssessment = () => {
    const phq9Score = calculatePhq9Score()
    const gad7Score = calculateGad7Score()

    addStudent({
      id: Date.now().toString(),
      name: userInfo.name || `Student ${Date.now()}`,
      email: `student${Date.now()}@college.edu`,
      phq9Score,
      gad7Score,
      riskLevel: phq9Score >= 15 || gad7Score >= 15
        ? "high"
        : phq9Score >= 10 || gad7Score >= 10
          ? "moderate"
          : "low",
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

  // --- SCREENS ---

  if (currentAssessment === "selection") {
    return (
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Psychological Screening Tools</h2>
          <p className="text-muted-foreground">Choose a standardized self-assessment</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card onClick={() => { setSelectedTest("phq9"); setCurrentAssessment("userInfo"); }} className="cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                PHQ-9 Depression Screening
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">9-question test for depression over the past 2 weeks.</p>
              <Button className="w-full mt-4">Start PHQ-9</Button>
            </CardContent>
          </Card>

          <Card onClick={() => { setSelectedTest("gad7"); setCurrentAssessment("userInfo"); }} className="cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                GAD-7 Anxiety Screening
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">7-question test for anxiety over the past 2 weeks.</p>
              <Button className="w-full mt-4">Start GAD-7</Button>
            </CardContent>
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
            <CardHeader>
              <CardTitle>Enter Your Info</CardTitle>
            </CardHeader>
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
    const questions = currentAssessment === "phq9" ? PHQ9_QUESTIONS : GAD7_QUESTIONS
    const answers = currentAssessment === "phq9" ? phq9Answers : gad7Answers
    const handleAnswer = currentAssessment === "phq9" ? handlePhq9Answer : handleGad7Answer

    const allAnswered = questions.every((q) => q.id in answers)

    return (
      <section className="py-16">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                {currentAssessment === "phq9" ? "PHQ-9 Depression Screening" : "GAD-7 Anxiety Screening"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {questions.map((q, i) => (
                <div key={q.id}>
                  <p>{i + 1}. {q.text}</p>
                  <RadioGroup value={answers[q.id]?.toString() || ""} onValueChange={(val) => handleAnswer(q.id, parseInt(val))}>
                    {q.options.map((o) => (
                      <div key={o.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={o.value.toString()} id={`${q.id}-${o.value}`} />
                        <Label htmlFor={`${q.id}-${o.value}`}>{o.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
              {allAnswered && <Button onClick={completeAssessment}>View Results</Button>}
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  if (currentAssessment === "results") {
    const phq9 = calculatePhq9Score()
    const gad7 = calculateGad7Score()
    const phq9Interp = getPhq9Interpretation(phq9)
    const gad7Interp = getGad7Interpretation(gad7)

    return (
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Your Assessment Results</h2>
          <p className="text-muted-foreground">Based on PHQ-9 and GAD-7 official scoring</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* PHQ-9 */}
          <Card>
            <CardHeader><CardTitle>PHQ-9 Depression Score</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-bold">{phq9} / 27</span>
                <span className={`px-3 py-1 rounded-full ${phq9Interp.bg} ${phq9Interp.color}`}>
                  {phq9Interp.level}
                </span>
              </div>
              <Progress value={(phq9 / 27) * 100} />
            </CardContent>
          </Card>

          {/* GAD-7 */}
          <Card>
            <CardHeader><CardTitle>GAD-7 Anxiety Score</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-bold">{gad7} / 21</span>
                <span className={`px-3 py-1 rounded-full ${gad7Interp.bg} ${gad7Interp.color}`}>
                  {gad7Interp.level}
                </span>
              </div>
              <Progress value={(gad7 / 21) * 100} />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button onClick={() => setCurrentAssessment("selection")} variant="outline">
              Take Again
            </Button>
            <Button onClick={() => document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" })}>
              Book Counseling Session
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return null
}
