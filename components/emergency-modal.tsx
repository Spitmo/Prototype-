"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Phone, X } from "lucide-react"
import { useAppStore } from "@/lib/store"

export default function EmergencyModal() {
  const incrementEmergencyContacts = useAppStore((state) => state.incrementEmergencyContacts)

  const closeModal = () => {
    const modal = document.getElementById("emergency-modal")
    if (modal) {
      modal.classList.remove("active")
    }
  }

  const connectEmergency = () => {
    incrementEmergencyContacts()
    alert("Connecting you to a crisis counselor immediately...\n\nA trained professional will be with you in seconds.")
    closeModal()
  }

  return (
    <div
      id="emergency-modal"
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 opacity-0 pointer-events-none transition-opacity duration-300"
    >
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-between items-center">
            <CardTitle className="text-destructive flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Crisis Support</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={closeModal}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">If you're in immediate danger, please contact:</p>

          <div className="bg-destructive/10 p-4 rounded-lg space-y-2">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-destructive" />
              <div>
                <p className="font-semibold">National Suicide Prevention Helpline</p>
                <p className="text-lg font-mono">9152987821</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-destructive" />
              <div>
                <p className="font-semibold">Emergency Services</p>
                <p className="text-lg font-mono">112</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-destructive" />
              <div>
                <p className="font-semibold">Campus Counselor Emergency</p>
                <p className="text-sm text-muted-foreground">Available 24/7</p>
              </div>
            </div>
          </div>

          <div
            onClick={connectEmergency}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && connectEmergency()}
            className="crisis-button-override"
          >
            Connect with Crisis Counselor Now
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        #emergency-modal.active {
          opacity: 1;
          pointer-events: auto;
        }
        
        .crisis-button-override {
          background-color: #f3f4f6 !important;
          background: #f3f4f6 !important;
          color: #000000 !important;
          border: 2px solid #dc2626 !important;
          border-radius: 6px !important;
          padding: 8px 16px !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          width: 100% !important;
          text-align: center !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          min-height: 36px !important;
          transition: all 0.2s !important;
        }
        
        .crisis-button-override:hover {
          background-color: #dc2626 !important;
          background: #dc2626 !important;
          color: #ffffff !important;
        }
      `}</style>
    </div>
  )
}
