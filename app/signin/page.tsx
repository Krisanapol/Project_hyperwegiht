"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2, Mail, Lock, Eye, EyeOff, CheckCircle } from "lucide-react"
import { Header } from "@/components/header"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await signIn(email, password)

      if (error) {
        throw error
      }

      toast({
        title: "เข้าสู่ระบบสำเร็จ",
        description: "ยินดีต้อนรับกลับมา!",
      })

      // Redirect to dashboard after successful login
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Error signing in:", error)
      toast({
        title: "เข้าสู่ระบบไม่สำเร็จ",
        description: "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  // Item animation variants
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div className="w-full max-w-md" initial="hidden" animate="visible" variants={containerVariants}>
          <motion.div className="mb-8" variants={itemVariants}>
            <Link
              href="/"
              className="inline-flex items-center text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              กลับไปหน้าหลัก
            </Link>
          </motion.div>

          <motion.div
            className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm shadow-xl"
            variants={itemVariants}
          >
            {/* Decorative elements */}
            <div className="absolute -top-24 -right-24 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="p-6 space-y-6 relative z-10">
              <motion.div className="space-y-2 text-center" variants={itemVariants}>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                  เข้าสู่ระบบ
                </h1>
                <p className="text-zinc-400">ยินดีต้อนรับกลับมา! กรุณาเข้าสู่ระบบเพื่อใช้งาน</p>
              </motion.div>

              <motion.form className="space-y-5" onSubmit={handleSubmit} variants={containerVariants}>
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
                      className="w-full px-4 py-3 bg-zinc-800/60 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    {email && email.includes("@") && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
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
                      className="w-full px-4 py-3 bg-zinc-800/60 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </motion.div>

                <motion.div className="flex items-center space-x-2" variants={itemVariants}>
                  <div className="relative inline-flex items-center">
                    <input
                      id="remember"
                      type="checkbox"
                      className="peer h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-yellow-400 focus:ring-yellow-400/50 focus:ring-offset-zinc-900"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <div className="absolute inset-0 rounded peer-checked:bg-yellow-400 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                  </div>
                  <label htmlFor="remember" className="text-sm text-zinc-400 hover:text-zinc-300 cursor-pointer">
                    จดจำฉันไว้
                  </label>
                </motion.div>

                <motion.button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg text-black font-medium hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg shadow-yellow-400/20 flex justify-center items-center"
                  disabled={isLoading}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      กำลังเข้าสู่ระบบ...
                    </span>
                  ) : (
                    "เข้าสู่ระบบ"
                  )}
                </motion.button>
              </motion.form>

              <motion.div className="text-center text-sm text-zinc-400" variants={itemVariants}>
                ยังไม่มีบัญชี?{" "}
                <Link
                  href="/signup"
                  className="text-yellow-400 hover:text-yellow-300 hover:underline transition-colors"
                >
                  สมัครสมาชิก
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
