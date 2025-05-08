"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Header } from "@/components/header"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Mail, Key, ArrowRight, RefreshCw, CheckCircle2 } from "lucide-react"

export default function VerifyOTP() {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { sendOTP, verifyOTP } = useAuth()

  // รับอีเมลจาก URL query parameter
  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  // นับถอยหลังสำหรับการส่ง OTP ใหม่
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // ฟังก์ชันสำหรับส่ง OTP ไปยังอีเมล
  const handleSendOTP = async () => {
    if (!email) {
      toast({
        title: "กรุณากรอกอีเมล",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)

    try {
      const { error } = await sendOTP(email)

      if (error) {
        throw error
      }

      toast({
        title: "ส่งรหัส OTP แล้ว",
        description: "กรุณาตรวจสอบอีเมลของคุณเพื่อรับรหัส OTP",
      })

      // ตั้งเวลานับถอยหลัง 60 วินาที
      setCountdown(60)
    } catch (error: any) {
      console.error("Error sending OTP:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถส่งรหัส OTP ได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  // ฟังก์ชันสำหรับยืนยัน OTP
  const handleVerifyOTP = async () => {
    if (!email || !otp) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await verifyOTP(email, otp)

      if (error) {
        throw error
      }

      toast({
        title: "ยืนยันอีเมลสำเร็จ",
        description: "บัญชีของคุณได้รับการยืนยันแล้ว",
      })

      // นำผู้ใช้ไปยังหน้า Dashboard หรือหน้าอื่นๆ
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Error verifying OTP:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "รหัส OTP ไม่ถูกต้องหรือหมดอายุ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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
                <CheckCircle2 className="mx-auto h-10 w-10 text-yellow-400" />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                  ยืนยันอีเมลด้วยรหัส OTP
                </h1>
                <p className="text-zinc-400 text-sm">กรุณากรอกรหัส OTP ที่เราส่งไปยังอีเมลของคุณเพื่อยืนยันบัญชีผู้ใช้</p>
              </motion.div>

              <div className="space-y-5">
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
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <motion.button
                    onClick={handleSendOTP}
                    disabled={isSending || countdown > 0}
                    className={`w-full py-2 flex justify-center items-center gap-2 rounded-lg transition-all ${
                      countdown > 0
                        ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                        : "bg-yellow-500/80 hover:bg-yellow-500 text-black font-medium"
                    }`}
                    variants={buttonVariants}
                    initial="idle"
                    whileHover={countdown > 0 ? "idle" : "hover"}
                    whileTap={countdown > 0 ? "idle" : "tap"}
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>กำลังส่ง...</span>
                      </>
                    ) : countdown > 0 ? (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        <span>ส่งอีกครั้งใน {countdown} วินาที</span>
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4" />
                        <span>ส่งรหัส OTP</span>
                      </>
                    )}
                  </motion.button>
                </motion.div>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-700"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-zinc-900 text-zinc-400">กรอกรหัส OTP</span>
                  </div>
                </div>

                <motion.div className="space-y-2" variants={itemVariants}>
                  <label htmlFor="otp" className="text-sm font-medium flex items-center gap-2 text-zinc-300">
                    <Key className="h-4 w-4 text-yellow-400" />
                    รหัส OTP
                  </label>
                  <div className="relative">
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800/60 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all"
                      placeholder="กรอกรหัส OTP ที่ได้รับทางอีเมล"
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <motion.button
                    onClick={handleVerifyOTP}
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-medium rounded-lg flex justify-center items-center gap-2 shadow-lg shadow-yellow-500/20"
                    variants={buttonVariants}
                    initial="idle"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>กำลังยืนยัน...</span>
                      </>
                    ) : (
                      <>
                        <span>ยืนยันรหัส OTP</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </div>

              <motion.div className="text-center text-sm text-zinc-400" variants={itemVariants}>
                ไม่ได้รับรหัส OTP?{" "}
                <button
                  onClick={handleSendOTP}
                  disabled={countdown > 0}
                  className={`${
                    countdown > 0 ? "text-zinc-500" : "text-yellow-400 hover:text-yellow-300 hover:underline"
                  } transition-colors`}
                >
                  {countdown > 0 ? `ส่งอีกครั้งใน ${countdown} วินาที` : "ส่งอีกครั้ง"}
                </button>
              </motion.div>

              <motion.div className="text-center text-sm text-zinc-400" variants={itemVariants}>
                <Link
                  href="/signin"
                  className="text-yellow-400 hover:text-yellow-300 hover:underline transition-colors"
                >
                  กลับไปหน้าเข้าสู่ระบบ
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
