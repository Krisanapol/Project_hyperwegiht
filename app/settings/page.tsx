"use client"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { LogOut, KeyRound, Settings2, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

export default function SettingsPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { signOut } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await signOut()
      toast({
        title: "ออกจากระบบสำเร็จ",
        description: "คุณได้ออกจากระบบแล้ว",
      })
      router.push("/signin")
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถออกจากระบบได้ โปรดลองอีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setIsLoggingOut(false)
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
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
    tap: { scale: 0.95 },
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <DashboardHeader activePage="settings" />

      <main className="container mx-auto px-4 py-8">
        <motion.div className="flex flex-col gap-6" initial="hidden" animate="visible" variants={containerVariants}>
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <Settings2 className="h-8 w-8 text-yellow-400" />
            <h1 className="text-3xl font-bold">{t.settings_title}</h1>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-zinc-800 bg-zinc-900/60 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-zinc-900 to-zinc-800 border-b border-zinc-800">
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="text-yellow-400">
                    <Settings2 className="h-5 w-5 inline-block mr-2" />
                  </span>
                  {t.account_info}
                </CardTitle>
                <CardDescription className="text-zinc-400">{t.account_description}</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
                  <motion.div
                    className="flex items-center justify-between p-4 rounded-lg border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/40 transition-colors duration-200"
                    variants={itemVariants}
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-yellow-400/10 text-yellow-400">
                        <KeyRound className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">เปลี่ยนรหัสผ่าน</p>
                        <p className="text-sm text-zinc-400">เปลี่ยนรหัสผ่านเพื่อความปลอดภัยของบัญชีคุณ</p>
                      </div>
                    </div>
                    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                      <Button
                        variant="outline"
                        onClick={() => router.push("/profile/change-password")}
                        className="border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700/50 hover:text-yellow-400 transition-all duration-200"
                      >
                        เปลี่ยนรหัสผ่าน
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>
                  </motion.div>

                  <motion.div
                    className="flex items-center justify-between p-4 rounded-lg border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/40 transition-colors duration-200"
                    variants={itemVariants}
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-red-400/10 text-red-400">
                        <LogOut className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">ออกจากระบบ</p>
                        <p className="text-sm text-zinc-400">ออกจากระบบและกลับไปยังหน้าเข้าสู่ระบบ</p>
                      </div>
                    </div>
                    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                      <Button
                        variant="destructive"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-none text-white transition-all duration-200"
                      >
                        {isLoggingOut ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                            กำลังออกจากระบบ...
                          </>
                        ) : (
                          <>
                            <LogOut className="mr-2 h-4 w-4" />
                            ออกจากระบบ
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
