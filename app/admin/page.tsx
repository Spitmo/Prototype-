"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import AdminDashboard from "@/components/admin-dashboard"
import EmergencyModal from "@/components/emergency-modal"
import BackgroundAnimation from "@/components/background-animation"
import AdminLoginModal from "@/components/admin-login-modal"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Shield, LogOut } from "lucide-react"

export default function AdminPage() {
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

      <div className="container mx-auto px-4 py-8">
        {isAdminAuthenticated ? (
          <AdminDashboard />
        ) : (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
              <p className="text-muted-foreground mb-6">Please log in to access the admin dashboard.</p>
              <Button onClick={() => setShowAdminLogin(true)}>
                <Shield className="h-4 w-4 mr-2" />
                Admin Login
              </Button>
            </div>
          </div>
        )}
      </div>

      <EmergencyModal />
      <AdminLoginModal isOpen={showAdminLogin} onClose={() => setShowAdminLogin(false)} />
    </main>
  )
}
