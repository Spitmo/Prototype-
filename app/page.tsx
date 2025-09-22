"use client"

import { useState, useEffect } from "react"
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
import PsychologicalScreening from "@/components/psychological-screening"
import AdminLoginModal from "@/components/admin-login-modal"
import AuthForm from "@/components/authform"
import { Button } from "@/components/ui/button"
import { Shield, LogOut, User } from "lucide-react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { useAppStore } from "@/lib/store"

export default function Home() {
  // 🔹 Admin state from store
  const isAdminAuthenticated = useAppStore((state) => state.isAdminAuthenticated)
  const loginAdmin = useAppStore((state) => state.authenticateAdmin)
  const logoutAdmin = useAppStore((state) => state.logoutAdmin)

  // 🔹 Auth state
  const [user, setUser] = useState<any>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [loadingAuth, setLoadingAuth] = useState(true)
  const [showAdminLogin, setShowAdminLogin] = useState(false)

  // 🔹 Track Firebase auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setShowAuthModal(!currentUser)
      setLoadingAuth(false)
    })
    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setShowAuthModal(true)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const handleAdminLogout = () => {
    logoutAdmin()
    setShowAdminLogin(false)
  }

  if (loadingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background relative overflow-x-hidden">
      <BackgroundAnimation />
      <Navigation />

      {/* 🔹 Top-right Auth + Admin buttons */}
      <div className="fixed top-4 right-4 z-50 flex space-x-2">
        {!user ? (
          <Button
            onClick={() => setShowAuthModal(true)}
            variant="outline"
            size="sm"
            className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            <User className="h-4 w-4 mr-2" />
            Login / Sign Up
          </Button>
        ) : (
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        )}

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
            Admin Login
          </Button>
        )}
      </div>

      {/* 🔹 Auth modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <AuthForm onSuccess={() => setShowAuthModal(false)} />
            <Button
              onClick={() => setShowAuthModal(false)}
              variant="ghost"
              className="w-full mt-4"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* 🔹 Main content */}
      <div className="container mx-auto px-4 py-8 space-y-16">
        <HeroSection />
        <FeaturesGrid />
        <AiChatInterface />
        <PsychologicalScreening />
        <BookingSystem />
        <ResourcesHub />
        <PeerSupportForum />
        {isAdminAuthenticated && <AdminDashboard />}
      </div>

      <EmergencyModal />

      <AdminLoginModal
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onSuccess={loginAdmin}
      />
    </main>
  )
}
