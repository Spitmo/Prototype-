"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, AlertTriangle } from "lucide-react"

export default function Navigation() {
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
            <button
              onClick={() => scrollToSection("home")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("chat")}
              className="text-foreground hover:text-primary transition-colors"
            >
              AI Support
            </button>
            {/* 🔹 Go to new Screening Page */}
            <button
              onClick={() => (window.location.href = "/screening")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Assessment
            </button>
            <button
              onClick={() => scrollToSection("booking")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Book Session
            </button>
            <button
              onClick={() => scrollToSection("resources")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Resources
            </button>
            <button
              onClick={() => scrollToSection("forum")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Peer Support
            </button>
          </div>

          {/* Crisis Help + Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={showEmergencyModal}
              variant="destructive"
              size="sm"
              className="hidden md:flex items-center space-x-1"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Crisis Help</span>
            </Button>

            {/* Mobile Menu Button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => scrollToSection("home")}
                className="text-left py-2 text-foreground hover:text-primary transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("chat")}
                className="text-left py-2 text-foreground hover:text-primary transition-colors"
              >
                AI Support
              </button>
              {/* 🔹 Go to new Screening Page */}
              <button
                onClick={() => (window.location.href = "/screening")}
                className="text-left py-2 text-foreground hover:text-primary transition-colors"
              >
                Assessment
              </button>
              <button
                onClick={() => scrollToSection("booking")}
                className="text-left py-2 text-foreground hover:text-primary transition-colors"
              >
                Book Session
              </button>
              <button
                onClick={() => scrollToSection("resources")}
                className="text-left py-2 text-foreground hover:text-primary transition-colors"
              >
                Resources
              </button>
              <button
                onClick={() => scrollToSection("forum")}
                className="text-left py-2 text-foreground hover:text-primary transition-colors"
              >
                Peer Support
              </button>

              <Button onClick={showEmergencyModal} variant="destructive" size="sm" className="mt-2 w-full">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Crisis Help
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}





