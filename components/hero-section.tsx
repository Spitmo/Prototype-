"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MessageCircle, Calendar } from "lucide-react"

export default function HeroSection() {
  const router = useRouter()

  return (
    <section id="home" className="text-center py-20">
      <div className="max-w-4xl mx-auto">
        <div className="relative inline-block p-6 mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-white to-green-600 p-1 rounded-lg">
            <div className="bg-white rounded-lg h-full w-full"></div>
          </div>
          <div className="relative">
            <h1 className="h-33 text-4xl md:text-6xl font-bold text-balance bg-gradient-to-b from-gray-800 via-black to-gray-600 bg-clip-text text-transparent">
              MindCare - Every Thought Matters Here
            </h1>
          </div>
        </div>

        <p className="text-xl md:text-2xl text-muted-foreground mb-8 text-pretty">
          Confidential, Culturally-Sensitive, and Always Available Support for College Students
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* AI Chat Button */}
          <Button
            onClick={() => router.push("/chat")}
            size="lg"
            style={{
              backgroundColor: "#059669",
              color: "#ffffff",
              border: "none",
            }}
            className="hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Start AI Chat Support
          </Button>

          {/* Booking Button */}
          <Button
            onClick={() => router.push("/booking")}
            variant="outline"
            size="lg"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Book Counselor Session
          </Button>
        </div>
      </div>
    </section>
  )
}
