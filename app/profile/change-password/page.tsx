"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Eye, EyeOff, Lock, AlertCircle, Loader2, Shield, KeyRound, CheckCircle2, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion } from "framer-motion"

export default function ChangePasswordPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { user, session, isLoading } = useAuth()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [passwordStrength, setPasswordStrength] = useState(0)

  // ตรวจสอบว่ามีผู้ใช้ที่ล็อกอินอยู่หรือไม่ โดยใช้ข้อมูลจาก useAuth
  useEffect(() => {
    // รอให้ข้อมูลโหลดเสร็จก่อน
    if (isLoading) return

    // ถ้าไม่มีผู้ใช้หรือเซสชัน และการโหลดเสร็จสิ้นแล้ว ให้นำทางไปยังหน้าเข้าสู่ระบบ
    if (!isLoading && !user && !session) {
      toast({
        title: "กรุณาเข้าสู่ระบบ",
        description: "คุณต้องเข้าสู่ระบบก่อนเปลี่ยนรหัสผ่าน",
        variant: "destructive",
      })
      router.push("/signin")
    }
  }, [user, session, isLoading, router])

  // Calculate password strength
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength(0)
      return
    }

    let strength = 0
    // Length check
    if (newPassword.length >= 8) strength += 1
    // Contains number
    if (/\d/.test(newPassword)) strength += 1
    // Contains lowercase
    if (/[a-z]/.test(newPassword)) strength += 1
    // Contains uppercase
    if (/[A-Z]/.test(newPassword)) strength += 1
    // Contains special char
    if (/[^A-Za-z0-9]/.test(newPassword)) strength += 1

    setPasswordStrength(strength)
  }, [newPassword])

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500"
    if (passwordStrength <= 3) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStrengthText = () => {
    if (!newPassword) return ""
    if (passwordStrength <= 1) return "อ่อนแอ"
    if (passwordStrength <= 3) return "ปานกลาง"
    return "แข็งแรง"
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate passwords
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน")
      return
    }

    if (newPassword.length < 6) {
      setError("รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร")
      return
    }

    setIsSubmitting(true)

    try {
      // ตรวจสอบว่ามีผู้ใช้ที่ล็อกอินอยู่หรือไม่
      if (!user || !session) {
        throw new Error("กรุณาเข้าสู่ระบบก่อนเปลี่ยนรหัสผ่าน")
      }

      // ยืนยันรหัสผ่านปัจจุบันโดยการลองเข้าสู่ระบบใหม่
      const { error: signInError } = await fetch("/api/verify-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          password: currentPassword,
        }),
      }).then((res) => res.json())

      if (signInError) {
        throw new Error("รหัสผ่านปัจจุบันไม่ถูกต้อง")
      }

      // เปลี่ยนรหัสผ่านหลังจากยืนยันรหัสผ่านปัจจุบันสำเร็จ
      const { error: updateError } = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: newPassword,
        }),
      }).then((res) => res.json())

      if (updateError) throw new Error(updateError.message)

      // Clear form
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      // Show success message
      toast({
        title: "เปลี่ยนรหัสผ่านสำเร็จ",
        description: "รหัสผ่านของคุณได้รับการเปลี่ยนแล้ว",
      })
    } catch (error: any) {
      console.error("Error changing password:", error)
      setError(error.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน")
    } finally {
      setIsSubmitting(false)
    }
  }

  // แสดงตัวโหลดขณะกำลังตรวจสอบสถานะการล็อกอิน
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
          <p>กำลังโหลด...</p>
        </motion.div>
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <DashboardHeader activePage="profile" />

      <motion.main
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="container mx-auto px-4 py-8"
      >
        <motion.div variants={itemVariants} className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/profile")}
              className="rounded-full hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-100"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-3xl font-bold">เปลี่ยนรหัสผ่าน</h1>
          </div>

          <motion.div variants={itemVariants} className="w-full max-w-md mx-auto">
            <Card className="border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"></div>
              <CardHeader className="bg-zinc-900/80 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-yellow-400/10 text-yellow-400">
                    <Shield size={20} />
                  </div>
                  <div>
                    <CardTitle>เปลี่ยนรหัสผ่าน</CardTitle>
                    <CardDescription className="text-zinc-400">เปลี่ยนรหัสผ่านเพื่อความปลอดภัยของบัญชีคุณ</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleChangePassword} className="space-y-5">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-200">
                        <AlertCircle className="h-4 w-4 text-red-200" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="current-password" className="text-zinc-300 flex items-center gap-2">
                      <KeyRound size={14} className="text-zinc-400" />
                      รหัสผ่านปัจจุบัน
                    </Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="pr-10 bg-zinc-800/60 border-zinc-700 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 transition-all"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="new-password" className="text-zinc-300 flex items-center gap-2">
                      <Lock size={14} className="text-zinc-400" />
                      รหัสผ่านใหม่
                    </Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pr-10 bg-zinc-800/60 border-zinc-700 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 transition-all"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {newPassword && (
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-400">ความปลอดภัย:</span>
                          <span
                            className={`
                            ${passwordStrength <= 1 ? "text-red-400" : ""}
                            ${passwordStrength > 1 && passwordStrength <= 3 ? "text-yellow-400" : ""}
                            ${passwordStrength > 3 ? "text-green-400" : ""}
                          `}
                          >
                            {getStrengthText()}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                            transition={{ duration: 0.3 }}
                            className={`h-full ${getStrengthColor()}`}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-zinc-300 flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-zinc-400" />
                      ยืนยันรหัสผ่านใหม่
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pr-10 bg-zinc-800/60 border-zinc-700 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 transition-all"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPassword && newPassword && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`text-xs mt-1 flex items-center gap-1 ${
                          confirmPassword === newPassword ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {confirmPassword === newPassword ? (
                          <>
                            <CheckCircle2 size={12} />
                            <span>รหัสผ่านตรงกัน</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle size={12} />
                            <span>รหัสผ่านไม่ตรงกัน</span>
                          </>
                        )}
                      </motion.div>
                    )}
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/profile")}
                      className="border-zinc-700 bg-zinc-800/30 hover:bg-zinc-800/60 text-zinc-300 hover:text-zinc-100"
                    >
                      ยกเลิก
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-medium transition-all duration-300 shadow-lg hover:shadow-yellow-500/20"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-black"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          กำลังดำเนินการ...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Lock size={16} />
                          เปลี่ยนรหัสผ่าน
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </motion.main>
    </div>
  )
}
