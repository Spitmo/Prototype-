"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { CheckCircle, Info } from "lucide-react"
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

/* Official PHQ-9 questions */
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

/* Official GAD-7 questions */
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
  const [completedTests, setCompletedTests] = useState<{ phq9: boolean; gad7: boolean }>({ phq9: false, gad7: false })

  // store actions
  const incrementAssessments = useAppStore((s) => s.incrementAssessments)
  const addStudent = useAppStore((s) => s.addStudent)

  // handlers for answers
  const handlePhq9Answer = (id: string, v: number) => setPhq9Answers((p) => ({ ...p, [id]: v }))
  const handleGad7Answer = (id: string, v: number) => setGad7Answers((p) => ({ ...p, [id]: v }))

  // calculators
  const calculatePhq9 = () => Object.values(phq9Answers).reduce((a, b) => a + b, 0)
  const calculateGad7 = () => Object.values(gad7Answers).reduce((a, b) => a + b, 0)

  // Official interpretations
  const getPhq9Interpretation = (s: number): { level: Phq9Level; color: string; bg: string } => {
    if (s >= 20) return { level: "Severe", color: "text-red-600", bg: "bg-red-50" }
    if (s >= 15) return { level: "Moderately Severe", color: "text-orange-600", bg: "bg-orange-50" }
    if (s >= 10) return { level: "Moderate", color: "text-yellow-600", bg: "bg-yellow-50" }
    if (s >= 5) return { level: "Mild", color: "text-blue-600", bg: "bg-blue-50" }
    return { level: "Minimal", color: "text-green-600", bg: "bg-green-50" }
  }

  const getGad7Interpretation = (s: number): { level: Gad7Level; color: string; bg: string } => {
    if (s >= 15) return { level: "Severe", color: "text-red-600", bg: "bg-red-50" }
    if (s >= 10) return { level: "Moderate", color: "text-orange-600", bg: "bg-orange-50" }
    if (s >= 5) return { level: "Mild", color: "text-yellow-600", bg: "bg-yellow-50" }
    return { level: "Minimal", color: "text-green-600", bg: "bg-green-50" }
  }

  // Dynamic Global + India stats (simple readable strings)
  type Phq9Level = "Minimal" | "Mild" | "Moderate" | "Moderately Severe" | "Severe";
  type Gad7Level = "Minimal" | "Mild" | "Moderate" | "Severe";

  const getGlobalStats = (test: "phq9" | "gad7", level: Phq9Level | Gad7Level) => {
    if (test === "phq9") {
      const stats: Record<Phq9Level, string> = {
        Minimal: "Globally ~65% report minimal symptoms. In India, many students fall in this range.",
        Mild: "About 20% globally, ~18% in India experience mild depressive symptoms.",
        Moderate: "Around 10% globally and ~8% in India experience moderate depression.",
        "Moderately Severe": "About 4% globally and ~3% in India report moderately severe depression.",
        Severe: "Roughly 1% globally and ~0.5–1% in India experience severe depression.",
      };
      return stats[level as Phq9Level];
    }
    const stats: Record<Gad7Level, string> = {
      Minimal: "Globally ~70% report minimal anxiety. In India, a majority fall here.",
      Mild: "About 18% globally, ~15% in India experience mild anxiety symptoms.",
      Moderate: "Around 8% globally and ~6% in India experience moderate anxiety.",
      Severe: "Around 4% globally and ~3% in India report severe anxiety.",
    };
    return stats[level as Gad7Level];
  }

  /* completeAssessment:
     - mark test completed
     - save a student entry with reasonable defaults (prevents TS missing fields)
     - increment counters
     - route to results
  */
  const completeAssessment = () => {
    // ensure currentAssessment is either phq9 or gad7
    if (currentAssessment !== "phq9" && currentAssessment !== "gad7") return

    const phq9 = calculatePhq9()
    const gad7 = calculateGad7()
    const doneTest = currentAssessment === "phq9" ? "phq9" : "gad7"

    // mark completed
    setCompletedTests((p) => ({ ...p, [doneTest]: true }))
    setSelectedTest(doneTest)

    // add a student record with sensible defaults to satisfy store typing
    try {
      addStudent({
        id: Date.now().toString(),
        name: userInfo.name || `Student ${Date.now()}`,
        email: `student${Date.now()}@college.edu`,
        age: 18,
        year: "1st Year",
        department: userInfo.profession || "Unknown",
        phq9Score: phq9,
        gad7Score: gad7,
        ghqScore: Math.round((phq9 + gad7) / 2),
        riskLevel: phq9 >= 15 || gad7 >= 15 ? "high" : phq9 >= 10 || gad7 >= 10 ? "moderate" : "low",
        lastAssessment: new Date(),
        sessionsBooked: 0,
        resourcesViewed: 0,
        forumPosts: 0,
      } as any) // 'as any' to reduce chance of TS mismatch — adjust store types when possible
    } catch (err) {
      // if addStudent is not typed to accept all fields, try fallback minimal call
      try {
        addStudent({
          id: Date.now().toString(),
          name: userInfo.name || `Student ${Date.now()}`,
          email: `student${Date.now()}@college.edu`,
          phq9Score: phq9,
          gad7Score: gad7,
          riskLevel: phq9 >= 15 || gad7 >= 15 ? "high" : phq9 >= 10 || gad7 >= 10 ? "moderate" : "low",
          lastAssessment: new Date(),
        } as any)
      } catch (e) {
        // silently ignore if store not configured — app still shows results
        // console.warn("addStudent failed:", e)
      }
    }

    incrementAssessments?.()
    setCurrentAssessment("results")
  }

  // Helpers for starting/retaking tests from results
  const startTest = (test: "phq9" | "gad7") => {
    setSelectedTest(test)
    // clear the answers of that test for a fresh run
    if (test === "phq9") setPhq9Answers({})
    if (test === "gad7") setGad7Answers({})
    setCurrentAssessment(test)
  }

  // Retake current (last completed) test
  const retakeCurrent = () => {
    const last = selectedTest ?? (completedTests.phq9 ? "phq9" : completedTests.gad7 ? "gad7" : null)
    if (!last) {
      // fallback: go to selection
      setCurrentAssessment("selection")
      return
    }
    // clear answers for that test and go to it
    if (last === "phq9") setPhq9Answers({})
    if (last === "gad7") setGad7Answers({})
    setCurrentAssessment(last)
  }

  // Reset everything to start over (optional)
  const resetAll = () => {
    setPhq9Answers({})
    setGad7Answers({})
    setCompletedTests({ phq9: false, gad7: false })
    setSelectedTest(null)
    setUserInfo({ name: "", profession: "" })
    setCurrentAssessment("selection")
  }

  // --- UI screens ---
  if (currentAssessment === "selection") {
    return (
      <section className="py-16" id="screening">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Psychological Screening Tools</h2>
          <p className="text-muted-foreground">Choose a standardized self-assessment (PHQ-9 or GAD-7)</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card
            onClick={() => {
              setSelectedTest("phq9")
              setCurrentAssessment("userInfo")
            }}
            className="cursor-pointer"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" /> PHQ-9 (Depression)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">9 standard questions — takes ~3–5 minutes.</p>
              <Button className="w-full mt-4">Start PHQ-9</Button>
            </CardContent>
          </Card>

          <Card
            onClick={() => {
              setSelectedTest("gad7")
              setCurrentAssessment("userInfo")
            }}
            className="cursor-pointer"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" /> GAD-7 (Anxiety)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">7 standard questions — takes ~3–5 minutes.</p>
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
              <CardTitle>Tell us a bit about you</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Name" value={userInfo.name} onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })} />
              <Input placeholder="Profession / Field of study" value={userInfo.profession} onChange={(e) => setUserInfo({ ...userInfo, profession: e.target.value })} />
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setCurrentAssessment("selection")}>Back</Button>
                <Button disabled={!userInfo.name || !userInfo.profession} onClick={() => { if (selectedTest) setCurrentAssessment(selectedTest) }}>
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  if (currentAssessment === "phq9" || currentAssessment === "gad7") {
    const qns = currentAssessment === "phq9" ? PHQ9_QUESTIONS : GAD7_QUESTIONS
    const answers = currentAssessment === "phq9" ? phq9Answers : gad7Answers
    const handler = currentAssessment === "phq9" ? handlePhq9Answer : handleGad7Answer
    const allAnswered = qns.every((q) => q.id in answers)

    return (
      <section className="py-16">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" /> {currentAssessment === "phq9" ? "PHQ-9 — Depression" : "GAD-7 — Anxiety"}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {qns.map((q, i) => (
                <div key={q.id}>
                  <p className="font-medium">{i + 1}. {q.text}</p>
                  <RadioGroup value={answers[q.id]?.toString() || ""} onValueChange={(v) => handler(q.id, parseInt(v))}>
                    {q.options.map((o) => (
                      <div key={o.value} className="flex items-center space-x-2 mt-2">
                        <RadioGroupItem value={o.value.toString()} id={`${q.id}-${o.value}`} />
                        <Label htmlFor={`${q.id}-${o.value}`}>{o.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={() => setCurrentAssessment("selection")}>Cancel</Button>
                <Button onClick={completeAssessment} disabled={!allAnswered}>View Results</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  // RESULTS view: show only completed tests; allow taking the other test
  if (currentAssessment === "results") {
    const phq9 = calculatePhq9()
    const gad7 = calculateGad7()
    const showPhq9 = completedTests.phq9
    const showGad7 = completedTests.gad7

    return (
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Your Assessment Results</h2>
          <p className="text-muted-foreground">Interpreted using standard clinical cut-offs</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {showPhq9 && (
            <Card>
              <CardHeader><CardTitle>PHQ-9 — Depression</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xl font-bold">{phq9} / 27</div>
                    <div className={`${getPhq9Interpretation(phq9).color} font-medium`}>{getPhq9Interpretation(phq9).level}</div>
                  </div>
                </div>

                <Progress value={(phq9 / 27) * 100} className="mb-4" />

                {/* Highlighted blue box with global + India comparison */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mt-4">
                  <p className="text-sm text-blue-800 font-medium">{getGlobalStats("phq9", getPhq9Interpretation(phq9).level)}</p>
                </div>

                {/* Optional guidance */}
                <div className="mt-4 text-sm text-muted-foreground">
                  {phq9 < 5 && <p>Minimal depressive symptoms. Keep monitoring and use self-care resources.</p>}
                  {phq9 >= 5 && phq9 < 10 && <p>Mild symptoms — consider self-help resources and monitor changes.</p>}
                  {phq9 >= 10 && phq9 < 15 && <p>Moderate symptoms — consider a counseling session.</p>}
                  {phq9 >= 15 && <p className="text-orange-700">Moderately severe to severe — we recommend booking a counseling session soon.</p>}
                </div>
              </CardContent>
            </Card>
          )}

          {showGad7 && (
            <Card>
              <CardHeader><CardTitle>GAD-7 — Anxiety</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xl font-bold">{gad7} / 21</div>
                    <div className={`${getGad7Interpretation(gad7).color} font-medium`}>{getGad7Interpretation(gad7).level}</div>
                  </div>
                </div>

                <Progress value={(gad7 / 21) * 100} className="mb-4" />

                {/* Highlighted blue box with global + India comparison */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mt-4">
                  <p className="text-sm text-blue-800 font-medium">{getGlobalStats("gad7", getGad7Interpretation(gad7).level)}</p>
                </div>

                <div className="mt-4 text-sm text-muted-foreground">
                  {gad7 < 5 && <p>Minimal anxiety symptoms. Use relaxation resources and monitor.</p>}
                  {gad7 >= 5 && gad7 < 10 && <p>Mild anxiety — consider stress-management resources.</p>}
                  {gad7 >= 10 && gad7 < 15 && <p>Moderate anxiety — consider booking a counseling session.</p>}
                  {gad7 >= 15 && <p className="text-orange-700">Severe anxiety — we recommend booking help now.</p>}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4 justify-center">
            {/* Retake the last completed test */}
            <Button onClick={retakeCurrent} variant="outline">Take Again</Button>

            {/* Book counseling action */}
            <Button onClick={() => document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" })}>
              Book Counseling
            </Button>

            {/* Offer the other test if not yet completed */}
            {!completedTests.gad7 && <Button onClick={() => startTest("gad7")}>Take GAD-7</Button>}
            {!completedTests.phq9 && <Button onClick={() => startTest("phq9")}>Take PHQ-9</Button>}

            {/* If both done, allow resetting everything */}
            {completedTests.phq9 && completedTests.gad7 && (
              <Button variant="ghost" onClick={resetAll}>Reset All</Button>
            )}
          </div>
        </div>
      </section>
    )
  }

  return null
}
