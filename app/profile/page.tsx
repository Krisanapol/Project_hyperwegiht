"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Pencil, Save, User, Activity, Loader2, AlertCircle, Lock, Calendar, BarChart3, Clock } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Animation variants
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

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
}

export default function ProfilePage() {
  // สถานะสำหรับการแก้ไข
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // สถานะสำหรับข้อมูลผู้ใช้
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

  const router = useRouter()
  const { user, profile, updateProfile, refreshProfile, isLoading: authLoading } = useAuth()

  // โหลดข้อมูลผู้ใช้เมื่อ component โหลด
  useEffect(() => {
    if (user) {
      setUserData({
        firstName: profile?.first_name || "",
        lastName: profile?.last_name || "",
        email: user.email || "",
        phone: profile?.phone || "",
      })
    }
  }, [user, profile])

  // ฟังก์ชันสำหรับการเปลี่ยนแปลงข้อมูล
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setUserData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  // ฟังก์ชันสำหรับการบันทึกข้อมูล
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await updateProfile({
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
      })

      if (error) {
        throw error
      }

      toast({
        title: "บันทึกข้อมูลสำเร็จ",
        description: "ข้อมูลส่วนตัวของคุณถูกอัปเดตแล้ว",
      })

      setIsEditing(false)
    } catch (error: any) {
      console.error("Error saving profile:", error)
      setError(error.message || "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง")
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // ฟังก์ชันสำหรับการแปลงวันที่เป็นรูปแบบที่อ่านง่าย
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })
  }

  // แสดงตัวโหลดขณะกำลังตรวจสอบสถานะการล็อกอิน
  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <Loader2 className="h-12 w-12 animate-spin text-yellow-400" />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg font-medium"
          >
            กำลังโหลด...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <DashboardHeader activePage="profile" />

      <motion.main
        className="container mx-auto px-4 py-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="flex flex-col gap-6">
          <motion.h1 className="text-3xl font-bold" variants={itemVariants}>
            โปรไฟล์ของฉัน
          </motion.h1>

          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
            <div className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card className="overflow-hidden border-none shadow-lg bg-zinc-900/60 text-white">
                  <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 h-16" />
                  <CardContent className="pt-0 relative">
                    <div className="flex flex-col items-center space-y-4">
                      <motion.div
                        className="relative h-32 w-32 rounded-full overflow-hidden bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center border-4 border-zinc-900 shadow-xl -mt-16"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <User className="h-16 w-16 text-black" />
                      </motion.div>
                      <div className="space-y-1 text-center mt-2">
                        <h3 className="text-xl font-semibold text-white">
                          {userData.firstName || userData.lastName
                            ? `${userData.firstName} ${userData.lastName}`
                            : user?.email?.split("@")[0] || "ผู้ใช้"}
                        </h3>
                        <p className="text-sm text-zinc-400">{userData.email}</p>
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Alert variant="destructive" className="mt-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        </motion.div>
                      )}

                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full">
                        <Button
                          onClick={() => router.push("/profile/change-password")}
                          className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black shadow-md transition-all duration-300"
                        >
                          <Lock className="h-4 w-4" />
                          เปลี่ยนรหัสผ่าน
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="border-none shadow-lg overflow-hidden bg-zinc-900/60 text-white">
                  <CardHeader className="bg-zinc-900/80">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-yellow-400" />
                      สถิติของฉัน
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <motion.div
                        className="flex justify-between items-center p-3 rounded-lg hover:bg-zinc-800/60 transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <span className="text-zinc-400 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-yellow-400" />
                          สมาชิกตั้งแต่
                        </span>
                        <span className="font-medium text-white">{formatDate(profile?.created_at)}</span>
                      </motion.div>
                      <motion.div
                        className="flex justify-between items-center p-3 rounded-lg hover:bg-zinc-800/60 transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <span className="text-zinc-400 flex items-center gap-2">
                          <Activity className="h-4 w-4 text-yellow-400" />
                          บันทึกข้อมูลสุขภาพ
                        </span>
                        <span className="font-medium text-white">{profile?.health_records_count || 0} ครั้ง</span>
                      </motion.div>
                      <motion.div
                        className="flex justify-between items-center p-3 rounded-lg hover:bg-zinc-800/60 transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <span className="text-zinc-400 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-400" />
                          อัปเดตล่าสุด
                        </span>
                        <span className="font-medium text-white">{formatDate(profile?.updated_at)}</span>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div className="space-y-6" variants={itemVariants}>
              <Card className="border-none shadow-lg overflow-hidden bg-zinc-900/60 text-white">
                <CardHeader className="flex flex-row items-center justify-between bg-zinc-900/80">
                  <div>
                    <CardTitle>ข้อมูลส่วนตัว</CardTitle>
                    <CardDescription className="text-zinc-400">แก้ไขข้อมูลส่วนตัวของคุณ</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-md">
                      <Activity className="h-8 w-8 text-black" />
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant={isEditing ? "outline" : "default"}
                        className={
                          isEditing
                            ? "border-yellow-400 text-yellow-400 hover:bg-zinc-800/60"
                            : "bg-yellow-400 hover:bg-yellow-500 text-black shadow-md"
                        }
                        onClick={() => setIsEditing(!isEditing)}
                        disabled={isLoading}
                      >
                        {isEditing ? (
                          <>
                            <Pencil className="h-4 w-4 mr-2" />
                            ยกเลิกการแก้ไข
                          </>
                        ) : (
                          <>
                            <Pencil className="h-4 w-4 mr-2" />
                            แก้ไขข้อมูล
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <motion.form
                    className="space-y-4"
                    onSubmit={handleSave}
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium text-zinc-300">
                          ชื่อ
                        </Label>
                        <motion.div whileHover={{ scale: isEditing ? 1.02 : 1 }}>
                          <Input
                            id="firstName"
                            placeholder="ชื่อ"
                            value={userData.firstName}
                            onChange={handleChange}
                            disabled={!isEditing || isLoading}
                            className={
                              !isEditing
                                ? "bg-zinc-800/60 text-white border-zinc-700 cursor-not-allowed"
                                : "bg-zinc-800/60 text-white border-zinc-700 focus:border-yellow-400 focus:ring-yellow-400 transition-all duration-300 shadow-sm"
                            }
                          />
                        </motion.div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-medium text-zinc-300">
                          นามสกุล
                        </Label>
                        <motion.div whileHover={{ scale: isEditing ? 1.02 : 1 }}>
                          <Input
                            id="lastName"
                            placeholder="นามสกุล"
                            value={userData.lastName}
                            onChange={handleChange}
                            disabled={!isEditing || isLoading}
                            className={
                              !isEditing
                                ? "bg-zinc-800/60 text-white border-zinc-700 cursor-not-allowed"
                                : "bg-zinc-800/60 text-white border-zinc-700 focus:border-yellow-400 focus:ring-yellow-400 transition-all duration-300 shadow-sm"
                            }
                          />
                        </motion.div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-zinc-300">
                        อีเมล
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="อีเมล"
                        value={userData.email}
                        disabled
                        className="bg-zinc-800/60 text-white border-zinc-700 cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-zinc-300">
                        เบอร์โทรศัพท์
                      </Label>
                      <motion.div whileHover={{ scale: isEditing ? 1.02 : 1 }}>
                        <Input
                          id="phone"
                          placeholder="เบอร์โทรศัพท์"
                          value={userData.phone}
                          onChange={handleChange}
                          disabled={!isEditing || isLoading}
                          className={
                            !isEditing
                              ? "bg-zinc-800/60 text-white border-zinc-700 cursor-not-allowed"
                              : "bg-zinc-800/60 text-white border-zinc-700 focus:border-yellow-400 focus:ring-yellow-400 transition-all duration-300 shadow-sm"
                          }
                        />
                      </motion.div>
                    </div>

                    {isEditing && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      >
                        <Button
                          type="submit"
                          className="bg-yellow-400 hover:bg-yellow-500 text-black shadow-md transition-all duration-300"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              กำลังบันทึก...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              บันทึกการเปลี่ยนแปลง
                            </>
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </motion.form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.main>
    </div>
  )
}
