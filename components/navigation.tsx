"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, AlertTriangle, Shield, LogOut } from "lucide-react"

export default function Navigation({ onAdminLogin, isAdmin, onAdminLogout }: any) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" })
    setIsMenuOpen(false)
  }

  const showEmergencyModal = () => {
    const modal = document.getElementById("emergency-modal")
    if (modal) {
      modal.classList.add("active")
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="text-2xl">🧠</div>
            <span className="text-xl font-bold text-primary">MindCare Campus</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <button onClick={() => scrollToSection("home")} className="hover:text-primary">Home</button>
            <button onClick={() => scrollToSection("chat")} className="hover:text-primary">AI Support</button>
            <button onClick={() => scrollToSection("booking")} className="hover:text-primary">Book Session</button>
            <button onClick={() => scrollToSection("resources")} className="hover:text-primary">Resources</button>
            <button onClick={() => scrollToSection("forum")} className="hover:text-primary">Peer Support</button>
            {/* ✅ Added Assessment */}
            <button onClick={() => scrollToSection("screening")} className="hover:text-primary">Assessment</button>
          </div>

          {/* Right Side Buttons */}
          <div className="flex items-center space-x-4">
            <Button onClick={showEmergencyModal} variant="destructive" size="sm">
              <AlertTriangle className="w-4 h-4 mr-1" /> Crisis Help
            </Button>

            {isAdmin ? (
              <Button onClick={onAdminLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-1" /> Logout Admin
              </Button>
            ) : (
              <Button onClick={onAdminLogin} variant="outline" size="sm">
                <Shield className="w-4 h-4 mr-1" /> As Admin
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Items */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-background shadow-md flex flex-col space-y-4 p-4 md:hidden">
          <button onClick={() => scrollToSection("home")} className="hover:text-primary">Home</button>
          <button onClick={() => scrollToSection("chat")} className="hover:text-primary">AI Support</button>
          <button onClick={() => scrollToSection("booking")} className="hover:text-primary">Book Session</button>
          <button onClick={() => scrollToSection("resources")} className="hover:text-primary">Resources</button>
          <button onClick={() => scrollToSection("forum")} className="hover:text-primary">Peer Support</button>
          {/* ✅ Added Assessment in mobile menu too */}
          <button onClick={() => scrollToSection("screening")} className="hover:text-primary">Assessment</button>
        </div>
      )}
    </nav>
  )
}
