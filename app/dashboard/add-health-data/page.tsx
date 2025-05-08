"use client"

import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { addHealthDataEntry, saveFoodItems, saveExerciseItems, saveCalorieSummary } from "@/lib/health-data"
import { Heart, ArrowLeft, Sparkles } from "lucide-react"
import { AddHealthDataForm } from "@/components/add-health-data-form"
import { useState } from "react"
import { motion } from "framer-motion"

export default function AddHealthData() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: any) => {
    if (!user) {
      toast({
        title: "กรุณาเข้าสู่ระบบ",
        description: "คุณต้องเข้าสู่ระบบก่อนเพิ่มข้อมูลสุขภาพ",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // 1. บันทึกข้อมูลสุขภาพพื้นฐาน
      const healthData = {
        user_id: user.id,
        date: data.date,
        weight: data.weight,
        height: data.height,
        bmi: data.bmi,
        body_fat: data.bodyFat || 0,
        water_intake: data.waterIntake || 0,
      }

      // บันทึกข้อมูลสุขภาพและรับ ID ของบันทึกที่เพิ่มหรืออัปเดต
      const healthRecord = await addHealthDataEntry(healthData)

      // 2. บันทึกข้อมูลอาหาร (ถ้ามี)
      if (data.foodItems && data.foodItems.length > 0) {
        await saveFoodItems(user.id, healthRecord.id, data.foodItems)
      }

      // 3. บันทึกข้อมูลการออกกำลังกาย (ถ้ามี)
      if (data.exerciseItems && data.exerciseItems.length > 0) {
        await saveExerciseItems(user.id, healthRecord.id, data.exerciseItems)
      }

      // 4. บันทึกข้อมูลสรุปแคลอรี่ (ถ้ามีข้อมูลอาหารหรือการออกกำลังกาย)
      if (data.foodItems?.length > 0 || data.exerciseItems?.length > 0) {
        const calorieSummary = {
          total_food_calories: data.totalFoodCalories || 0,
          total_exercise_calories: data.totalExerciseCalories || 0,
          net_calories: data.netCalories || 0,
          tdee_estimate: data.tdeeEstimate || 0,
          calorie_status: data.calorieStatus || "",
          exercise_status: data.exerciseStatus || "",
          overall_status: data.dayOverallStatus || "",
        }

        await saveCalorieSummary(user.id, healthRecord.id, calorieSummary)
      }

      toast({
        title: "เพิ่มข้อมูลสำเร็จ",
        description: "ข้อมูลสุขภาพของคุณถูกบันทึกเรียบร้อยแล้ว",
      })

      // ใช้ setTimeout เพื่อให้แน่ใจว่า toast แสดงก่อนที่จะ redirect
      setTimeout(() => {
        // กลับไปยังหน้า dashboard
        router.push("/dashboard")
      }, 1000) // รอ 1 วินาทีก่อน redirect
    } catch (error) {
      console.error("Error adding health data:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

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
        stiffness: 100,
      },
    },
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader activePage="dashboard" />

      <main className="container mx-auto px-4 py-8 bg-gradient-to-b from-background to-secondary/5">
        <motion.div
          className="flex flex-col gap-6 max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="flex items-center gap-2" variants={itemVariants}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full hover:bg-primary/20 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-primary" />
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              เพิ่มข้อมูลสุขภาพ
            </h1>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden border border-primary/20 shadow-lg bg-gradient-to-b from-background to-secondary/10 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-row items-center justify-between bg-gradient-to-r from-primary/10 to-secondary/20 border-b border-primary/20 p-6">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    บันทึกข้อมูลสุขภาพใหม่
                    <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                  </h2>
                  <p className="text-sm text-muted-foreground">กรอกข้อมูลสุขภาพล่าสุดของคุณ</p>
                </div>
                <motion.div
                  className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Heart className="h-8 w-8 text-primary-foreground drop-shadow-md" />
                </motion.div>
              </div>
              <CardContent className="p-6">
                <AddHealthDataForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
