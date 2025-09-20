"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, AlertTriangle } from "lucide-react"

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const showEmergencyModal = () => {
    const modal = document.getElementById("emergency-modal")
    if (modal) {
      modal.classList.add("active")
    }
  }

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/chat", label: "AI Support" },
    { href: "/assessment", label: "Assessment" },
    { href: "/booking", label: "Book Session" },
    { href: "/resources", label: "Resources" },
    { href: "/forum", label: "Peer Support" },
    { href: "/admin", label: "Dashboard" },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl">🧠</div>
            <span className="text-xl font-bold text-primary">MindCare Campus</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors ${
                  pathname === item.href ? "text-primary font-medium" : "text-foreground hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

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
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-left py-2 transition-colors ${
                    pathname === item.href ? "text-primary font-medium" : "text-foreground hover:text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
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
