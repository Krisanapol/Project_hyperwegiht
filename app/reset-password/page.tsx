"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Header } from "@/components/header"
import { toast } from "@/components/ui/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export default function ResetPassword() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isValidLink, setIsValidLink] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // ตรวจสอบว่ามี hash ที่ถูกต้องหรือไม่
    const hash = window.location.hash
    if (!hash || !hash.includes("access_token")) {
      setIsValidLink(false)
      toast({
        title: "ลิงก์ไม่ถูกต้อง",
        description: "ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว",
        variant: "destructive",
      })
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: "รหัสผ่านไม่ตรงกัน",
        description: "กรุณาตรวจสอบรหัสผ่านของคุณอีกครั้ง",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "รหัสผ่านสั้นเกินไป",
        description: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        throw error
      }

      toast({
        title: "รีเซ็ตรหัสผ่านสำเร็จ",
        description: "รหัสผ่านของคุณถูกเปลี่ยนแล้ว คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้",
      })

      // ไปที่หน้าล็อกอิน
      router.push("/signin")
    } catch (error: any) {
      console.error("Error resetting password:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถรีเซ็ตรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isValidLink) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">ลิงก์ไม่ถูกต้อง</h1>
                <p className="text-muted-foreground">ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว</p>
              </div>
              <Link
                href="/forgot-password"
                className="inline-block w-full py-2 bg-yellow-400 rounded-md text-black font-medium hover:bg-yellow-500 transition-colors text-center"
              >
                ขอลิงก์รีเซ็ตรหัสผ่านใหม่
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link
              href="/signin"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">รีเซ็ตรหัสผ่าน</h1>
              <p className="text-muted-foreground">กรอกรหัสผ่านใหม่ของคุณ</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  รหัสผ่านใหม่
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  ยืนยันรหัสผ่านใหม่
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-yellow-400 rounded-md text-black font-medium hover:bg-yellow-500 transition-colors flex justify-center items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    กำลังรีเซ็ตรหัสผ่าน...
                  </span>
                ) : (
                  "รีเซ็ตรหัสผ่าน"
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
