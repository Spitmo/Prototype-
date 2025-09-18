"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { auth } from "./firebase"
import { onAuthStateChanged, User } from "firebase/auth"

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
  registeredUsers: number
  sessionsBooked: number
  resourceViews: number
  forumPosts: number
  emergencyContacts: number
  assessmentsCompleted: number
  chatbotUsage: number
  crisisHelplineClicks: number

  // Students data
  students: Student[]

  // Admin
  isAdminAuthenticated: boolean

  // Firebase User (for login/signup)
  user: User | null
  setUser: (user: User | null) => void

  // Actions
  incrementBookings: () => void
  incrementResourceViews: () => void
  incrementForumPosts: () => void
  incrementEmergencyContacts: () => void
  incrementAssessments: () => void
  incrementRegisteredUsers: () => void
  addStudent: (student: Student) => void
  updateStudentAssessment: (
    id: string,
    scores: { phq9?: number; gad7?: number; ghqScore?: number }
  ) => void
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
      // Initial state
      totalUsers: 0,
      registeredUsers: 0,
      sessionsBooked: 0,
      resourceViews: 0,
      forumPosts: 0,
      emergencyContacts: 0,
      assessmentsCompleted: 0,
      chatbotUsage: 0,
      crisisHelplineClicks: 0,
      isAdminAuthenticated: false,
      user: null,
      students: mockStudents,

      // User actions
      setUser: (user) => set({ user }),

      incrementBookings: () =>
        set((state) => ({ sessionsBooked: state.sessionsBooked + 1 })),

      incrementResourceViews: () =>
        set((state) => ({ resourceViews: state.resourceViews + 1 })),

      incrementForumPosts: () =>
        set((state) => ({ forumPosts: state.forumPosts + 1 })),

      incrementEmergencyContacts: () =>
        set((state) => ({ emergencyContacts: state.emergencyContacts + 1 })),

      incrementAssessments: () =>
        set((state) => ({ assessmentsCompleted: state.assessmentsCompleted + 1 })),

      incrementRegisteredUsers: () =>
        set((state) => ({ registeredUsers: state.registeredUsers + 1 })),

      addStudent: (student) =>
        set((state) => ({
          students: [...state.students, student],
          totalUsers: state.totalUsers + 1,
          registeredUsers: state.registeredUsers + 1,
        })),

      updateStudentAssessment: (id, scores) =>
        set((state) => ({
          students: state.students.map((student) =>
            student.id === id
              ? {
                  ...student,
                  ...scores,
                  lastAssessment: new Date(),
                  riskLevel: calculateRiskLevel(
                    scores.phq9 || 0,
                    scores.gad7 || 0,
                    scores.ghqScore || 0
                  ),
                }
              : student
          ),
          assessmentsCompleted: state.assessmentsCompleted + 1,
        })),

      authenticateAdmin: (email, password) => {
        const validCredentials = [
          { email: "admin@mindcare.edu", password: "MindCare2024!" },
          { email: "authority@college.edu", password: "Authority@123" },
          { email: "counselor@mindcare.edu", password: "Counselor#456" },
        ]

        const isValid = validCredentials.some(
          (cred) => cred.email === email && cred.password === password
        )

        if (isValid) {
          set({ isAdminAuthenticated: true })
          return true
        }
        return false
      },

      logoutAdmin: () => set({ isAdminAuthenticated: false }),

      incrementChatbotUsage: () =>
        set((state) => ({ chatbotUsage: state.chatbotUsage + 1 })),

      incrementCrisisHelplineClicks: () =>
        set((state) => ({ crisisHelplineClicks: state.crisisHelplineClicks + 1 })),

      resetMetrics: () =>
        set(() => ({
          totalUsers: 0,
          registeredUsers: 0,
          sessionsBooked: 0,
          resourceViews: 0,
          forumPosts: 0,
          emergencyContacts: 0,
          assessmentsCompleted: 0,
          chatbotUsage: 0,
          crisisHelplineClicks: 0,
          students: [],
          user: null,
        })),
    }),
    {
      name: "mindcare-storage",
    }
  )
)

// Risk calculation
function calculateRiskLevel(
  phq9: number,
  gad7: number,
  ghq: number
): "low" | "moderate" | "high" {
  if (phq9 >= 15 || gad7 >= 15 || ghq >= 24) return "high"
  if (phq9 >= 10 || gad7 >= 10 || ghq >= 16) return "moderate"
  return "low"
}

// Listen Firebase Auth
onAuthStateChanged(auth, (user) => {
  useAppStore.getState().setUser(user)
})
