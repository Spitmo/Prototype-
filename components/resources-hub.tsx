"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Headphones, FileText, Activity, Pause } from "lucide-react"
import { useAppStore } from "@/lib/store"
import AudioPlayer from "./audio-player"

interface Resource {
  id: string
  title: string
  duration: string
  language: string
  type: "video" | "audio" | "article" | "exercise"
  youtubeId?: string
  description?: string
  audioUrl?: string
}

const resources = {
  videos: [
    {
      id: "1",
      title: "Meditation Basics for Students",
      duration: "10 min",
      language: "Hindi/English",
      type: "video" as const,
      youtubeId: "ZToicYcHIOU",
      description: "Learn basic meditation techniques to reduce stress and improve focus",
    },
    {
      id: "2",
      title: "Stress Management Techniques",
      duration: "15 min",
      language: "Multiple Languages",
      type: "video" as const,
      youtubeId: "iN6g2mr0p3Q",
      description: "Practical strategies for managing academic and personal stress",
    },
    {
      id: "3",
      title: "Better Sleep for Students",
      duration: "8 min",
      language: "Hindi/English",
      type: "video" as const,
      youtubeId: "nm1TxQj9IsQ",
      description: "Tips and techniques for improving sleep quality and establishing healthy sleep habits",
    },
    {
      id: "4",
      title: "Dealing with Exam Anxiety",
      duration: "12 min",
      language: "Regional Languages",
      type: "video" as const,
      youtubeId: "LoQDKXkGrCw",
      description: "Overcome exam anxiety with proven techniques and mindset shifts",
    },
  ],
  audio: [
    {
      id: "5",
      title: "Guided Relaxation",
      duration: "20 min",
      language: "Hindi",
      type: "audio" as const,
      description: "Deep relaxation session to release tension and stress",
      audioUrl: "/audio/guided-relaxation.mp3?query=20-minute guided relaxation meditation for stress relief",
    },
    {
      id: "6",
      title: "Breathing Exercises",
      duration: "10 min",
      language: "Multiple Languages",
      type: "audio" as const,
      description: "Simple breathing techniques for instant calm and focus",
      audioUrl: "/audio/breathing-exercises.mp3?query=10-minute breathing exercises for anxiety and stress",
    },
    {
      id: "11",
      title: "Sleep Meditation",
      duration: "15 min",
      language: "English",
      type: "audio" as const,
      description: "Calming meditation to help you fall asleep peacefully",
      audioUrl: "/audio/sleep-meditation.mp3?query=15-minute sleep meditation with nature sounds",
    },
    {
      id: "12",
      title: "Focus Enhancement",
      duration: "12 min",
      language: "Hindi/English",
      type: "audio" as const,
      description: "Binaural beats and guided meditation for better concentration",
      audioUrl: "/audio/focus-enhancement.mp3?query=12-minute focus meditation with binaural beats",
    },
  ],
  articles: [
    {
      id: "7",
      title: "Understanding Depression in College",
      duration: "5 min read",
      language: "English/Hindi",
      type: "article" as const,
      description: "Recognizing signs and seeking help for depression",
    },
    {
      id: "8",
      title: "Building Resilience",
      duration: "7 min read",
      language: "Multiple Languages",
      type: "article" as const,
      description: "Develop mental strength and bounce back from challenges",
    },
  ],
  exercises: [
    {
      id: "9",
      title: "Daily Journaling Prompts",
      duration: "Daily exercises",
      language: "Multiple Languages",
      type: "exercise" as const,
      description: "Structured prompts for self-reflection and emotional processing",
    },
    {
      id: "10",
      title: "Mindfulness Activities",
      duration: "5-minute practices",
      language: "Multiple Languages",
      type: "exercise" as const,
      description: "Quick mindfulness exercises for busy students",
    },
  ],
}

