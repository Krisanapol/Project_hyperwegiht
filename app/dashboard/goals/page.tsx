"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import {
  Loader2,
  Target,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Trash2,
  AlertTriangle,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Award,
  Calendar,
  Clock,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  type Goal,
  getUserGoals,
  updateGoalProgress,
  calculateGoalProgress,
  getGoalTypeText,
  getGoalUnit,
  deleteGoal,
} from "@/lib/goals"
import { GoalForm } from "@/components/goal-form"
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

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
}

export default function GoalsPage() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("active")
  const [goalToDelete, setGoalToDelete] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)

  // โหลดข้อมูลเป้าหมาย
  const loadGoals = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const data = await getUserGoals(user.id)
      setGoals(data)
    } catch (error) {
      console.error("Error loading goals:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลเป้าหมายได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadGoals()
  }, [loadGoals])

  // กรองเป้าหมายตามสถานะ
  const filteredGoals = goals.filter((goal) => {
    if (activeTab === "active") return goal.status === "active"
    if (activeTab === "completed") return goal.status === "completed"
    if (activeTab === "abandoned") return goal.status === "abandoned"
    return true
  })

  // ฟังก์ชันสำหรับอัปเดตสถานะเป้าหมาย
  const handleUpdateGoalStatus = async (goalId: number, status: Goal["status"]) => {
    try {
      const goal = goals.find((g) => g.id === goalId)
      if (!goal) return

      await updateGoalProgress(goalId, goal.current_value, status)
      toast({
        title: "อัปเดตสถานะสำเร็จ",
        description: `เป้าหมายถูกอัปเดตเป็น${status === "completed" ? "สำเร็จ" : "ยกเลิก"}แล้ว`,
      })
      loadGoals()
    } catch (error) {
      console.error("Error updating goal status:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตสถานะเป้าหมายได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    }
  }

  // ฟังก์ชันสำหรับเปิด dialog ยืนยันการลบเป้าหมาย
  const handleConfirmDelete = (goalId: number) => {
    setGoalToDelete(goalId)
    setIsDeleteDialogOpen(true)
  }

  // ฟังก์ชันสำหรับลบเป้าหมาย
  const handleDeleteGoal = async () => {
    if (!goalToDelete) return

    try {
      await deleteGoal(goalToDelete)
      toast({
        title: "ลบเป้าหมายสำเร็จ",
        description: "เป้าหมายถูกลบออกจากระบบแล้ว",
      })
      loadGoals()
    } catch (error) {
      console.error("Error deleting goal:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบเป้าหมายได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setGoalToDelete(null)
    }
  }

  // คำนวณสถิติเป้าหมาย
  const goalStats = {
    active: goals.filter((g) => g.status === "active").length,
    completed: goals.filter((g) => g.status === "completed").length,
    abandoned: goals.filter((g) => g.status === "abandoned").length,
    total: goals.length,
  }

  // ฟังก์ชันสำหรับแสดงไอคอนตามประเภทเป้าหมาย
  const getGoalTypeIcon = (goalType: string, isIncreasing: boolean) => {
    switch (goalType) {
      case "weight":
        return isIncreasing ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />
      case "bmi":
        return isIncreasing ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />
      case "body_fat":
        return <TrendingDown className="h-5 w-5" />
      case "exercise":
        return <TrendingUp className="h-5 w-5" />
      case "water_intake":
        return <TrendingUp className="h-5 w-5" />
      default:
        return <Target className="h-5 w-5" />
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
      case "exercise":
        return "from-blue-400 to-blue-500"
      case "water_intake":
        return "from-cyan-400 to-cyan-500"
      default:
        return "from-gray-400 to-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader activePage="goals" />
      <main className="container mx-auto px-4 py-8">
        <motion.div className="flex flex-col gap-6" initial="hidden" animate="visible" variants={containerVariants}>
          {/* Header Section */}
          <motion.div
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            variants={itemVariants}
          >
            <div className="flex items-center gap-4">
              <motion.div
                className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Target className="h-8 w-8 text-black" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold">เป้าหมายของฉัน</h1>
                <p className="text-muted-foreground">ตั้งเป้าหมายและติดตามความก้าวหน้า</p>
              </div>
            </div>

            <motion.div className="flex flex-wrap gap-3" variants={itemVariants}>
              <motion.div
                className="flex items-center gap-2 bg-secondary/50 rounded-full px-4 py-2"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-8 h-8 rounded-full bg-yellow-400/20 flex items-center justify-center">
                  <Target className="h-4 w-4 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">กำลังดำเนินการ</p>
                  <p className="text-lg font-bold">{goalStats.active}</p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center gap-2 bg-secondary/50 rounded-full px-4 py-2"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">สำเร็จแล้ว</p>
                  <p className="text-lg font-bold">{goalStats.completed}</p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center gap-2 bg-secondary/50 rounded-full px-4 py-2"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-8 h-8 rounded-full bg-red-400/20 flex items-center justify-center">
                  <XCircle className="h-4 w-4 text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">ยกเลิก</p>
                  <p className="text-lg font-bold">{goalStats.abandoned}</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Goal Form */}
            <motion.div className="lg:col-span-1" variants={itemVariants}>
              <AnimatePresence mode="wait">
                {showForm ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <Card className="border-none shadow-lg overflow-hidden bg-gradient-to-br from-background to-secondary/10">
                      <CardHeader className="bg-gradient-to-r from-yellow-400/20 to-yellow-500/10 pb-4 flex flex-row justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <PlusCircle className="h-5 w-5 text-yellow-500" />
                            ตั้งเป้าหมายใหม่
                          </CardTitle>
                          <CardDescription>กำหนดเป้าหมายสุขภาพของคุณเพื่อติดตามความก้าวหน้า</CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full h-8 w-8 bg-background/50 hover:bg-background/80"
                          onClick={() => setShowForm(false)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <GoalForm
                          onSuccess={() => {
                            loadGoals()
                            setShowForm(false)
                          }}
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div
                    key="add-button"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <Card className="border-none shadow-lg overflow-hidden bg-gradient-to-br from-background to-secondary/10 h-full">
                      <CardContent className="p-8 flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                        <motion.div
                          className="w-20 h-20 rounded-full bg-yellow-400/20 flex items-center justify-center mb-6"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <PlusCircle className="h-10 w-10 text-yellow-400" />
                        </motion.div>
                        <h3 className="text-xl font-bold mb-2">ตั้งเป้าหมายใหม่</h3>
                        <p className="text-muted-foreground mb-6">ตั้งเป้าหมายสุขภาพเพื่อติดตามความก้าวหน้าและสร้างแรงจูงใจ</p>
                        <Button
                          onClick={() => setShowForm(true)}
                          className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300"
                          size="lg"
                        >
                          <PlusCircle className="mr-2 h-5 w-5" />
                          เพิ่มเป้าหมายใหม่
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Goal Type Explanation */}
              <motion.div className="mt-6" variants={itemVariants}>
                <Card className="border-none shadow-lg overflow-hidden bg-gradient-to-br from-background to-secondary/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-500" />
                      ประเภทเป้าหมาย
                    </CardTitle>
                    <CardDescription>คำอธิบายประเภทเป้าหมายต่างๆ</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <motion.div
                      className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30"
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                    >
                      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black p-2 rounded-full">
                        <TrendingDown className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">น้ำหนัก</h4>
                        <p className="text-sm text-muted-foreground">ตั้งเป้าหมายเพิ่มหรือลดน้ำหนักตัว</p>
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30"
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                    >
                      <div className="bg-gradient-to-r from-green-400 to-green-500 text-black p-2 rounded-full">
                        <TrendingDown className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">BMI</h4>
                        <p className="text-sm text-muted-foreground">ตั้งเป้าหมายค่าดัชนีมวลกาย</p>
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30"
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                    >
                      <div className="bg-gradient-to-r from-red-400 to-red-500 text-black p-2 rounded-full">
                        <TrendingDown className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">เปอร์เซ็นต์ไขมัน</h4>
                        <p className="text-sm text-muted-foreground">ตั้งเป้าหมายลดเปอร์เซ็นต์ไขมันในร่างกาย</p>
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30"
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                    >
                      <div className="bg-gradient-to-r from-cyan-400 to-cyan-500 text-black p-2 rounded-full">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">การดื่มน้ำ</h4>
                        <p className="text-sm text-muted-foreground">ตั้งเป้าหมายปริมาณการดื่มน้ำต่อวัน</p>
                      </div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Right Column - Goals List */}
            <motion.div className="lg:col-span-2" variants={itemVariants}>
              <Card className="border-none shadow-lg overflow-hidden bg-gradient-to-br from-background to-secondary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-yellow-500" />
                    เป้าหมายทั้งหมด
                  </CardTitle>
                  <CardDescription>จัดการและติดตามเป้าหมายสุขภาพของคุณ</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="active" onValueChange={setActiveTab} className="w-full">
                    <TabsList className="mb-6 grid grid-cols-3 w-full">
                      <TabsTrigger
                        value="active"
                        className="data-[state=active]:bg-yellow-400/20 data-[state=active]:text-yellow-500 data-[state=active]:shadow-none"
                      >
                        <Target className="h-4 w-4 mr-2" />
                        กำลังดำเนินการ
                      </TabsTrigger>
                      <TabsTrigger
                        value="completed"
                        className="data-[state=active]:bg-green-400/20 data-[state=active]:text-green-500 data-[state=active]:shadow-none"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        สำเร็จแล้ว
                      </TabsTrigger>
                      <TabsTrigger
                        value="abandoned"
                        className="data-[state=active]:bg-red-400/20 data-[state=active]:text-red-500 data-[state=active]:shadow-none"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        ยกเลิก
                      </TabsTrigger>
                    </TabsList>

                    <AnimatePresence mode="wait">
                      <TabsContent value={activeTab} className="mt-0">
                        {isLoading ? (
                          <motion.div
                            className="flex flex-col items-center justify-center h-64"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <Loader2 className="h-12 w-12 animate-spin text-yellow-400 mb-4" />
                            <p className="text-muted-foreground">กำลังโหลดข้อมูลเป้าหมาย...</p>
                          </motion.div>
                        ) : filteredGoals.length === 0 ? (
                          <motion.div
                            className="flex flex-col items-center justify-center h-64 text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          >
                            <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                              {activeTab === "active" ? (
                                <Target className="h-10 w-10 text-muted-foreground" />
                              ) : activeTab === "completed" ? (
                                <CheckCircle2 className="h-10 w-10 text-muted-foreground" />
                              ) : (
                                <XCircle className="h-10 w-10 text-muted-foreground" />
                              )}
                            </div>
                            <h3 className="text-xl font-medium mb-2">ไม่พบเป้าหมาย</h3>
                            <p className="text-muted-foreground mb-6 max-w-md">
                              {activeTab === "active"
                                ? "คุณยังไม่มีเป้าหมายที่กำลังดำเนินการ เริ่มตั้งเป้าหมายใหม่เพื่อติดตามความก้าวหน้า"
                                : activeTab === "completed"
                                  ? "คุณยังไม่มีเป้าหมายที่สำเร็จแล้ว ทำเป้าหมายให้สำเร็จเพื่อแสดงในหน้านี้"
                                  : "คุณยังไม่มีเป้าหมายที่ยกเลิก เป้าหมายที่ถูกยกเลิกจะแสดงในหน้านี้"}
                            </p>
                            {activeTab === "active" && (
                              <Button
                                onClick={() => setShowForm(true)}
                                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300"
                              >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                เพิ่มเป้าหมายใหม่
                              </Button>
                            )}
                          </motion.div>
                        ) : (
                          <motion.div
                            className="grid grid-cols-1 gap-4"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                          >
                            {filteredGoals.map((goal) => (
                              <motion.div key={goal.id} variants={itemVariants} layout>
                                <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-background to-secondary/5">
                                  <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row">
                                      {/* Left color bar based on goal type */}
                                      <div
                                        className={`w-full h-2 md:w-2 md:h-auto bg-gradient-to-r md:bg-gradient-to-b ${getGoalTypeColor(goal.goal_type)}`}
                                      ></div>

                                      <div className="p-4 flex-1">
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                          <div className="flex items-start gap-4">
                                            <div
                                              className={`hidden md:flex w-12 h-12 rounded-full items-center justify-center bg-gradient-to-r ${getGoalTypeColor(goal.goal_type)} text-black`}
                                            >
                                              {getGoalTypeIcon(goal.goal_type, goal.target_value > goal.start_value)}
                                            </div>
                                            <div>
                                              <h3 className="text-lg font-semibold flex items-center gap-2">
                                                <span>เป้าหมาย{getGoalTypeText(goal.goal_type)}</span>
                                                {calculateGoalProgress(goal) >= 100 && (
                                                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                )}
                                              </h3>
                                              <p className="text-sm text-muted-foreground">
                                                {goal.target_value > goal.start_value ? "เพิ่ม" : "ลด"}จาก{" "}
                                                {goal.start_value} {getGoalUnit(goal.goal_type)} เป็น {goal.target_value}{" "}
                                                {getGoalUnit(goal.goal_type)}
                                              </p>

                                              <div className="mt-3 space-y-1">
                                                <div className="flex justify-between text-sm">
                                                  <span>ความก้าวหน้า</span>
                                                  <span className="font-medium">
                                                    {calculateGoalProgress(goal).toFixed(0)}%
                                                  </span>
                                                </div>
                                                <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                  <motion.div
                                                    className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getGoalTypeColor(goal.goal_type)}`}
                                                    initial={{ width: "0%" }}
                                                    animate={{
                                                      width: `${Math.min(calculateGoalProgress(goal), 100)}%`,
                                                    }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                  />
                                                </div>
                                              </div>

                                              <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                                                <div>
                                                  <span className="text-muted-foreground">เริ่มต้น:</span>{" "}
                                                  <span className="font-medium">
                                                    {goal.start_value} {getGoalUnit(goal.goal_type)}
                                                  </span>
                                                </div>
                                                <div>
                                                  <span className="text-muted-foreground">ปัจจุบัน:</span>{" "}
                                                  <span className="font-medium">
                                                    {goal.current_value} {getGoalUnit(goal.goal_type)}
                                                  </span>
                                                </div>
                                                <div>
                                                  <span className="text-muted-foreground">เป้าหมาย:</span>{" "}
                                                  <span className="font-medium">
                                                    {goal.target_value} {getGoalUnit(goal.goal_type)}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>

                                          <div className="flex flex-col gap-2">
                                            {activeTab === "active" && (
                                              <>
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  className="h-8 px-3 text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30"
                                                  onClick={() =>
                                                    goal.id && handleUpdateGoalStatus(goal.id, "completed")
                                                  }
                                                >
                                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                                  สำเร็จ
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  className="h-8 px-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                                  onClick={() =>
                                                    goal.id && handleUpdateGoalStatus(goal.id, "abandoned")
                                                  }
                                                >
                                                  <XCircle className="h-4 w-4 mr-1" />
                                                  ยกเลิก
                                                </Button>
                                              </>
                                            )}
                                            {activeTab === "completed" && (
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 px-3 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                                onClick={() => goal.id && handleUpdateGoalStatus(goal.id, "active")}
                                              >
                                                <RefreshCw className="h-4 w-4 mr-1" />
                                                เริ่มใหม่
                                              </Button>
                                            )}
                                            {activeTab === "abandoned" && (
                                              <>
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  className="h-8 px-3 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                                  onClick={() => goal.id && handleUpdateGoalStatus(goal.id, "active")}
                                                >
                                                  <RefreshCw className="h-4 w-4 mr-1" />
                                                  เริ่มใหม่
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  className="h-8 px-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                                  onClick={() => goal.id && handleConfirmDelete(goal.id)}
                                                >
                                                  <Trash2 className="h-4 w-4 mr-1" />
                                                  ลบ
                                                </Button>
                                              </>
                                            )}
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="h-8 px-3 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950/30"
                                              asChild
                                            >
                                              <Link href={`/dashboard/goals/${goal.id}`}>จัดการ</Link>
                                            </Button>
                                          </div>
                                        </div>

                                        <div className="flex flex-wrap gap-3 mt-4 text-xs">
                                          <div className="flex items-center gap-1 bg-secondary/50 rounded-full px-3 py-1">
                                            <Calendar className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-muted-foreground">
                                              เริ่ม: {new Date(goal.start_date).toLocaleDateString("th-TH")}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1 bg-secondary/50 rounded-full px-3 py-1">
                                            <Target className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-muted-foreground">
                                              เป้าหมาย: {new Date(goal.target_date).toLocaleDateString("th-TH")}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1 bg-secondary/50 rounded-full px-3 py-1">
                                            <Clock className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-muted-foreground">
                                              {calculateRemainingDays(goal.target_date) > 0
                                                ? `เหลือเวลาอีก ${calculateRemainingDays(goal.target_date)} วัน`
                                                : "ถึงกำหนดแล้ว"}
                                            </span>
                                          </div>

                                          {/* Auto-update indicator */}
                                          {goal.goal_type !== "exercise" && (
                                            <div className="flex items-center gap-1 bg-green-500/10 text-green-500 rounded-full px-3 py-1">
                                              <RefreshCw className="h-3 w-3" />
                                              <span>อัพเดทอัตโนมัติ</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </TabsContent>
                    </AnimatePresence>
                  </Tabs>
                </CardContent>
              </Card>
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
    </div>
  )
}
