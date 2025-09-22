"use client"

import Navigation from "@/components/navigation"
import HeroSection from "@/components/hero-section"
import PeerSupportForum from "@/components/peer-support-forum"
import EmergencyModal from "@/components/emergency-modal"
import BackgroundAnimation from "@/components/background-animation"
import { useAppStore } from "@/lib/store"
import FeaturesGrid from "@/components/features-grid"
import ChatbotPopup from "@/components/chat-popup"
import AdminDashboard from "@/components/admin-dashboard"
import AuthListener from "@/components/AuthListner"  // ✅ new file

export default function Home() {
  const isAdminAuthenticated = useAppStore((state) => state.isAdminAuthenticated)

  return (
    <main className="min-h-screen bg-background relative overflow-x-hidden">
      <BackgroundAnimation />
      <Navigation />

      {/* 🔥 Always mounted - auth se check karega */}
      <AuthListener />

      <div className="container mx-auto px-4 py-8 space-y-16">
        <HeroSection />
        <FeaturesGrid />

        <section id="forum">
          <PeerSupportForum />
        </section>

        {isAdminAuthenticated && <AdminDashboard />}
      </div>

      <EmergencyModal />
      <ChatbotPopup />
    </main>
  )
}
