"use client"

import { useEffect } from "react"
import { useAppStore } from "@/lib/store"

export default function AdminDashboard() {
  const {
    isAdminAuthenticated,
    totalUsers,
    registeredUsers,
    sessionsBooked,
    resourceViews,
    forumPosts,
    emergencyContacts,
    assessmentsCompleted,
    chatbotUsage,
    crisisHelplineClicks,
    students,
    listenToStudents,
    logoutAdmin,
  } = useAppStore()

  useEffect(() => {
    if (!isAdminAuthenticated) return
    const unsub = listenToStudents()
    return () => unsub()
  }, [isAdminAuthenticated, listenToStudents])

  if (!isAdminAuthenticated) {
    return <p className="text-center text-red-600 mt-10">❌ Admin access only</p>
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">📊 Admin Dashboard</h2>
        <button
          onClick={logoutAdmin}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <MetricCard label="Total Users" value={totalUsers} />
        <MetricCard label="Registered Users" value={registeredUsers} />
        <MetricCard label="Sessions Booked" value={sessionsBooked} />
        <MetricCard label="Resource Views" value={resourceViews} />
        <MetricCard label="Forum Posts" value={forumPosts} />
        <MetricCard label="Emergency Contacts" value={emergencyContacts} />
        <MetricCard label="Assessments Completed" value={assessmentsCompleted} />
        <MetricCard label="Chatbot Usage" value={chatbotUsage} />
        <MetricCard label="Crisis Helpline Clicks" value={crisisHelplineClicks} />
      </div>

      {/* Students Table */}
      <h3 className="text-xl font-semibold mb-3">👩‍🎓 Students</h3>
      <div className="overflow-x-auto border rounded">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Department</th>
              <th className="p-2 border">Risk Level</th>
              <th className="p-2 border">Sessions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No students found
                </td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s.id}>
                  <td className="p-2 border">{s.name}</td>
                  <td className="p-2 border">{s.email}</td>
                  <td className="p-2 border">{s.department}</td>
                  <td
                    className={`p-2 border font-semibold ${
                      s.riskLevel === "high"
                        ? "text-red-600"
                        : s.riskLevel === "moderate"
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {s.riskLevel}
                  </td>
                  <td className="p-2 border text-center">{s.sessionsBooked}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white p-4 rounded shadow text-center">
      <h3 className="text-lg font-semibold">{label}</h3>
      <p className="text-2xl font-bold text-blue-600">{value}</p>
    </div>
  )
}
