"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import HeroSection from "@/components/hero-section"
import FeaturesGrid from "@/components/features-grid"
import AiChatInterface from "@/components/ai-chat-interface"
import BookingSystem from "@/components/booking-system"
import ResourcesHub from "@/components/resources-hub"
import PeerSupportForum from "@/components/peer-support-forum"
import AdminDashboard from "@/components/admin-dashboard"
import EmergencyModal from "@/components/emergency-modal"
import BackgroundAnimation from "@/components/background-animation"
import AdminLoginModal from "@/components/admin-login-modal"

export default function Home() {
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  return (
    <main className="min-h-screen bg-background relative overflow-x-hidden">
      <BackgroundAnimation />
      <Navigation onAdminLogin={() => setShowAdminLogin(true)} isAdmin={isAdmin} onAdminLogout={() => setIsAdmin(false)} />

      <div className="container mx-auto px-4 py-8 space-y-16">
        <HeroSection />
        <FeaturesGrid />
        <AiChatInterface />
        <BookingSystem />
        <ResourcesHub />
        <PeerSupportForum />
        {isAdmin && <AdminDashboard />} {/* ✅ Only show if admin logged in */}
      </div>

      <EmergencyModal />

      <AdminLoginModal
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onSuccess={() => setIsAdmin(true)}   // ✅ sets admin true
      />
    </main>
  )
}

