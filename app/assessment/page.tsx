"use client"

import Navigation from "@/components/navigation"
import PsychologicalScreening from "@/components/psychological-screening"
import EmergencyModal from "@/components/emergency-modal"
import BackgroundAnimation from "@/components/background-animation"

export default function AssessmentPage() {
  return (
    <main className="min-h-screen bg-background relative overflow-x-hidden">
      <BackgroundAnimation />
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <PsychologicalScreening />
      </div>

      <EmergencyModal />
    </main>
  )
}