export default function ResourcesHub() {
  const [activeTab, setActiveTab] = useState<keyof typeof resources>("videos")
  const [selectedVideo, setSelectedVideo] = useState<Resource | null>(null)
  const [activeAudio, setActiveAudio] = useState<Resource | null>(null)
  const [selectedContent, setSelectedContent] = useState<Resource | null>(null)

  const incrementResourceViews = useAppStore((state) => state.incrementResourceViews)

  const getIcon = (type: string) => {
    switch (type) {
      case "video":
        return Play
      case "audio":
        return Headphones
      case "article":
        return FileText
      case "exercise":
        return Activity
      default:
        return Play
    }
  }

  const playResource = (resource: Resource) => {
    incrementResourceViews()

    if (resource.type === "video" && resource.youtubeId) {
      setSelectedVideo(resource)
    } else if (resource.type === "audio") {
      setActiveAudio(resource)
    } else {
      setSelectedContent(resource)
    }
  }

  return (
    <section id="resources" className="py-16">
      <div className="text-center mb-12">
        <div className="relative inline-block p-4 mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-white to-green-600 p-0.5 rounded-lg">
            <div className="bg-white rounded-lg h-full w-full"></div>
          </div>
          <div className="relative">
            <h2 className="text-3xl font-bold text-black">Psychoeducational Resources</h2>
          </div>
        </div>
        <p className="text-muted-foreground text-lg">
          Videos, audio guides, and wellness materials in multiple languages
        </p>
      </div>

      {selectedVideo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-semibold">{selectedVideo.title}</h3>
              <Button variant="ghost" onClick={() => setSelectedVideo(null)}>
                ×
              </Button>
            </div>
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}`}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="p-4">
              <p className="text-muted-foreground">{selectedVideo.description}</p>
            </div>
          </div>
        </div>
      )}

      {selectedContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-semibold">{selectedContent.title}</h3>
              <Button variant="ghost" onClick={() => setSelectedContent(null)}>
                ×
              </Button>
            </div>
            <div className="p-6">
              {selectedContent.type === "article" && (
                <div className="prose prose-slate max-w-none">
                  {selectedContent.id === "7" && (
                    <div>
                      <h4 className="text-xl font-semibold mb-4">Understanding Depression in College</h4>
                      <p className="mb-4">
                        College years can be challenging, and it's important to recognize when stress becomes something
                        more serious. Depression affects many students and is treatable.
                      </p>

                      <h5 className="text-lg font-semibold mb-2">Common Signs:</h5>
                      <ul className="list-disc pl-6 mb-4">
                        <li>Persistent sadness or emptiness</li>
                        <li>Loss of interest in activities you once enjoyed</li>
                        <li>Changes in sleep patterns</li>
                        <li>Difficulty concentrating on studies</li>
                        <li>Feelings of worthlessness or guilt</li>
                      </ul>

                      <h5 className="text-lg font-semibold mb-2">When to Seek Help:</h5>
                      <p className="mb-4">
                        If you experience these symptoms for more than two weeks, it's important to reach out. Remember,
                        seeking help is a sign of strength, not weakness.
                      </p>

                      <h5 className="text-lg font-semibold mb-2">Resources Available:</h5>
                      <ul className="list-disc pl-6">
                        <li>Campus counseling services</li>
                        <li>Mental health helplines</li>
                        <li>Trusted friends and family</li>
                        <li>Professional therapists</li>
                      </ul>
                    </div>
                  )}

                  {selectedContent.id === "8" && (
                    <div>
                      <h4 className="text-xl font-semibold mb-4">Building Resilience</h4>
                      <p className="mb-4">
                        Resilience is your ability to bounce back from challenges and adapt to difficult situations.
                        It's a skill that can be developed with practice.
                      </p>

                      <h5 className="text-lg font-semibold mb-2">Key Components of Resilience:</h5>
                      <ul className="list-disc pl-6 mb-4">
                        <li>
                          <strong>Emotional Regulation:</strong> Learning to manage your emotions effectively
                        </li>
                        <li>
                          <strong>Problem-Solving:</strong> Developing strategies to tackle challenges
                        </li>
                        <li>
                          <strong>Social Support:</strong> Building and maintaining strong relationships
                        </li>
                        <li>
                          <strong>Self-Care:</strong> Taking care of your physical and mental health
                        </li>
                      </ul>

                      <h5 className="text-lg font-semibold mb-2">Daily Practices:</h5>
                      <ul className="list-disc pl-6 mb-4">
                        <li>Practice gratitude daily</li>
                        <li>Set realistic goals</li>
                        <li>Learn from setbacks</li>
                        <li>Maintain a growth mindset</li>
                        <li>Stay connected with others</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {selectedContent.type === "exercise" && (
                <div>
                  {selectedContent.id === "9" && (
                    <div>
                      <h4 className="text-xl font-semibold mb-4">Daily Journaling Prompts</h4>
                      <p className="mb-6">
                        Journaling is a powerful tool for self-reflection and emotional processing. Try these prompts:
                      </p>

                      <div className="space-y-6">
                        <div className="bg-primary/5 p-4 rounded-lg">
                          <h5 className="font-semibold mb-2">Morning Reflection:</h5>
                          <ul className="list-disc pl-6 space-y-1">
                            <li>How am I feeling right now?</li>
                            <li>What am I grateful for today?</li>
                            <li>What is one thing I want to accomplish?</li>
                          </ul>
                        </div>

                        <div className="bg-primary/5 p-4 rounded-lg">
                          <h5 className="font-semibold mb-2">Evening Reflection:</h5>
                          <ul className="list-disc pl-6 space-y-1">
                            <li>What went well today?</li>
                            <li>What challenged me and how did I handle it?</li>
                            <li>What did I learn about myself?</li>
                          </ul>
                        </div>

                        <div className="bg-primary/5 p-4 rounded-lg">
                          <h5 className="font-semibold mb-2">Weekly Deep Dive:</h5>
                          <ul className="list-disc pl-6 space-y-1">
                            <li>What patterns do I notice in my thoughts and emotions?</li>
                            <li>How have I grown this week?</li>
                            <li>What do I want to focus on next week?</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedContent.id === "10" && (
                    <div>
                      <h4 className="text-xl font-semibold mb-4">Mindfulness Activities</h4>
                      <p className="mb-6">Quick mindfulness exercises you can do anywhere, anytime:</p>

                      <div className="space-y-6">
                        <div className="bg-primary/5 p-4 rounded-lg">
                          <h5 className="font-semibold mb-2">5-4-3-2-1 Grounding Technique</h5>
                          <p className="mb-2">When feeling overwhelmed, notice:</p>
                          <ul className="list-disc pl-6 space-y-1">
                            <li>5 things you can see</li>
                            <li>4 things you can touch</li>
                            <li>3 things you can hear</li>
                            <li>2 things you can smell</li>
                            <li>1 thing you can taste</li>
                          </ul>
                        </div>

                        <div className="bg-primary/5 p-4 rounded-lg">
                          <h5 className="font-semibold mb-2">Box Breathing</h5>
                          <p className="mb-2">Follow this pattern:</p>
                          <ul className="list-disc pl-6 space-y-1">
                            <li>Inhale for 4 counts</li>
                            <li>Hold for 4 counts</li>
                            <li>Exhale for 4 counts</li>
                            <li>Hold for 4 counts</li>
                            <li>Repeat 4-8 times</li>
                          </ul>
                        </div>

                        <div className="bg-primary/5 p-4 rounded-lg">
                          <h5 className="font-semibold mb-2">Body Scan</h5>
                          <p className="mb-2">Take 3-5 minutes to:</p>
                          <ul className="list-disc pl-6 space-y-1">
                            <li>Start at the top of your head</li>
                            <li>Slowly move attention down your body</li>
                            <li>Notice any tension or sensations</li>
                            <li>Breathe into areas of tension</li>
                            <li>End at your toes</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeAudio && (
        <AudioPlayer title={activeAudio.title} audioUrl={activeAudio.audioUrl!} onClose={() => setActiveAudio(null)} />
      )}

      <div className="flex flex-wrap justify-center mb-8 gap-2">
        {Object.keys(resources).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "outline"}
            onClick={() => setActiveTab(tab as keyof typeof resources)}
            className="capitalize"
          >
            {tab}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {resources[activeTab].map((resource) => {
          const IconComponent = getIcon(resource.type)
          const isPlaying = resource.type === "audio" && activeAudio?.id === resource.id

          return (
            <Card
              key={resource.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
              onClick={() => playResource(resource)}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  {resource.type === "audio" && isPlaying ? (
                    <Pause className="w-8 h-8 text-primary animate-pulse" />
                  ) : (
                    <IconComponent className="w-8 h-8 text-primary" />
                  )}
                </div>
                <h4 className="font-semibold text-lg mb-2">{resource.title}</h4>
                <p className="text-sm text-muted-foreground mb-1">{resource.duration}</p>
                <p className="text-xs text-muted-foreground">{resource.language}</p>
                {resource.description && (
                  <p className="text-sm text-muted-foreground mt-2 text-pretty">{resource.description}</p>
                )}
                {resource.type === "audio" && isPlaying && (
                  <p className="text-xs text-primary mt-2 font-medium">Now Playing</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
