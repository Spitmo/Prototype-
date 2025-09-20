"use client"

import Navigation from "@/components/navigation"
import BookingSystem from "@/components/booking-system"
import EmergencyModal from "@/components/emergency-modal"
import BackgroundAnimation from "@/components/background-animation"

export default function BookingPage() {
  return (
    <main className="min-h-screen bg-background relative overflow-x-hidden">
      <BackgroundAnimation />
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <BookingSystem />
      </div>

      <EmergencyModal />
    </main>
  )
}
