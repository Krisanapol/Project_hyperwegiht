"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import {
  Loader2,
  Target,
  ArrowLeft,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Trash2,
  RefreshCw,
  Edit,
  BarChart3,
  Award,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  type Goal,
  getGoalById,
  updateGoalProgress,
  calculateGoalProgress,
  getGoalTypeText,
  getGoalUnit,
  deleteGoal,
} from "@/lib/goals"
import { UpdateGoalProgress } from "@/components/update-goal-progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { calculateRemainingDays } from "@/lib/utils"
import Link from "next/link"

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

export default function GoalDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const [goal, setGoal] = useState<Goal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<Goal["status"]>("active")
  const [showUpdateForm, setShowUpdateForm] = useState(false)

  // โหลดข้อมูลเป้าหมาย
  useEffect(() => {
    const loadGoal = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        const goalId = Number.parseInt(params.id)
        if (isNaN(goalId)) {
          toast({
            title: "เกิดข้อผิดพลาด",
            description: "รหัสเป้าหมายไม่ถูกต้อง",
            variant: "destructive",
          })
          router.push("/dashboard/goals")
          return
        }

        const data = await getGoalById(goalId)
        if (!data) {
          toast({
            title: "ไม่พบเป้าหมาย",
            description: "ไม่พบข้อมูลเป้าหมายที่ต้องการ",
            variant: "destructive",
          })
          router.push("/dashboard/goals")
          return
        }

        setGoal(data)
      } catch (error) {
        console.error("Error loading goal:", error)
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลเป้าหมายได้ กรุณาลองใหม่อีกครั้ง",
          variant: "destructive",
        })
        router.push("/dashboard/goals")
      } finally {
        setIsLoading(false)
      }
    }

    loadGoal()
  }, [user, params.id, router])

  // ฟังก์ชันสำหรับอัปเดตสถานะเป้าหมาย
  const handleUpdateGoalStatus = async () => {
    if (!goal) return

    try {
      await updateGoalProgress(goal.id, goal.current_value, newStatus)
      toast({
        title: "อัปเดตสถานะสำเร็จ",
        description: `เป้าหมายถูกอัปเดตเป็น${newStatus === "completed" ? "สำเร็จ" : "ยกเลิก"}แล้ว`,
      })

      // อัปเดตข้อมูลเป้าหมายในหน้าจอ
      setGoal({ ...goal, status: newStatus })
    } catch (error) {
      console.error("Error updating goal status:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตสถานะเป้าหมายได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setIsStatusDialogOpen(false)
    }
  }

  // ฟังก์ชันสำหรับลบเป้าหมาย
  const handleDeleteGoal = async () => {
    if (!goal) return

    try {
      await deleteGoal(goal.id)
      toast({
        title: "ลบเป้าหมายสำเร็จ",
        description: "เป้าหมายถูกลบออกจากระบบแล้ว",
      })
      router.push("/dashboard/goals")
    } catch (error) {
      console.error("Error deleting goal:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบเป้าหมายได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  // ฟังก์ชันสำหรับแสดงไอคอนตามประเภทเป้าหมาย
  const getGoalTypeIcon = (goalType: string, isIncreasing: boolean) => {
    switch (goalType) {
      case "weight":
        return isIncreasing ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />
      case "bmi":
        return isIncreasing ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />
      case "body_fat":
        return <TrendingDown className="h-6 w-6" />
      case "water_intake":
        return <TrendingUp className="h-6 w-6" />
      default:
        return <Target className="h-6 w-6" />
    }
  }

  // ฟังก์ชันสำหรับแสดงสีตามประเภทเป้าหมาย
  const getGoalTypeColor = (goalType: string) => {
    switch (goalType) {
      case "weight":
        return "from-yellow-400 to-yellow-500"
      case "bmi":
        return "from-green-400 to-green-500"
      case "body_fat":
        return "from-red-400 to-red-500"
      case "water_intake":
        return "from-cyan-400 to-cyan-500"
      default:
        return "from-gray-400 to-gray-500"
    }
  }

  // ฟังก์ชันสำหรับแสดงสถานะเป้าหมาย
  const getStatusBadge = (status: Goal["status"]) => {
    switch (status) {
      case "active":
        return (
          <div className="flex items-center gap-1 bg-yellow-400/20 text-yellow-500 rounded-full px-3 py-1">
            <Target className="h-4 w-4" />
            <span>กำลังดำเนินการ</span>
          </div>
        )
      case "completed":
        return (
          <div className="flex items-center gap-1 bg-green-400/20 text-green-500 rounded-full px-3 py-1">
            <CheckCircle2 className="h-4 w-4" />
            <span>สำเร็จแล้ว</span>
          </div>
        )
      case "abandoned":
        return (
          <div className="flex items-center gap-1 bg-red-400/20 text-red-500 rounded-full px-3 py-1">
            <XCircle className="h-4 w-4" />
            <span>ยกเลิก</span>
          </div>
        )
      default:
        return null
    }
  }

  // ฟังก์ชันสำหรับแสดง dialog ยืนยันการเปลี่ยนสถานะ
  const handleConfirmStatusChange = (status: Goal["status"]) => {
    setNewStatus(status)
    setIsStatusDialogOpen(true)
  }

  // ฟังก์ชันสำหรับคำนวณความก้าวหน้าเทียบกับเวลา
  const calculateTimeProgress = (startDate: string, targetDate: string) => {
    const start = new Date(startDate).getTime()
    const target = new Date(targetDate).getTime()
    const now = new Date().getTime()

    if (now >= target) return 100
    if (now <= start) return 0

    return ((now - start) / (target - start)) * 100
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <DashboardHeader activePage="goals" />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <Loader2 className="h-12 w-12 animate-spin text-yellow-400 mb-4" />
            <p className="text-muted-foreground">กำลังโหลดข้อมูลเป้าหมาย...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <DashboardHeader activePage="goals" />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-20 h-20 rounded-full bg-red-400/20 flex items-center justify-center mb-4">
              <AlertTriangle className="h-10 w-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">ไม่พบเป้าหมาย</h2>
            <p className="text-muted-foreground mb-6">ไม่พบข้อมูลเป้าหมายที่ต้องการ</p>
            <Button asChild>
              <Link href="/dashboard/goals">
                <ArrowLeft className="mr-2 h-4 w-4" />
                กลับไปหน้าเป้าหมาย
              </Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const progress = calculateGoalProgress(goal)
  const timeProgress = calculateTimeProgress(goal.start_date, goal.target_date)
  const remainingDays = calculateRemainingDays(goal.target_date)
  const isIncreasing = goal.target_value > goal.start_value
  const formattedStartDate = new Date(goal.start_date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const formattedTargetDate = new Date(goal.target_date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  // ตรวจสอบว่าเป้าหมายนี้อัพเดทอัตโนมัติได้หรือไม่
  const isAutoUpdatable = true // เนื่องจากไม่มี exercise แล้ว ทุกเป้าหมายจะอัพเดทอัตโนมัติได้

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader activePage="goals" />
      <main className="container mx-auto px-4 py-8">
        <motion.div className="flex flex-col gap-6" initial="hidden" animate="visible" variants={containerVariants}>
          {/* Header with back button */}
          <motion.div className="flex items-center gap-4" variants={itemVariants}>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full" asChild>
              <Link href="/dashboard/goals">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">รายละเอียดเป้าหมาย</h1>
          </motion.div>

          {/* Goal Header Card */}
          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-lg overflow-hidden bg-gradient-to-br from-background to-secondary/10">
              <div className={`w-full h-2 bg-gradient-to-r ${getGoalTypeColor(goal.goal_type)}`}></div>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <motion.div
                      className={`w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br ${getGoalTypeColor(goal.goal_type)} flex items-center justify-center shadow-lg text-black`}
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {getGoalTypeIcon(goal.goal_type, isIncreasing)}
                    </motion.div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-2xl font-bold">เป้าหมาย{getGoalTypeText(goal.goal_type)}</h2>
                        {progress >= 100 && goal.status === "active" && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 10 }}
                          >
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                          </motion.div>
                        )}
                      </div>
                      <p className="text-lg text-muted-foreground">
                        {isIncreasing ? "เพิ่ม" : "ลด"}จาก {goal.start_value} {getGoalUnit(goal.goal_type)} เป็น{" "}
                        {goal.target_value} {getGoalUnit(goal.goal_type)}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {getStatusBadge(goal.status)}
                        {isAutoUpdatable && (
                          <div className="flex items-center gap-1 bg-green-400/20 text-green-500 rounded-full px-3 py-1">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </motion.div>
                            <span>อัพเดทอัตโนมัติ</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {goal.status === "active" && (
                      <>
                        <Button
                          variant="outline"
                          className="bg-green-400/10 hover:bg-green-400/20 text-green-500 border-none"
                          onClick={() => handleConfirmStatusChange("completed")}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          ทำเครื่องหมายว่าสำเร็จ
                        </Button>
                        <Button
                          variant="outline"
                          className="bg-red-400/10 hover:bg-red-400/20 text-red-500 border-none"
                          onClick={() => handleConfirmStatusChange("abandoned")}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          ยกเลิกเป้าหมาย
                        </Button>
                      </>
                    )}
                    {goal.status !== "active" && (
                      <Button
                        variant="outline"
                        className="bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-500 border-none"
                        onClick={() => handleConfirmStatusChange("active")}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        เริ่มเป้าหมายใหม่
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="bg-red-400/10 hover:bg-red-400/20 text-red-500 border-none"
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      ลบเป้าหมาย
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Progress and Details */}
            <motion.div className="lg:col-span-2" variants={itemVariants}>
              <Card className="border-none shadow-lg overflow-hidden bg-gradient-to-br from-background to-secondary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-yellow-500" />
                    ความก้าวหน้า
                  </CardTitle>
                  <CardDescription>ติดตามความก้าวหน้าของเป้าหมาย</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progress Section */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">ความก้าวหน้าของเป้าหมาย</h3>
                        <motion.span
                          className="text-2xl font-bold"
                          key={progress}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {progress.toFixed(0)}%
                        </motion.span>
                      </div>
                      <div className="relative h-4 w-full bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getGoalTypeColor(goal.goal_type)}`}
                          initial={{ width: "0%" }}
                          animate={{ width: `${Math.min(progress, 100)}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                      <div className="grid grid-cols-3 text-sm mt-1">
                        <div className="text-center">
                          <div className="text-muted-foreground">เริ่มต้น</div>
                          <div className="font-medium">
                            {goal.start_value} {getGoalUnit(goal.goal_type)}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">ปัจจุบัน</div>
                          <motion.div
                            className="font-medium"
                            key={goal.current_value}
                            initial={{ scale: 1.2, fontWeight: "bold", color: "#facc15" }}
                            animate={{ scale: 1, fontWeight: "normal", color: "currentColor" }}
                            transition={{ duration: 0.5 }}
                          >
                            {goal.current_value} {getGoalUnit(goal.goal_type)}
                          </motion.div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">เป้าหมาย</div>
                          <div className="font-medium">
                            {goal.target_value} {getGoalUnit(goal.goal_type)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">ความก้าวหน้าตามเวลา</h3>
                        <motion.span
                          className="text-2xl font-bold"
                          key={timeProgress}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {timeProgress.toFixed(0)}%
                        </motion.span>
                      </div>
                      <div className="relative h-4 w-full bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-blue-500"
                          initial={{ width: "0%" }}
                          animate={{ width: `${Math.min(timeProgress, 100)}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                      <div className="grid grid-cols-3 text-sm mt-1">
                        <div className="text-center">
                          <div className="text-muted-foreground">วันเริ่มต้น</div>
                          <div className="font-medium">{formattedStartDate}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">วันนี้</div>
                          <div className="font-medium">{new Date().toLocaleDateString("th-TH")}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">วันสิ้นสุด</div>
                          <div className="font-medium">{formattedTargetDate}</div>
                        </div>
                      </div>
                    </div>

                    {/* Time Remaining */}
                    <motion.div
                      className="flex items-center justify-center gap-4 p-4 bg-secondary/30 rounded-xl"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-400/20 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">เวลาที่เหลือ</h3>
                        <p className="text-2xl font-bold">{remainingDays > 0 ? `${remainingDays} วัน` : "ถึงกำหนดแล้ว"}</p>
                      </div>
                    </motion.div>

                    {/* Comparison */}
                    <div className="p-4 bg-secondary/30 rounded-xl">
                      <h3 className="text-lg font-medium mb-3">การเปรียบเทียบ</h3>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>ความก้าวหน้าของเป้าหมาย</span>
                            <span>{progress.toFixed(0)}%</span>
                          </div>
                          <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <motion.div
                              className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getGoalTypeColor(goal.goal_type)}`}
                              initial={{ width: "0%" }}
                              animate={{ width: `${Math.min(progress, 100)}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>ความก้าวหน้าตามเวลา</span>
                            <span>{timeProgress.toFixed(0)}%</span>
                          </div>
                          <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <motion.div
                              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-blue-500"
                              initial={{ width: "0%" }}
                              animate={{ width: `${Math.min(timeProgress, 100)}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-center">
                        {progress > timeProgress ? (
                          <div className="text-green-500 font-medium">คุณกำลังทำได้เร็วกว่ากำหนด! 🎉</div>
                        ) : progress < timeProgress ? (
                          <div className="text-yellow-500 font-medium">คุณกำลังทำได้ช้ากว่ากำหนด ต้องเร่งมือหน่อยนะ! 💪</div>
                        ) : (
                          <div className="text-blue-500 font-medium">คุณกำลังทำได้ตามกำหนดพอดี! 👍</div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Column - Update Progress */}
            <motion.div className="lg:col-span-1" variants={itemVariants}>
              <AnimatePresence mode="wait">
                {showUpdateForm || !isAutoUpdatable ? (
                  <motion.div
                    key="update-form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <Card className="border-none shadow-lg overflow-hidden bg-gradient-to-br from-background to-secondary/10">
                      <CardHeader className="bg-gradient-to-r from-yellow-400/20 to-yellow-500/10 pb-4 flex flex-row justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Edit className="h-5 w-5 text-yellow-500" />
                            อัพเดทความก้าวหน้า
                          </CardTitle>
                          <CardDescription>อัพเดทค่าปัจจุบันของเป้าหมาย</CardDescription>
                        </div>
                        {isAutoUpdatable && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full h-8 w-8 bg-background/50 hover:bg-background/80"
                            onClick={() => setShowUpdateForm(false)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </CardHeader>
                      <CardContent className="pt-6">
                        <UpdateGoalProgress
                          goal={goal}
                          onSuccess={(updatedGoal) => {
                            setGoal(updatedGoal)
                            if (isAutoUpdatable) setShowUpdateForm(false)
                          }}
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div
                    key="info-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <Card className="border-none shadow-lg overflow-hidden bg-gradient-to-br from-background to-secondary/10 h-full">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="h-5 w-5 text-yellow-500" />
                          ข้อมูลเป้าหมาย
                        </CardTitle>
                        <CardDescription>รายละเอียดเกี่ยวกับเป้าหมายของคุณ</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <motion.div
                            className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30"
                            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                          >
                            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black p-2 rounded-full">
                              <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-medium">ระยะเวลา</h4>
                              <p className="text-sm text-muted-foreground">
                                {formattedStartDate} - {formattedTargetDate}
                              </p>
                            </div>
                          </motion.div>

                          <motion.div
                            className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30"
                            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                          >
                            <div
                              className={`bg-gradient-to-r ${getGoalTypeColor(goal.goal_type)} text-black p-2 rounded-full`}
                            >
                              {getGoalTypeIcon(goal.goal_type, isIncreasing)}
                            </div>
                            <div>
                              <h4 className="font-medium">ประเภทเป้าหมาย</h4>
                              <p className="text-sm text-muted-foreground">
                                {getGoalTypeText(goal.goal_type)} ({isIncreasing ? "เพิ่ม" : "ลด"})
                              </p>
                            </div>
                          </motion.div>

                          <motion.div
                            className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30"
                            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                          >
                            <div className="bg-gradient-to-r from-blue-400 to-blue-500 text-black p-2 rounded-full">
                              <RefreshCw className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-medium">การอัพเดท</h4>
                              <p className="text-sm text-muted-foreground">
                                {isAutoUpdatable ? "อัพเดทอัตโนมัติเมื่อบันทึกข้อมูลสุขภาพใหม่" : "ต้องอัพเดทด้วยตนเอง"}
                              </p>
                            </div>
                          </motion.div>
                        </div>

                        <Button
                          onClick={() => setShowUpdateForm(true)}
                          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300"
                        >
                          <Edit className="mr-2 h-5 w-5" />
                          อัพเดทความก้าวหน้า
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Dialog ยืนยันการลบเป้าหมาย */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="border-none bg-gradient-to-br from-background to-secondary/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              ยืนยันการลบเป้าหมาย
            </AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบเป้าหมายนี้? การกระทำนี้ไม่สามารถย้อนกลับได้ และข้อมูลเป้าหมายทั้งหมดจะถูกลบออกจากระบบ
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-none bg-secondary/50 hover:bg-secondary">ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGoal}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-none"
            >
              ลบเป้าหมาย
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog ยืนยันการเปลี่ยนสถานะ */}
      <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <AlertDialogContent className="border-none bg-gradient-to-br from-background to-secondary/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {newStatus === "completed" ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : newStatus === "abandoned" ? (
                <XCircle className="h-5 w-5 text-red-500" />
              ) : (
                <RefreshCw className="h-5 w-5 text-yellow-500" />
              )}
              ยืนยันการเปลี่ยนสถานะเป้าหมาย
            </AlertDialogTitle>
            <AlertDialogDescription>
              {newStatus === "completed"
                ? "คุณแน่ใจหรือไม่ว่าต้องการทำเครื่องหมายเป้าหมายนี้ว่าสำเร็จแล้ว?"
                : newStatus === "abandoned"
                  ? "คุณแน่ใจหรือไม่ว่าต้องการยกเลิกเป้าหมายนี้?"
                  : "คุณแน่ใจหรือไม่ว่าต้องการเริ่มเป้าหมายนี้ใหม่?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-none bg-secondary/50 hover:bg-secondary">ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpdateGoalStatus}
              className={`bg-gradient-to-r text-white border-none ${
                newStatus === "completed"
                  ? "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  : newStatus === "abandoned"
                    ? "from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                    : "from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black"
              }`}
            >
              {newStatus === "completed"
                ? "ทำเครื่องหมายว่าสำเร็จ"
                : newStatus === "abandoned"
                  ? "ยกเลิกเป้าหมาย"
                  : "เริ่มเป้าหมายใหม่"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
