"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, AlertTriangle, LogIn } from "lucide-react"

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
    { href: "/", label: "Home", scroll: false },
    { href: "/assessment", label: "Assessment" },
    { href: "/booking", label: "Book Session" },
    { href: "/resources", label: "Resources" },
    { href: "/forum", label: "Peer Support" },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-16">
          {/* Left Logo */}
          <Link href="/" scroll={false} className="flex items-center space-x-2">
            <div className="text-2xl">🧠</div>
            <span className="text-xl font-bold text-primary">MindCare Campus</span>
          </Link>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center space-x-6 mx-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                scroll={item.scroll === false ? false : true}
                className={`relative transition-colors duration-200 ${
                  pathname === item.href
                    ? "text-primary font-medium after:w-full"
                    : "text-foreground hover:text-primary after:w-0"
                } 
                after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] 
                after:bg-primary after:transition-all after:duration-300 hover:after:w-full`}
              >
                {item.label}
              </Link>
            ))}

            {/* Crisis Help Button */}
            <Button
              onClick={showEmergencyModal}
              variant="destructive"
              size="sm"
              className="flex items-center space-x-1"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Crisis Help</span>
            </Button>

            {/* Login Button */}
            <Button
              asChild
              size="sm"
              className="flex items-center space-x-1 bg-primary text-white hover:bg-primary/90"
            >
              <Link href="/login">
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
            </Button>
          </div>

          {/* Right - Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 ml-auto"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  scroll={item.scroll === false ? false : true}
                  onClick={() => setIsMenuOpen(false)}
                  className={`relative py-2 transition-colors duration-200 ${
                    pathname === item.href
                      ? "text-primary font-medium after:w-full"
                      : "text-foreground hover:text-primary after:w-0"
                  } 
                  after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] 
                  after:bg-primary after:transition-all after:duration-300 hover:after:w-full`}
                >
                  {item.label}
                </Link>
              ))}

              {/* Crisis Help (Mobile) */}
              <Button
                onClick={() => {
                  showEmergencyModal()
                  setIsMenuOpen(false)
                }}
                variant="destructive"
                size="sm"
                className="w-full flex items-center justify-center space-x-1"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Crisis Help</span>
              </Button>

              {/* Login (Mobile) */}
              <Button
                asChild
                size="sm"
                className="w-full flex items-center justify-center space-x-1 bg-primary text-white hover:bg-primary/90"
              >
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
