"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/store"
import { db, auth } from "@/lib/firebase"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"

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
  const [cityInfo, setCityInfo] = useState("")   // ✅ new: store city/state for display
  const [locLoading, setLocLoading] = useState(false)
  const [locError, setLocError] = useState<string | null>(null)
  const lastLocTsRef = useRef<number | null>(null)

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
    if (!c.available) {
      alert("This counselor is not available right now.")
      return
    }
    setSelectedCounselor(c)
    setShowBookingForm(true)
  }

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault()
    incrementBookings()
    alert(`Booking confirmed with ${selectedCounselor?.name} on ${formData.date} at ${formData.time}.`)
    setShowBookingForm(false)
    setSelectedCounselor(null)
  }

  const filteredCounselors = pincode
    ? counselors.filter((c) => c.pincodes.includes(pincode))
    : counselors

  // ✅ Nominatim reverse geocoding
  async function reverseGeocode(lat: number, lon: number) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lon)}&addressdetails=1&zoom=18&email=${encodeURIComponent("onlystudy2096@gmail.com")}`

    const res = await fetch(url)
    if (!res.ok) throw new Error("Reverse geocode failed")
    const data = await res.json()
    return data
  }

  async function saveLocationToFirestore(payload: {
    userId?: string | null
    lat: number
    lon: number
    postalCode?: string
    city?: string
    state?: string
    country?: string
  }) {
    try {
      await addDoc(collection(db, "locations"), {
        userId: payload.userId || null,
        lat: payload.lat,
        lon: payload.lon,
        postalCode: payload.postalCode || null,
        city: payload.city || null,
        state: payload.state || null,
        country: payload.country || null,
        createdAt: serverTimestamp(),
      })
    } catch (err) {
      console.error("Failed saving location to firestore:", err)
    }
  }

  async function useMyLocation() {
    setLocError(null)

    if (!("geolocation" in navigator)) {
      setLocError("Geolocation not supported by this browser.")
      return
    }

    setLocLoading(true)

    if (lastLocTsRef.current && Date.now() - lastLocTsRef.current < 1000) {
      setLocLoading(false)
      return
    }
    lastLocTsRef.current = Date.now()

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude
          const lon = pos.coords.longitude

          const geo = await reverseGeocode(lat, lon)
          const postalCode = geo?.address?.postcode || ""
          const city = geo?.address?.city || geo?.address?.town || geo?.address?.village || ""
          const state = geo?.address?.state || ""
          const country = geo?.address?.country || ""

          if (postalCode) {
            setPincode(postalCode)
            setCityInfo(`${city}, ${state}`)   // ✅ show city/state beside input
          } else {
            setLocError("Could not determine postal code from your location. Please enter pincode manually.")
          }

          const userId = auth.currentUser?.uid || localStorage.getItem("guestUserId") || null
          await saveLocationToFirestore({ userId, lat, lon, postalCode, city, state, country })

          localStorage.setItem(
            "lastLocation",
            JSON.stringify({ ts: Date.now(), lat, lon, postalCode, city, state, country })
          )
        } catch (err: any) {
          console.error(err)
          setLocError("Reverse geocoding failed. Try again or enter pincode manually.")
        } finally {
          setLocLoading(false)
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setLocError("Location access denied. Please enter pincode manually.")
        } else {
          setLocError("Unable to retrieve location. Try again.")
        }
        setLocLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  return (
    <section className="py-16">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">Book a Confidential Session</h2>
        <p className="text-muted-foreground">Enter your pincode to see nearby counselors</p>

        <div className="flex items-center justify-center gap-3 mt-4">
          <Input
            placeholder="Enter Pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={useMyLocation} disabled={locLoading}>
            {locLoading ? "Locating..." : "Use my location"}
          </Button>
        </div>

        {cityInfo && (
          <p className="text-sm text-gray-600 mt-2">
            📍 {cityInfo}
          </p>
        )}

        {locError && <p className="text-sm text-red-500 mt-2">{locError}</p>}
      </div>

      {!showBookingForm ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCounselors.map((c) => (
            <Card key={c.id} onClick={() => handleBookCounselor(c)} className="cursor-pointer transition hover:shadow-lg hover:scale-105">
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
              {/* your form fields remain same here */}
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
