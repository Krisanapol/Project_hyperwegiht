"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Header } from "@/components/header"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Mail, Lock, Eye, EyeOff, UserPlus, ArrowRight, CheckCircle2, XCircle } from "lucide-react"

export default function SignUp() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordsMatch, setPasswordsMatch] = useState(true)
  const router = useRouter()
  const { signUp } = useAuth()

  // Check if passwords match whenever either password changes
  useEffect(() => {
    if (confirmPassword) {
      setPasswordsMatch(password === confirmPassword)
    }
  }, [password, confirmPassword])

  // Calculate password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0)
      return
    }

    let strength = 0
    // Length check
    if (password.length >= 6) strength += 1
    // Contains number
    if (/\d/.test(password)) strength += 1
    // Contains special char
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 1

    setPasswordStrength(strength)
  }, [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // ตรวจสอบว่ารหัสผ่านตรงกัน
    if (password !== confirmPassword) {
      toast({
        title: "รหัสผ่านไม่ตรงกัน",
        description: "กรุณาตรวจสอบรหัสผ่านของคุณอีกครั้ง",
        variant: "destructive",
      })
      return
    }

    // ตรวจสอบความยาวรหัสผ่าน
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
      // สมัครสมาชิกด้วยอีเมลและรหัสผ่าน
      const { error } = await signUp(email, password)

      if (error) {
        throw error
      }

      toast({
        title: "สมัครสมาชิกสำเร็จ",
        description: "กรุณายืนยันอีเมลของคุณด้วยรหัส OTP",
      })

      // นำผู้ใช้ไปยังหน้ายืนยัน OTP
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`)
    } catch (error: any) {
      console.error("Error signing up:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStrengthColor = () => {
    if (passwordStrength === 0) return "bg-zinc-600"
    if (passwordStrength === 1) return "bg-red-500"
    if (passwordStrength === 2) return "bg-yellow-500"
    if (passwordStrength === 3) return "bg-green-400"
    return "bg-green-500"
  }

  const getStrengthText = () => {
    if (passwordStrength === 0) return ""
    if (passwordStrength === 1) return "อ่อน"
    if (passwordStrength === 2) return "ปานกลาง"
    if (passwordStrength === 3) return "ดี"
    return "แข็งแรง"
  }

  // Animation variants
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

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.03 },
    tap: { scale: 0.97 },
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl" />

        <motion.div className="w-full max-w-md z-10" initial="hidden" animate="visible" variants={containerVariants}>
          <motion.div
            className="backdrop-blur-sm bg-zinc-900/60 border border-zinc-800 rounded-xl shadow-xl overflow-hidden"
            variants={itemVariants}
          >
            <div className="p-6 space-y-6">
              <motion.div className="text-center space-y-2" variants={itemVariants}>
                <UserPlus className="mx-auto h-10 w-10 text-yellow-400" />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                  ลงทะเบียน
                </h1>
              </motion.div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <motion.div className="space-y-2" variants={itemVariants}>
                  <label htmlFor="email" className="text-sm font-medium flex items-center gap-2 text-zinc-300">
                    <Mail className="h-4 w-4 text-yellow-400" />
                    อีเมล
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 bg-zinc-800/60 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    {email && email.includes("@") && email.includes(".") && (
                      <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
                    )}
                  </div>
                </motion.div>

                <motion.div className="space-y-2" variants={itemVariants}>
                  <label htmlFor="password" className="text-sm font-medium flex items-center gap-2 text-zinc-300">
                    <Lock className="h-4 w-4 text-yellow-400" />
                    รหัสผ่าน
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-zinc-800/60 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  {password && (
                    <div className="space-y-1 mt-1">
                      <div className="flex gap-1 h-1">
                        <div
                          className={`flex-1 rounded-full ${passwordStrength >= 1 ? getStrengthColor() : "bg-zinc-700"}`}
                        ></div>
                        <div
                          className={`flex-1 rounded-full ${passwordStrength >= 2 ? getStrengthColor() : "bg-zinc-700"}`}
                        ></div>
                        <div
                          className={`flex-1 rounded-full ${passwordStrength >= 3 ? getStrengthColor() : "bg-zinc-700"}`}
                        ></div>
                        <div
                          className={`flex-1 rounded-full ${passwordStrength >= 4 ? getStrengthColor() : "bg-zinc-700"}`}
                        ></div>
                      </div>
                      <p className="text-xs text-zinc-400 flex justify-between">
                        <span>ความปลอดภัยของรหัสผ่าน</span>
                        <span
                          className={`
                          ${passwordStrength === 1 ? "text-red-500" : ""}
                          ${passwordStrength === 2 ? "text-yellow-500" : ""}
                          ${passwordStrength >= 3 ? "text-green-400" : ""}
                        `}
                        >
                          {getStrengthText()}
                        </span>
                      </p>
                    </div>
                  )}
                </motion.div>

                <motion.div className="space-y-2" variants={itemVariants}>
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium flex items-center gap-2 text-zinc-300"
                  >
                    <Lock className="h-4 w-4 text-yellow-400" />
                    ยืนยันรหัสผ่าน
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`w-full px-4 py-3 bg-zinc-800/60 border ${
                        confirmPassword
                          ? passwordsMatch
                            ? "border-green-500/50 focus:border-green-500"
                            : "border-red-500/50 focus:border-red-500"
                          : "border-zinc-700"
                      } rounded-lg focus:outline-none focus:ring-2 ${
                        confirmPassword
                          ? passwordsMatch
                            ? "focus:ring-green-500/30"
                            : "focus:ring-red-500/30"
                          : "focus:ring-yellow-400/50"
                      } transition-all`}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>

                    {confirmPassword &&
                      (passwordsMatch ? (
                        <CheckCircle2 className="absolute right-12 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
                      ) : (
                        <XCircle className="absolute right-12 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
                      ))}
                  </div>

                  {confirmPassword && !passwordsMatch && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <XCircle className="h-3 w-3" /> รหัสผ่านไม่ตรงกัน
                    </p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <motion.button
                    type="submit"
                    className="w-full py-3 mt-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg text-black font-medium shadow-lg shadow-yellow-500/20 flex justify-center items-center gap-2 transition-all"
                    disabled={isLoading}
                    variants={buttonVariants}
                    initial="idle"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>กำลังสมัครสมาชิก...</span>
                      </>
                    ) : (
                      <>
                        <span>สมัครสมาชิก</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </form>

              <motion.div className="text-center text-sm text-zinc-400" variants={itemVariants}>
                มีบัญชีอยู่แล้ว?{" "}
                <Link
                  href="/signin"
                  className="text-yellow-400 hover:text-yellow-300 hover:underline transition-colors"
                >
                  เข้าสู่ระบบ
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
