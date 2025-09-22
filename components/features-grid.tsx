"use client"

import { Card, CardContent } from "@/components/ui/card"

export default function FeaturesGrid() {
  const scrollToPeerSupport = () => {
    document.getElementById("peer-support")?.scrollIntoView({ behavior: "smooth" })
  }

  const features = [
    {
      title: "AI-Guided First Aid",
      desc: "24/7 intelligent chatbot offering immediate coping strategies and professional referrals when needed.",
      icon: "💬",
      link: "/chat",
    },
    {
      title: "Confidential Booking",
      desc: "Secure appointment scheduling with on-campus counselors. Complete privacy guaranteed.",
      icon: "📅",
      link: "/booking",
    },
    {
      title: "Resource Hub",
      desc: "Videos, audio guides, and wellness materials available in multiple regional languages.",
      icon: "📚",
      link: "/resources",
    },
    {
      title: "Peer Support",
      desc: "Moderated forums with trained student volunteers for community support.",
      icon: "👥",
      isScroll: true, // 👈 special flag
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 max-w-5xl mx-auto">
      {features.map((f, i) => (
        <div
          key={i}
          onClick={() => {
            if (f.isScroll) {
              scrollToPeerSupport()
            } else if (f.link) {
              window.location.href = f.link
            }
          }}
          className="h-full"
        >
          <Card className="cursor-pointer h-64 flex items-center justify-center text-center transition transform hover:scale-105 hover:shadow-2xl rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center h-full p-6">
              <span className="text-6xl mb-4">{f.icon}</span>
              <h3 className="text-xl font-bold">{f.title}</h3>
              <p className="text-sm text-gray-600 mt-2">{f.desc}</p>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}
