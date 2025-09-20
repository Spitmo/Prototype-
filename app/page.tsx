"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import HeroSection from "@/components/hero-section"
import AIChatInterface from "@/components/ai-chat-interface"
import PeerSupportForum from "@/components/peer-support-forum"
import EmergencyModal from "@/components/emergency-modal"
import BackgroundAnimation from "@/components/background-animation"
import AdminLoginModal from "@/components/admin-login-modal"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Shield, LogOut } from "lucide-react"


export default function Home() {
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const isAdminAuthenticated = useAppStore((state) => state.isAdminAuthenticated)
  const logoutAdmin = useAppStore((state) => state.logoutAdmin)

  const handleAdminLogout = () => {
    logoutAdmin()
  }

  return (
    <main className="min-h-screen bg-background relative overflow-x-hidden">
      <BackgroundAnimation />
      <Navigation />

      <div className="fixed top-4 right-4 z-50">
        {isAdminAuthenticated ? (
          <Button
            onClick={handleAdminLogout}
            variant="outline"
            size="sm"
            className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout Admin
          </Button>
        ) : (
          <Button
            onClick={() => setShowAdminLogin(true)}
            variant="outline"
            size="sm"
            className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
          >
            <Shield className="h-4 w-4 mr-2" />
            As Admin
          </Button>
        )}
      </div>

      <div className="container mx-auto px-4 py-8 space-y-16">
        <HeroSection />
        <section id="chat">
          <AIChatInterface />
        </section>
        <section id="forum">
          <PeerSupportForum />
        </section>
      </div>

      <EmergencyModal />
      <AdminLoginModal isOpen={showAdminLogin} onClose={() => setShowAdminLogin(false)} />
    </main>
  )
}
