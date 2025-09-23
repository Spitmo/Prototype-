"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User } from "lucide-react"
import { useAppStore } from "@/lib/store"
import PhoneAuthPopup from "./PhoneAuthPopup"  // ✅ import popup

interface Counselor {
  id: string
  name: string
  title: string
  specialization: string
  avatar: string
  available: boolean
  nextAvailable?: string
}

const counselors: Counselor[] = [
  {
    id: "1",
    name: "Dr. Priya Sharma",
    title: "Clinical Psychologist",
    specialization: "Anxiety & Stress Management",
    avatar: "PS",
    available: true,
  },
  {
    id: "2",
    name: "Mr. Rahul Verma",
    title: "Counseling Psychologist",
    specialization: "Academic Stress & Relationships",
    avatar: "RV",
    available: true,
  },
  {
    id: "3",
    name: "Dr. Anita Desai",
    title: "Senior Counselor",
    specialization: "Depression & Trauma Support",
    avatar: "AD",
    available: false,
    nextAvailable: "Tomorrow",
  },
  {
    id: "4",
    name: "Ms. Kavita Singh",
    title: "Wellness Coach",
    specialization: "Mindfulness & Self-care",
    avatar: "KS",
    available: true,
  },
]

export default function BookingSystem() {
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [formData, setFormData] = useState({ date: "", time: "", description: "" })
  const [otpVerified, setOtpVerified] = useState(false) // ✅ new state
  const [showOtpPopup, setShowOtpPopup] = useState(false)

  const incrementBookings = useAppStore((state) => state.incrementBookings)

  const handleBookCounselor = (counselor: Counselor) => {
    if (!otpVerified) {
      setShowOtpPopup(true)
      return
    }
    if (!counselor.available) return
    setSelectedCounselor(counselor)
    setShowBookingForm(true)
  }

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault()
    incrementBookings()
    alert(
      `Booking confirmed with ${selectedCounselor?.name}! You will receive a confirmation email shortly. Remember, all sessions are completely confidential.`
    )
    setShowBookingForm(false)
    setSelectedCounselor(null)
    setFormData({ date: "", time: "", description: "" })
  }

  const today = new Date().toISOString().split("T")[0]

  return (
    <section id="booking" className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-black">📅 Session Booking</h2>
        <p className="text-muted-foreground text-lg">Verify phone and book confidential sessions with our counselors</p>
        {!otpVerified && (
          <Button className="mt-4" onClick={() => setShowOtpPopup(true)}>
            Verify Phone to Book
          </Button>
        )}
      </div>

      {/* 🔹 Show counselors only after OTP verified */}
      {otpVerified && !showBookingForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {counselors.map((counselor) => (
            <Card
              key={counselor.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                counselor.available ? "hover:scale-105" : "opacity-75"
              }`}
              onClick={() => handleBookCounselor(counselor)}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {counselor.avatar}
                </div>
                <h4 className="font-semibold text-lg mb-1">{counselor.name}</h4>
                <p className="text-muted-foreground mb-2">{counselor.title}</p>
                <p className="text-sm text-muted-foreground mb-4">{counselor.specialization}</p>
                <Badge
                  variant={counselor.available ? "default" : "secondary"}
                  className={counselor.available ? "bg-green-100 text-green-800" : ""}
                >
                  {counselor.available ? "Available Today" : `Next Available: ${counselor.nextAvailable}`}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 🔹 Show booking form */}
      {otpVerified && showBookingForm && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Book Appointment with {selectedCounselor?.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitBooking} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Selected Counselor</label>
                <Input value={selectedCounselor?.name || ""} readOnly className="bg-muted" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Preferred Date
                  </label>
                  <Input
                    type="date"
                    min={today}
                    value={formData.date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Preferred Time
                  </label>
                  <select
                    className="w-full p-2 border border-border rounded-md bg-background"
                    value={formData.time}
                    onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                    required
                  >
                    <option value="">Select time</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Brief Description (Optional)</label>
                <Textarea
                  placeholder="Share what you'd like to discuss..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="min-h-20"
                />
              </div>

              <div className="flex space-x-4">
                <Button type="submit" className="flex-1">
                  Confirm Booking
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBookingForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 🔹 OTP Popup */}
      {showOtpPopup && (
        <PhoneAuthPopup
          onVerified={() => {
            setOtpVerified(true)
            setShowOtpPopup(false)
          }}
          onClose={() => setShowOtpPopup(false)}
        />
      )}
    </section>
  )
}
