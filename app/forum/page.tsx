"use client"

import Navigation from "@/components/navigation"
import PeerSupportForum from "@/components/peer-support-forum"
import EmergencyModal from "@/components/emergency-modal"
import BackgroundAnimation from "@/components/background-animation"

export default function ForumPage() {
  return (
    <main className="min-h-screen bg-background relative overflow-x-hidden">
      <BackgroundAnimation />
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <PeerSupportForum />
      </div>

      <EmergencyModal />
    </main>
  )
}
