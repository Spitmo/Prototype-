"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { db } from "@/lib/firebase"
import { collection, addDoc, updateDoc, doc, onSnapshot } from "firebase/firestore"

interface Student {
  id: string
  name: string
  email: string
  age: number
  year: string
  department: string
  profession?: string
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
  totalUsers: number
  registeredUsers: number
  sessionsBooked: number
  resourceViews: number
  forumPosts: number
  emergencyContacts: number
  assessmentsCompleted: number
  students: Student[]

  isAdminAuthenticated: boolean
  chatbotUsage: number
  crisisHelplineClicks: number

  incrementBookings: () => void
  incrementResourceViews: () => void
  incrementForumPosts: () => void
  incrementEmergencyContacts: () => void
  incrementAssessments: () => void
  incrementRegisteredUsers: () => void
  addStudent: (student: Student) => Promise<void>
  updateStudentAssessment: (id: string, scores: { phq9?: number; gad7?: number; ghqScore?: number }) => Promise<void>
  completeAssessment: (student: Student) => Promise<void>
  resetMetrics: () => void
  authenticateAdmin: (email: string, password: string) => boolean
  logoutAdmin: () => void
  incrementChatbotUsage: () => void
  incrementCrisisHelplineClicks: () => void
  listenToStudents: () => () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      totalUsers: 0,
      registeredUsers: 0,
      sessionsBooked: 0,
      resourceViews: 0,
      forumPosts: 0,
      emergencyContacts: 0,
      assessmentsCompleted: 0,
      isAdminAuthenticated: false,
      chatbotUsage: 0,
      crisisHelplineClicks: 0,
      students: [],

      incrementBookings: () => set((s) => ({ sessionsBooked: s.sessionsBooked + 1 })),
      incrementResourceViews: () => set((s) => ({ resourceViews: s.resourceViews + 1 })),
      incrementForumPosts: () => set((s) => ({ forumPosts: s.forumPosts + 1 })),
      incrementEmergencyContacts: () => set((s) => ({ emergencyContacts: s.emergencyContacts + 1 })),
      incrementAssessments: () => set((s) => ({ assessmentsCompleted: s.assessmentsCompleted + 1 })),
      incrementRegisteredUsers: () => set((s) => ({ registeredUsers: s.registeredUsers + 1 })),

      addStudent: async (student) => {
        try {
          await addDoc(collection(db, "students"), student)
        } catch (err) {
          console.error("Error adding student:", err)
        }
      },

      updateStudentAssessment: async (id, scores) => {
        try {
          await updateDoc(doc(db, "students", id), {
            ...scores,
            lastAssessment: new Date(),
            riskLevel: calculateRiskLevel(scores.phq9 || 0, scores.gad7 || 0, scores.ghqScore || 0),
          })
        } catch (err) {
          console.error("Error updating assessment:", err)
        }
      },

      completeAssessment: async (student) => {
        try {
          await addDoc(collection(db, "students"), {
            ...student,
            lastAssessment: new Date(),
            riskLevel: calculateRiskLevel(student.phq9Score || 0, student.gad7Score || 0, student.ghqScore || 0),
          })

          set((state) => ({
            students: [...state.students, student],
            assessmentsCompleted: state.assessmentsCompleted + 1,
            totalUsers: state.totalUsers + 1,
            registeredUsers: state.registeredUsers + 1,
          }))
        } catch (err) {
          console.error("Error completing assessment:", err)
        }
      },

      listenToStudents: () => {
        const unsub = onSnapshot(collection(db, "students"), (snapshot) => {
          const students = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Student[]
          set({ students, totalUsers: students.length, registeredUsers: students.length })
        })
        return unsub
      },

      authenticateAdmin: (email, password) => {
        const valid = email === "ramagrawal99001@gmail.com" && password === "29112004"
        if (valid) {
          set({ isAdminAuthenticated: true })
          return true
        }
        return false
      },

      logoutAdmin: () => set({ isAdminAuthenticated: false }),

      incrementChatbotUsage: () => set((s) => ({ chatbotUsage: s.chatbotUsage + 1 })),
      incrementCrisisHelplineClicks: () => set((s) => ({ crisisHelplineClicks: s.crisisHelplineClicks + 1 })),

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
        })),
    }),
    { name: "mindcare-storage" },
  ),
)

function calculateRiskLevel(phq9: number, gad7: number, ghq: number): "low" | "moderate" | "high" {
  if (phq9 >= 15 || gad7 >= 15 || ghq >= 24) return "high"
  if (phq9 >= 10 || gad7 >= 10 || ghq >= 16) return "moderate"
  return "low"
}
