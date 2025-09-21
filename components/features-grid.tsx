"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Calendar, BookOpen, Users, BarChart3 } from "lucide-react"

const features = [
  {
    icon: MessageCircle,
    title: "AI-Guided First Aid",
    description:
      "24/7 intelligent chatbot offering immediate coping strategies and professional referrals when needed.",
    onClick: () => document.getElementById("chat")?.scrollIntoView({ behavior: "smooth" }),
  },
  {
    icon: Calendar,
    title: "Confidential Booking",
    description: "Secure appointment scheduling with on-campus counselors. Complete privacy guaranteed.",
    onClick: () => document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" }),
  },
  {
    icon: BookOpen,
    title: "Resource Hub",
    description: "Videos, audio guides, and wellness materials available in multiple regional languages.",
    onClick: () => document.getElementById("resources")?.scrollIntoView({ behavior: "smooth" }),
  },
  {
    icon: Users,
    title: "Peer Support",
    description: "Moderated forums with trained student volunteers for community support.",
    onClick: () => document.getElementById("forum")?.scrollIntoView({ behavior: "smooth" }),
  },
  
]

export default function FeaturesGrid() {
  return (
    <section className="py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card
            key={index}
            className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 bg-card border-border"
            onClick={feature.onClick}
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">{feature.title}</h3>
              <p className="text-muted-foreground text-pretty">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
