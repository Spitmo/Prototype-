"use client"

import { useEffect, useState } from "react"
import { auth } from "@/lib/firebase"
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

interface Props {
  onVerified: () => void
  onClose: () => void
}

export default function PhoneAuthPopup({ onVerified, onClose }: Props) {
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [confirmation, setConfirmation] = useState<any>(null)
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ✅ Setup reCAPTCHA
  useEffect(() => {
    if (typeof window === "undefined") return

    if (!(window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          { size: "invisible" }
        )
      } catch (err) {
        console.error("Recaptcha setup error:", err)
      }
    }

    return () => {
      if ((window as any).recaptchaVerifier) {
        try {
          ;(window as any).recaptchaVerifier.clear?.()
          ;(window as any).recaptchaVerifier.dispose?.()
        } catch {}
        delete (window as any).recaptchaVerifier
      }
    }
  }, [])

  // ✅ Send OTP
  async function sendOtp() {
    setError(null)
    setLoading(true)
    try {
      const appVerifier = (window as any).recaptchaVerifier
      const fullPhone = `+91${phone.trim()}`
      if (!/^\+91\d{10}$/.test(fullPhone)) {
        setError("Enter valid 10 digit number")
        setLoading(false)
        return
      }
      const confirmationResult = await signInWithPhoneNumber(auth, fullPhone, appVerifier)
      setConfirmation(confirmationResult)
      setStep("otp")
    } catch (err: any) {
      console.error("OTP send error:", err)
      setError(err?.message || "Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }

  // ✅ Verify OTP
  async function verifyOtp() {
    setError(null)
    setLoading(true)
    try {
      await confirmation.confirm(otp)
      onVerified()
      handleClose()
    } catch (err: any) {
      console.error("OTP verify error:", err)
      setError("Invalid OTP. Try again.")
    } finally {
      setLoading(false)
    }
  }

  // ✅ Close Popup
  function handleClose() {
    setPhone("")
    setOtp("")
    setStep("phone")
    setConfirmation(null)
    setError(null)
    if (typeof onClose === "function") {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-sm relative shadow-lg">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold mb-4">
          {step === "phone" ? "Verify your phone" : "Enter OTP"}
        </h2>

        {step === "phone" ? (
          <>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-2 border rounded-md bg-gray-100">+91</span>
              <Input
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1"
                maxLength={10}
              />
            </div>
            <Button onClick={sendOtp} disabled={loading} className="w-full">
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          </>
        ) : (
          <>
            <Input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mb-3"
            />
            <Button onClick={verifyOtp} disabled={loading} className="w-full">
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
          </>
        )}

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        {/* reCAPTCHA container */}
        <div id="recaptcha-container"></div>
      </div>
    </div>
  )
}
