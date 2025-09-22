"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, AlertTriangle, LogOut, User } from "lucide-react"
import LoginModal from "@/components/Loginmodel"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, signOut } from "firebase/auth"

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      setUser(null)
    } catch (error) {
      console.error("Logout Error:", error)
    }
  }

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
    <>
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

              {/* ✅ Show login OR logout */}
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-foreground">{user.email}</span>
                  <Button
                    onClick={handleLogout}
                    size="sm"
                    className="flex items-center space-x-2 bg-emerald-400 text-white px-4 py-1.5 rounded-full shadow-md hover:bg-emerald-500 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  className="flex items-center space-x-2 bg-emerald-400 text-white px-4 py-1.5 rounded-full shadow-md hover:bg-emerald-500 transition-all"
                  onClick={() => setIsLoginOpen(true)}
                >
                  <User className="w-4 h-4" />
                  <span>Login / Sign Up</span>
                </Button>
              )}
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

                {/* ✅ Mobile: Show login OR logout */}
                {user ? (
                  <div className="flex flex-col space-y-2">
                    <span className="text-sm text-center text-foreground">
                      {user.email}
                    </span>
                    <Button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      size="sm"
                      className="w-full flex items-center justify-center space-x-2 bg-emerald-400 text-white rounded-full shadow-md hover:bg-emerald-500 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    className="w-full flex items-center justify-center space-x-2 bg-emerald-400 text-white rounded-full shadow-md hover:bg-emerald-500 transition-all"
                    onClick={() => {
                      setIsLoginOpen(true)
                      setIsMenuOpen(false)
                    }}
                  >
                    <User className="w-4 h-4" />
                    <span>Login / Sign Up</span>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ✅ Login Modal Render */}
      <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  )
}
