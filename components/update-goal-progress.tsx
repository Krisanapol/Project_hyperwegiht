"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Loader2, TrendingUp, TrendingDown } from "lucide-react"
import { type Goal, updateGoalProgress, getGoalUnit } from "@/lib/goals"

interface UpdateGoalProgressProps {
  goal: Goal
  onSuccess: (updatedGoal: Goal) => void
}

export function UpdateGoalProgress({ goal, onSuccess }: UpdateGoalProgressProps) {
  const [currentValue, setCurrentValue] = useState<number>(goal.current_value)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isIncreasing = goal.target_value > goal.start_value
  const unit = getGoalUnit(goal.goal_type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // ตรวจสอบค่าที่กรอก
    if (currentValue === goal.current_value) {
      setError("กรุณากรอกค่าที่แตกต่างจากค่าปัจจุบัน")
      return
    }

    setIsSubmitting(true)
    try {
      // ปัดเศษให้เหลือทศนิยม 2 ตำแหน่ง
      const roundedValue = Math.round(currentValue * 100) / 100

      const updatedGoal = await updateGoalProgress(goal.id, roundedValue)
      toast({
        title: "อัพเดทความก้าวหน้าสำเร็จ",
        description: `ค่าปัจจุบันถูกอัพเดทเป็น ${roundedValue.toFixed(2)} ${unit} แล้ว`,
      })
      onSuccess(updatedGoal)
    } catch (error) {
      console.error("Error updating goal progress:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพเดทความก้าวหน้าได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center">
              {isIncreasing ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ค่าเป้าหมาย</p>
              <p className="font-medium">
                {goal.target_value} {unit}
              </p>
            </div>
          </div>
          <div className="h-0.5 w-10 bg-secondary"></div>
          <div className="flex items-center gap-2">
            <div>
              <p className="text-sm text-muted-foreground">ค่าปัจจุบัน</p>
              <p className="font-medium">
                {goal.current_value} {unit}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center">
              <span className="font-bold">{isIncreasing ? "+" : "-"}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="current-value" className="text-base">
            ค่าปัจจุบันใหม่
          </Label>
          <div className="relative">
            <Input
              id="current-value"
              type="number"
              step="0.01"
              value={currentValue}
              onChange={(e) => {
                const value = e.target.value
                setCurrentValue(value === "" ? 0 : Number.parseFloat(value))
              }}
              className="pr-12 h-12 text-lg"
              placeholder={`กรอกค่าปัจจุบันใหม่`}
              required
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">{unit}</div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="p-4 bg-secondary/30 rounded-lg">
          <h4 className="font-medium mb-2">คำแนะนำ</h4>
          <p className="text-sm text-muted-foreground">
            {isIncreasing
              ? `กรอกค่าที่มากกว่า ${goal.current_value} ${unit} เพื่อแสดงความก้าวหน้า หรือน้อยกว่าหากมีการถดถอย`
              : `กรอกค่าที่น้อยกว่า ${goal.current_value} ${unit} เพื่อแสดงความก้าวหน้า หรือมากกว่าหากมีการถดถอย`}
          </p>
        </div>
      </div>

      <motion.div
        className="flex justify-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              กำลังบันทึก...
            </>
          ) : (
            "บันทึกความก้าวหน้า"
          )}
        </Button>
      </motion.div>
    </motion.form>
  )
}
