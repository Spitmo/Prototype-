"use client"

import Navigation from "@/components/navigation"
import ResourcesHub from "@/components/resources-hub"
import EmergencyModal from "@/components/emergency-modal"
import BackgroundAnimation from "@/components/background-animation"

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-background relative overflow-x-hidden">
      <BackgroundAnimation />
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <ResourcesHub />
      </div>

      <EmergencyModal />
    </main>
  )
}
