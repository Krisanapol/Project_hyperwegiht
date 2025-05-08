"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { type Goal, calculateGoalProgress, calculateRemainingDays, getGoalTypeText, getGoalUnit } from "@/lib/goals"
import { Calendar, Target, TrendingDown, TrendingUp, CheckCircle2, Clock, RefreshCw, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface GoalProgressCardProps {
  goal: Goal
  onUpdate?: () => void
}

export function GoalProgressCard({ goal, onUpdate }: GoalProgressCardProps) {
  const [progress, setProgress] = useState(0)

  // แก้ไข useEffect ให้อัพเดทค่าเมื่อ goal เปลี่ยนแปลง
  useEffect(() => {
    // เริ่มต้นที่ 0 แล้วค่อยๆ เพิ่มเพื่อสร้าง animation
    setProgress(0) // รีเซ็ตค่าก่อนเพื่อให้เห็น animation ชัดเจน
    const calculatedProgress = calculateGoalProgress(goal)
    const timer = setTimeout(() => setProgress(calculatedProgress), 300)

    return () => clearTimeout(timer)
  }, [goal, goal.current_value]) // เพิ่ม goal.current_value เพื่อให้ re-render เมื่อค่าปัจจุบันเปลี่ยน

  const remainingDays = calculateRemainingDays(goal.target_date)
  const isIncreasing = goal.target_value > goal.start_value
  const formattedStartDate = new Date(goal.start_date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
  const formattedTargetDate = new Date(goal.target_date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  // กำหนดสีตามประเภทเป้าหมาย
  const getGoalColor = () => {
    switch (goal.goal_type) {
      case "weight":
        return "from-primary to-primary/80"
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

  // กำหนดไอคอนตามประเภทเป้าหมาย
  const getGoalIcon = () => {
    switch (goal.goal_type) {
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

  // ตรวจสอบว่าเป้าหมายนี้อัพเดทอัตโนมัติได้หรือไม่
  const isAutoUpdatable = goal.goal_type !== "exercise" // เป้าหมายการออกกำลังกายยังต้องอัพเดทด้วยตนเอง

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group"
      whileHover={{ y: -8, transition: { type: "spring", stiffness: 400, damping: 10 } }}
    >
      <Card className="overflow-hidden border-none shadow-lg transition-all duration-300 group-hover:shadow-xl bg-gradient-to-br from-secondary/50 to-background h-full">
        <CardContent className="p-0">
          {/* Top color bar based on goal type */}
          <div className={`w-full h-2 bg-gradient-to-r ${getGoalColor()}`}></div>

          <div className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span className={`bg-gradient-to-r ${getGoalColor()} bg-clip-text text-transparent`}>
                    เป้าหมาย{getGoalTypeText(goal.goal_type)}
                  </span>
                  {progress >= 100 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 10 }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </motion.div>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {isIncreasing ? "เพิ่ม" : "ลด"}จาก {goal.start_value} {getGoalUnit(goal.goal_type)} เป็น{" "}
                  {goal.target_value} {getGoalUnit(goal.goal_type)}
                </p>
              </div>
              <motion.div
                className={`bg-gradient-to-r ${getGoalColor()} text-primary-foreground p-2.5 rounded-full shadow-md`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                {getGoalIcon()}
              </motion.div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm items-center">
                  <span>ความก้าวหน้า</span>
                  <motion.span
                    className="font-medium bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent"
                    key={progress}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {progress.toFixed(0)}%
                  </motion.span>
                </div>
                <div className="relative h-2.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                  <motion.div
                    className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getGoalColor()}`}
                    initial={{ width: "0%" }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>
                    เริ่มต้น: {goal.start_value} {getGoalUnit(goal.goal_type)}
                  </span>
                  <motion.span
                    key={goal.current_value}
                    initial={{ scale: 1.2, fontWeight: "bold" }}
                    animate={{ scale: 1, fontWeight: "normal" }}
                    transition={{ duration: 0.5 }}
                    className={`bg-gradient-to-r ${getGoalColor()} bg-clip-text text-transparent font-medium`}
                  >
                    ปัจจุบัน: {goal.current_value} {getGoalUnit(goal.goal_type)}
                  </motion.span>
                  <span>
                    เป้าหมาย: {goal.target_value} {getGoalUnit(goal.goal_type)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-1 bg-secondary/30 rounded-full px-3 py-1.5">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">เริ่ม: {formattedStartDate}</span>
                </div>
                <div className="flex items-center gap-1 bg-secondary/30 rounded-full px-3 py-1.5">
                  <Target className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">เป้าหมาย: {formattedTargetDate}</span>
                </div>
                <div className="flex items-center gap-1 bg-secondary/30 rounded-full px-3 py-1.5">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {remainingDays > 0 ? (
                      <Badge variant="outline" className="ml-1 border-primary/30 bg-primary/10 text-primary">
                        เหลือเวลาอีก {remainingDays} วัน
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="ml-1 border-red-500/30 bg-red-500/10 text-red-500">
                        ถึงกำหนดแล้ว
                      </Badge>
                    )}
                  </span>
                </div>
              </div>

              {/* แสดงข้อความว่าเป้าหมายนี้อัพเดทอัตโนมัติ */}
              {isAutoUpdatable && (
                <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <RefreshCw className="h-3 w-3" />
                  </motion.div>
                  <span>อัพเดทอัตโนมัติเมื่อบันทึกข้อมูลสุขภาพใหม่</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Link href={`/dashboard/goals/${goal.id}`}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs rounded-full border-primary/30 hover:border-primary/50 hover:bg-primary/10 gap-1"
                    >
                      จัดการเป้าหมาย
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
