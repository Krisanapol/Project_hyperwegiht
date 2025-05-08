"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Target } from "lucide-react"
import { saveGoal, type Goal } from "@/lib/goals"
import { useAuth } from "@/contexts/auth-context"
import { getUserHealthData } from "@/lib/health-data"

// สร้าง schema สำหรับตรวจสอบข้อมูล
const goalFormSchema = z.object({
  goalType: z.enum(["weight", "bmi", "body_fat", "water_intake"]),
  startValue: z.coerce.number().min(0, "ค่าต้องมากกว่าหรือเท่ากับ 0"),
  targetValue: z.coerce.number().min(0, "ค่าต้องมากกว่าหรือเท่ากับ 0"),
  targetDate: z.string().min(1, "กรุณาเลือกวันที่เป้าหมาย"),
})

type GoalFormValues = z.infer<typeof goalFormSchema>

interface GoalFormProps {
  onSuccess?: () => void
}

// แก้ไขฟังก์ชัน GoalForm เพื่อดึงข้อมูลสุขภาพล่าสุด
export function GoalForm({ onSuccess }: GoalFormProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingHealthData, setIsLoadingHealthData] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      goalType: "weight",
      startValue: 0,
      targetValue: 0,
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 วันจากวันนี้
    },
  })

  const goalType = watch("goalType")

  // ดึงข้อมูลสุขภาพล่าสุดเมื่อ component โหลดหรือเมื่อผู้ใช้เปลี่ยน
  useEffect(() => {
    const fetchLatestHealthData = async () => {
      if (!user) return

      setIsLoadingHealthData(true)
      try {
        const healthData = await getUserHealthData(user.id)

        if (healthData.length > 0) {
          // เรียงข้อมูลตามวันที่ล่าสุด
          const sortedData = [...healthData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

          const latestData = sortedData[0]

          // อัพเดทค่าเริ่มต้นตามประเภทเป้าหมาย
          updateStartValueByGoalType(goalType, latestData)
        }
      } catch (error) {
        console.error("Error fetching health data:", error)
      } finally {
        setIsLoadingHealthData(false)
      }
    }

    fetchLatestHealthData()
  }, [user, goalType])

  // ฟังก์ชันอัพเดทค่าเริ่มต้นตามประเภทเป้าหมาย
  const updateStartValueByGoalType = (type: string, data: any) => {
    switch (type) {
      case "weight":
        setValue("startValue", data.weight)
        break
      case "bmi":
        setValue("startValue", data.bmi)
        break
      case "body_fat":
        setValue("startValue", data.body_fat)
        break
      case "exercise":
        // ค่าเริ่มต้นสำหรับการออกกำลังกายอาจเป็น 0 หรือค่าอื่นตามที่เหมาะสม
        setValue("startValue", 0)
        break
      case "water_intake":
        setValue("startValue", data.water_intake)
        break
      default:
        setValue("startValue", 0)
    }
  }

  // ฟังก์ชันสำหรับบันทึกเป้าหมาย
  const onSubmit = async (data: GoalFormValues) => {
    if (!user) {
      toast({
        title: "กรุณาเข้าสู่ระบบ",
        description: "คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถตั้งเป้าหมายได้",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const goalData: Omit<Goal, "id" | "created_at" | "updated_at"> = {
        user_id: user.id,
        goal_type: data.goalType,
        start_value: data.startValue,
        current_value: data.startValue, // เริ่มต้นด้วยค่าปัจจุบัน = ค่าเริ่มต้น
        target_value: data.targetValue,
        start_date: new Date().toISOString().split("T")[0], // วันนี้
        target_date: data.targetDate,
        status: "active",
      }

      await saveGoal(goalData)

      toast({
        title: "บันทึกเป้าหมายสำเร็จ",
        description: "เป้าหมายของคุณถูกบันทึกเรียบร้อยแล้ว",
      })

      reset()
      onSuccess?.()
    } catch (error) {
      console.error("Error saving goal:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกเป้าหมายได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ฟังก์ชันสำหรับแสดงหน่วยของเป้าหมาย
  const getUnitForGoalType = (type: string) => {
    switch (type) {
      case "weight":
        return "กก."
      case "bmi":
        return ""
      case "body_fat":
        return "%"
      case "exercise":
        return "นาที/สัปดาห์"
      case "water_intake":
        return "มล./วัน"
      default:
        return ""
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="border-none shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-yellow-400/20 to-yellow-500/10 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-yellow-500" />
            ตั้งเป้าหมายใหม่
          </CardTitle>
          <CardDescription>กำหนดเป้าหมายสุขภาพของคุณเพื่อติดตามความก้าวหน้า</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goalType">ประเภทเป้าหมาย</Label>
              <Select defaultValue="weight" onValueChange={(value) => setValue("goalType", value as Goal["goal_type"])}>
                <SelectTrigger id="goalType">
                  <SelectValue placeholder="เลือกประเภทเป้าหมาย" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight">น้ำหนัก</SelectItem>
                  <SelectItem value="bmi">BMI</SelectItem>
                  <SelectItem value="body_fat">เปอร์เซ็นต์ไขมัน</SelectItem>
                  <SelectItem value="water_intake">การดื่มน้ำ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startValue">ค่าเริ่มต้น ({getUnitForGoalType(goalType)})</Label>
              <Input
                id="startValue"
                type="number"
                step="0.01"
                {...register("startValue")}
                className={errors.startValue ? "border-red-500" : ""}
                disabled={isLoadingHealthData}
              />
              {isLoadingHealthData && (
                <p className="text-xs text-muted-foreground flex items-center">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  กำลังโหลดข้อมูลล่าสุด...
                </p>
              )}
              {errors.startValue && <p className="text-red-500 text-xs mt-1">{errors.startValue.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetValue">ค่าเป้าหมาย ({getUnitForGoalType(goalType)})</Label>
              <Input
                id="targetValue"
                type="number"
                step="0.01"
                {...register("targetValue")}
                className={errors.targetValue ? "border-red-500" : ""}
              />
              {errors.targetValue && <p className="text-red-500 text-xs mt-1">{errors.targetValue.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDate">วันที่เป้าหมาย</Label>
              <Input
                id="targetDate"
                type="date"
                {...register("targetDate")}
                className={errors.targetDate ? "border-red-500" : ""}
                min={new Date().toISOString().split("T")[0]} // ไม่สามารถเลือกวันที่ในอดีต
              />
              {errors.targetDate && <p className="text-red-500 text-xs mt-1">{errors.targetDate.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                "บันทึกเป้าหมาย"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
