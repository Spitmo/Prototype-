"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Student {
  id: string
  name: string
  email: string
  age: number
  year: string
  department: string
  phq9Score?: number
  gad7Score?: number
  ghqScore?: number
  riskLevel: "low" | "moderate" | "high"
  lastAssessment?: Date
  sessionsBooked: number
  resourcesViewed: number
  forumPosts: number
}

interface AppState {
  // Dashboard metrics
  totalUsers: number
  registeredUsers: number // Added registered users tracking
  sessionsBooked: number
  resourceViews: number
  forumPosts: number
  emergencyContacts: number
  assessmentsCompleted: number

  // Students data
  students: Student[]

  isAdminAuthenticated: boolean
  chatbotUsage: number
  crisisHelplineClicks: number

  // Actions
  incrementBookings: () => void
  incrementResourceViews: () => void
  incrementForumPosts: () => void
  incrementEmergencyContacts: () => void
  incrementAssessments: () => void
  incrementRegisteredUsers: () => void // Added action for registered users
  addStudent: (student: Student) => void
  updateStudentAssessment: (id: string, scores: { phq9?: number; gad7?: number; ghqScore?: number }) => void
  resetMetrics: () => void
  authenticateAdmin: (email: string, password: string) => boolean
  logoutAdmin: () => void
  incrementChatbotUsage: () => void
  incrementCrisisHelplineClicks: () => void
}

const mockStudents: Student[] = []

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial metrics set to zero
      totalUsers: 0,
      registeredUsers: 0, // Added registered users counter
      sessionsBooked: 0,
      resourceViews: 0,
      forumPosts: 0,
      emergencyContacts: 0,
      assessmentsCompleted: 0,
      isAdminAuthenticated: false,
      chatbotUsage: 0,
      crisisHelplineClicks: 0,

      students: mockStudents,

      incrementBookings: () =>
        set((state) => ({
          sessionsBooked: state.sessionsBooked + 1,
        })),

      incrementResourceViews: () =>
        set((state) => ({
          resourceViews: state.resourceViews + 1,
        })),

      incrementForumPosts: () =>
        set((state) => ({
          forumPosts: state.forumPosts + 1,
        })),

      incrementEmergencyContacts: () =>
        set((state) => ({
          emergencyContacts: state.emergencyContacts + 1,
        })),

      incrementAssessments: () =>
        set((state) => ({
          assessmentsCompleted: state.assessmentsCompleted + 1,
        })),

      incrementRegisteredUsers: () =>
        // Added increment function for registered users
        set((state) => ({
          registeredUsers: state.registeredUsers + 1,
        })),

      addStudent: (student) =>
        set((state) => ({
          students: [...state.students, student],
          totalUsers: state.totalUsers + 1,
          registeredUsers: state.registeredUsers + 1, // Increment registered users when adding student
        })),

      updateStudentAssessment: (id, scores) =>
        set((state) => ({
          students: state.students.map((student) =>
            student.id === id
              ? {
                  ...student,
                  ...scores,
                  lastAssessment: new Date(),
                  riskLevel: calculateRiskLevel(scores.phq9 || 0, scores.gad7 || 0, scores.ghqScore || 0),
                }
              : student,
          ),
          assessmentsCompleted: state.assessmentsCompleted + 1,
        })),

      authenticateAdmin: (email: string, password: string) => {
        // Admin credentials - in production, this should be more secure
        const validCredentials = [
          { email: "ramagrawal99001@gmail.com", password: "29112004" }
          
        ]

        const isValid = validCredentials.some((cred) => cred.email === email && cred.password === password)

        if (isValid) {
          set({ isAdminAuthenticated: true })
          return true
        }
        return false
      },

      logoutAdmin: () => set({ isAdminAuthenticated: false }),

      incrementChatbotUsage: () =>
        set((state) => ({
          chatbotUsage: state.chatbotUsage + 1,
        })),

      incrementCrisisHelplineClicks: () =>
        set((state) => ({
          crisisHelplineClicks: state.crisisHelplineClicks + 1,
        })),

      resetMetrics: () =>
        set(() => ({
          totalUsers: 0,
          registeredUsers: 0, // Reset registered users to zero
          sessionsBooked: 0,
          resourceViews: 0,
          forumPosts: 0,
          emergencyContacts: 0,
          assessmentsCompleted: 0,
          chatbotUsage: 0,
          crisisHelplineClicks: 0,
          students: [],
        })),
    }),
    {
      name: "mindcare-storage",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.totalUsers = 0
          state.registeredUsers = 0 // Reset registered users on app load
          state.sessionsBooked = 0
          state.resourceViews = 0
          state.forumPosts = 0
          state.emergencyContacts = 0
          state.assessmentsCompleted = 0
          state.chatbotUsage = 0
          state.crisisHelplineClicks = 0
        }
      },
    },
  ),
)

function calculateRiskLevel(phq9: number, gad7: number, ghq: number): "low" | "moderate" | "high" {
  if (phq9 >= 15 || gad7 >= 15 || ghq >= 24) return "high"
  if (phq9 >= 10 || gad7 >= 10 || ghq >= 16) return "moderate"
  return "low"
}
