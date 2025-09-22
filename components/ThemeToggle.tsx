"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  // ✅ load saved theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null
    if (saved) {
      setTheme(saved)
      document.documentElement.classList.toggle("dark", saved === "dark")
    }
  }, [])

  // ✅ apply theme changes
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 p-2 rounded-full bg-gray-200 dark:bg-gray-800 shadow hover:scale-105 transition"
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-gray-800" />
      ) : (
        <Sun className="w-5 h-5 text-yellow-400" />
      )}
    </button>
  )
}
