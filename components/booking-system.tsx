"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/store"

interface Counselor {
  id: string
  name: string
  title: string
  specialization: string
  avatar: string
  available: boolean
  nextAvailable?: string
  pincodes: string[]
}

const counselors: Counselor[] = [
  { id: "1", name: "Dr. Priya Sharma", title: "Clinical Psychologist", specialization: "Anxiety & Stress Management", avatar: "PS", available: true, pincodes: ["492001", "492002"] },
  { id: "2", name: "Mr. Rahul Verma", title: "Counseling Psychologist", specialization: "Academic Stress & Relationships", avatar: "RV", available: true, pincodes: ["492003", "492004"] },
  { id: "3", name: "Dr. Anita Desai", title: "Senior Counselor", specialization: "Depression & Trauma Support", avatar: "AD", available: false, nextAvailable: "Tomorrow", pincodes: ["492005", "492006"] },
  { id: "4", name: "Ms. Kavita Singh", title: "Wellness Coach", specialization: "Mindfulness & Self-care", avatar: "KS", available: true, pincodes: ["492007", "492008"] },
  { id: "5", name: "Dr. Manish Gupta", title: "Psychiatrist", specialization: "Medication & Severe Disorders", avatar: "MG", available: true, pincodes: ["492009", "492010"] },
  { id: "6", name: "Dr. Neha Patil", title: "Child Psychologist", specialization: "Child & Adolescent Issues", avatar: "NP", available: true, pincodes: ["492001", "492003"] },
  { id: "7", name: "Dr. Ashok Mehta", title: "Clinical Psychologist", specialization: "Cognitive Behavioral Therapy (CBT)", avatar: "AM", available: true, pincodes: ["492004", "492006"] },
  { id: "8", name: "Ms. Ritu Tiwari", title: "Counseling Psychologist", specialization: "Career & Exam Stress", avatar: "RT", available: false, nextAvailable: "Day after Tomorrow", pincodes: ["492007", "492009"] },
  { id: "9", name: "Dr. Suresh Yadav", title: "Psychiatrist", specialization: "Bipolar & Schizophrenia", avatar: "SY", available: true, pincodes: ["492008", "492010"] },
  { id: "10", name: "Ms. Anjali Dubey", title: "Wellness Therapist", specialization: "Yoga & Lifestyle Counseling", avatar: "AD", available: true, pincodes: ["492002", "492005"] },
]

export default function BookingSystem() {
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [pincode, setPincode] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    aadhaar: "",
    address: "",
    mode: "",
    problem: "",
    gadScore: "",
    phqScore: "",
    date: "",
    time: "",
  })

  const incrementBookings = useAppStore((state) => state.incrementBookings)
  const today = new Date().toISOString().split("T")[0]

  const handleBookCounselor = (c: Counselor) => {
    if (!c.available) return
    setSelectedCounselor(c)
    setShowBookingForm(true)
  }

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault()
    incrementBookings()
    alert(
      `Booking confirmed with ${selectedCounselor?.name} on ${formData.date} at ${formData.time}.`
    )
    setShowBookingForm(false)
    setSelectedCounselor(null)
  }

  const filteredCounselors = pincode
    ? counselors.filter((c) => c.pincodes.includes(pincode))
    : counselors

  return (
    <section className="py-16">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">Book a Confidential Session</h2>
        <p className="text-muted-foreground">Enter your pincode to see nearby counselors</p>
        <Input
          placeholder="Enter Pincode"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          className="max-w-xs mx-auto mt-4"
        />
      </div>

      {!showBookingForm ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCounselors.map((c) => (
            <Card
              key={c.id}
              onClick={() => handleBookCounselor(c)}
              className="cursor-pointer transition hover:shadow-lg hover:scale-105"
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center text-lg font-bold text-primary-foreground">
                  {c.avatar}
                </div>
                <h4 className="font-semibold text-lg">{c.name}</h4>
                <p className="text-muted-foreground">{c.title}</p>
                <p className="text-sm text-muted-foreground mb-2">{c.specialization}</p>
                <Badge variant={c.available ? "default" : "secondary"}>
                  {c.available ? "Available Today" : `Next: ${c.nextAvailable}`}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle>Book with {selectedCounselor?.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitBooking} className="space-y-5">
              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Age</label>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gender</label>
                  <Input
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Aadhaar Number</label>
                  <Input
                    value={formData.aadhaar}
                    onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Address & Mode */}
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mode of Treatment</label>
                <select
                  value={formData.mode}
                  onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                  className="w-full p-2 border rounded-md bg-background"
                  required
                >
                  <option value="">Select mode</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              {/* Problem & Scores */}
              <div>
                <label className="block text-sm font-medium mb-1">Problem Description</label>
                <Textarea
                  value={formData.problem}
                  onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                  className="min-h-24"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">GAD Score</label>
                  <Input
                    value={formData.gadScore}
                    onChange={(e) => setFormData({ ...formData, gadScore: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">PHQ Score</label>
                  <Input
                    value={formData.phqScore}
                    onChange={(e) => setFormData({ ...formData, phqScore: e.target.value })}
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Preferred Date</label>
                  <Input
                    type="date"
                    min={today}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Preferred Time</label>
                  <select
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full p-2 border rounded-md bg-background"
                    required
                  >
                    <option value="">Select time</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="01:00 PM">01:00 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                    <option value="06:00 PM">06:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-2">
                <Button type="submit" className="flex-1">Confirm Booking</Button>
                <Button type="button" variant="outline" onClick={() => setShowBookingForm(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </section>
  )
}

