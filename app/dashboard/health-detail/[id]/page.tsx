"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { ArrowLeft, Loader2, Activity, Heart, Scale, Droplets, Utensils, Dumbbell, Flame, Trash2 } from "lucide-react"
import type { HealthDataEntry } from "@/lib/health-data"
import {
  getCalorieSummary,
  getFoodItems,
  getExerciseItems,
  type FoodItem,
  type ExerciseItem,
  type CalorieSummary,
} from "@/lib/health-data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
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
import { motion } from "framer-motion"

export default function HealthDetail() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [healthData, setHealthData] = useState<HealthDataEntry | null>(null)
  const [calorieSummary, setCalorieSummary] = useState<CalorieSummary | null>(null)
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [exerciseItems, setExerciseItems] = useState<ExerciseItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    async function fetchHealthData() {
      if (!params.id) return

      setIsLoading(true)
      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase.from("health_records").select("*").eq("id", params.id).single()

        if (error) throw error
        setHealthData(data)

        // ดึงข้อมูลสรุปแคลอรี่
        const summary = await getCalorieSummary(data.id)
        setCalorieSummary(summary)

        // ดึงข้อมูลอาหาร
        const foods = await getFoodItems(data.id)
        setFoodItems(foods)

        // ดึงข้อมูลการออกกำลังกาย
        const exercises = await getExerciseItems(data.id)
        setExerciseItems(exercises)
      } catch (error) {
        console.error("Error fetching health data:", error)
        toast({
          title: "ไม่สามารถโหลดข้อมูลได้",
          description: "เกิดข้อผิดพลาดในการโหลดข้อมูลสุขภาพ",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchHealthData()
  }, [params.id, toast])

  // ฟังก์ชันสำหรับลบข้อมูลสุขภาพ
  const deleteHealthData = async () => {
    if (!healthData) return

    setIsDeleting(true)
    try {
      const supabase = getSupabaseBrowserClient()

      // ลบข้อมูลอาหาร
      await supabase.from("food_items").delete().eq("health_record_id", healthData.id)

      // ลบข้อมูลการออกกำลังกาย
      await supabase.from("exercise_items").delete().eq("health_record_id", healthData.id)

      // ลบข้อมูลสรุปแคลอรี่
      await supabase.from("calorie_summaries").delete().eq("health_record_id", healthData.id)

      // ลบข้อมูลสุขภาพ
      const { error } = await supabase.from("health_records").delete().eq("id", healthData.id)

      if (error) throw error

      toast({
        title: "ลบข้อมูลสำเร็จ",
        description: "ข้อมูลสุขภาพถูกลบเรียบร้อยแล้ว",
      })

      // นำผู้ใช้กลับไปยังหน้าแดชบอร์ด
      router.push("/dashboard")
    } catch (error) {
      console.error("Error deleting health data:", error)
      toast({
        title: "ไม่สามารถลบข้อมูลได้",
        description: "เกิดข้อผิดพลาดในการลบข้อมูลสุขภาพ",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  }

  // Function to get BMI category
  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { text: "น้ำหนักน้อย", color: "text-blue-500" }
    if (bmi < 25) return { text: "น้ำหนักปกติ", color: "text-green-500" }
    if (bmi < 30) return { text: "น้ำหนักเกิน", color: "text-yellow-400" }
    return { text: "อ้วน", color: "text-red-500" }
  }

  // Function to get calorie status color
  const getCalorieStatusColor = (status: string) => {
    switch (status) {
      case "ต่ำกว่าเป้าหมาย":
        return "text-blue-500"
      case "ตามเป้าหมาย":
        return "text-green-500"
      case "เกินเป้าหมาย":
        return "text-red-500"
      default:
        return "text-muted-foreground"
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
        stiffness: 100,
        damping: 12,
      },
    },
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader activePage="dashboard" />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          className="flex flex-col gap-6 max-w-3xl mx-auto"
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
            <h1 className="text-2xl font-bold">รายละเอียดข้อมูลสุขภาพ</h1>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !healthData ? (
            <motion.div variants={itemVariants}>
              <Card className="border border-border/50 shadow-lg">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">ไม่พบข้อมูลสุขภาพ</p>
                  <Button
                    className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => router.push("/dashboard")}
                  >
                    กลับไปหน้าแดชบอร์ด
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <>
              <motion.div variants={itemVariants}>
                <Card className="border border-border/30 bg-gradient-to-b from-secondary/30 to-background shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle>ข้อมูลสุขภาพวันที่ {formatDate(healthData.date)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div
                        className="flex items-center gap-4"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <div className="bg-primary/20 p-3 rounded-full">
                          <Scale className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">น้ำหนัก</p>
                          <p className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                            {healthData.weight} กก.
                          </p>
                        </div>
                      </motion.div>

                      <motion.div
                        className="flex items-center gap-4"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <div className="bg-primary/20 p-3 rounded-full">
                          <Activity className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">BMI</p>
                          <p className="text-2xl font-bold text-foreground">{healthData.bmi.toFixed(1)}</p>
                          <p className={`text-sm ${getBmiCategory(healthData.bmi).color}`}>
                            {getBmiCategory(healthData.bmi).text}
                          </p>
                        </div>
                      </motion.div>

                      <motion.div
                        className="flex items-center gap-4"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <div className="bg-primary/20 p-3 rounded-full">
                          <Heart className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">เปอร์เซ็นต์ไขมัน</p>
                          <p className="text-2xl font-bold text-foreground">
                            {healthData.body_fat ? `${healthData.body_fat}%` : "-"}
                          </p>
                        </div>
                      </motion.div>

                      <motion.div
                        className="flex items-center gap-4"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <div className="bg-primary/20 p-3 rounded-full">
                          <Droplets className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">น้ำที่ดื่ม</p>
                          <p className="text-2xl font-bold text-foreground">
                            {healthData.water_intake ? `${healthData.water_intake} มล.` : "-"}
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* แสดงข้อมูลสรุปแคลอรี่ */}
              {calorieSummary && (
                <motion.div variants={itemVariants}>
                  <Card className="border border-border/30 bg-gradient-to-b from-secondary/30 to-background shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <CardTitle>สรุปแคลอรี่ประจำวัน</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div
                          className="flex items-center gap-4"
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <div className="bg-primary/20 p-3 rounded-full">
                            <Utensils className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">แคลอรี่จากอาหาร</p>
                            <p className="text-2xl font-bold text-foreground">
                              {calorieSummary.total_food_calories} แคล
                            </p>
                            <p className={`text-sm ${getCalorieStatusColor(calorieSummary.calorie_status)}`}>
                              {calorieSummary.calorie_status}
                            </p>
                          </div>
                        </motion.div>

                        <motion.div
                          className="flex items-center gap-4"
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <div className="bg-primary/20 p-3 rounded-full">
                            <Dumbbell className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">แคลอรี่จากการออกกำลังกาย</p>
                            <p className="text-2xl font-bold text-foreground">
                              {calorieSummary.total_exercise_calories} แคล
                            </p>
                            <p className={`text-sm ${getCalorieStatusColor(calorieSummary.exercise_status)}`}>
                              {calorieSummary.exercise_status}
                            </p>
                          </div>
                        </motion.div>

                        <motion.div
                          className="flex items-center gap-4"
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <div className="bg-primary/20 p-3 rounded-full">
                            <Flame className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">แคลอรี่สุทธิ</p>
                            <p className="text-2xl font-bold text-foreground">{calorieSummary.net_calories} แคล</p>
                          </div>
                        </motion.div>

                        <motion.div
                          className="flex items-center gap-4"
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <div className="bg-primary/20 p-3 rounded-full">
                            <Activity className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">TDEE ประมาณการ</p>
                            <p className="text-2xl font-bold text-foreground">{calorieSummary.tdee_estimate} แคล</p>
                            <p className={`text-sm ${getCalorieStatusColor(calorieSummary.overall_status)}`}>
                              {calorieSummary.overall_status}
                            </p>
                          </div>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* แสดงข้อมูลอาหารและการออกกำลังกาย */}
              <motion.div variants={itemVariants}>
                <Tabs defaultValue="food" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-secondary/30 p-1 rounded-lg">
                    <TabsTrigger
                      value="food"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 rounded-md"
                    >
                      <Utensils className="h-4 w-4 mr-2" />
                      อาหาร
                    </TabsTrigger>
                    <TabsTrigger
                      value="exercise"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 rounded-md"
                    >
                      <Dumbbell className="h-4 w-4 mr-2" />
                      การออกกำลังกาย
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="food">
                    <Card className="border border-border/30 bg-gradient-to-b from-secondary/30 to-background shadow-lg">
                      <CardHeader>
                        <CardTitle>รายการอาหาร</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {foodItems.length === 0 ? (
                          <p className="text-center text-muted-foreground py-4">ไม่มีข้อมูลอาหาร</p>
                        ) : (
                          <motion.div
                            className="space-y-4"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                          >
                            {foodItems.map((food, index) => (
                              <motion.div
                                key={index}
                                className="flex justify-between items-center p-3 rounded-lg hover:bg-primary/10 transition-colors"
                                variants={itemVariants}
                                whileHover={{ scale: 1.01 }}
                              >
                                <div className="flex items-center gap-2">
                                  <Utensils className="h-4 w-4 text-primary" />
                                  <span>{food.name}</span>
                                  {food.quantity !== 1 && (
                                    <span className="text-sm text-muted-foreground">x{food.quantity}</span>
                                  )}
                                </div>
                                <span className="font-medium">{food.calories} แคล</span>
                              </motion.div>
                            ))}
                            <Separator className="my-2 bg-border/50" />
                            <motion.div
                              className="flex justify-between items-center font-bold p-2"
                              variants={itemVariants}
                            >
                              <span>รวม</span>
                              <span className="text-primary">{calorieSummary?.total_food_calories || 0} แคล</span>
                            </motion.div>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="exercise">
                    <Card className="border border-border/30 bg-gradient-to-b from-secondary/30 to-background shadow-lg">
                      <CardHeader>
                        <CardTitle>รายการออกกำลังกาย</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {exerciseItems.length === 0 ? (
                          <p className="text-center text-muted-foreground py-4">ไม่มีข้อมูลการออกกำลังกาย</p>
                        ) : (
                          <motion.div
                            className="space-y-4"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                          >
                            {exerciseItems.map((exercise, index) => (
                              <motion.div
                                key={index}
                                className="flex justify-between items-center p-3 rounded-lg hover:bg-primary/10 transition-colors"
                                variants={itemVariants}
                                whileHover={{ scale: 1.01 }}
                              >
                                <div className="flex items-center gap-2">
                                  <Dumbbell className="h-4 w-4 text-primary" />
                                  <span>{exercise.name}</span>
                                  <span className="text-sm text-muted-foreground">{exercise.duration} นาที</span>
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/50 text-foreground">
                                    {exercise.intensity}
                                  </span>
                                </div>
                                <span className="font-medium">{exercise.caloriesBurned} แคล</span>
                              </motion.div>
                            ))}
                            <Separator className="my-2 bg-border/50" />
                            <motion.div
                              className="flex justify-between items-center font-bold p-2"
                              variants={itemVariants}
                            >
                              <span>รวม</span>
                              <span className="text-primary">{calorieSummary?.total_exercise_calories || 0} แคล</span>
                            </motion.div>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </motion.div>

              <motion.div className="flex justify-between" variants={itemVariants}>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                  className="flex items-center gap-2 hover:bg-destructive/90 transition-colors border border-destructive/30"
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  ลบข้อมูล
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors shadow-md hover:shadow-lg"
                  onClick={() => router.push("/dashboard/add-health-data")}
                >
                  เพิ่มข้อมูลใหม่
                </Button>
              </motion.div>

              {/* Dialog ยืนยันการลบข้อมูล */}
              <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent className="border border-border/30 bg-gradient-to-b from-background to-secondary/10">
                  <AlertDialogHeader>
                    <AlertDialogTitle>ยืนยันการลบข้อมูล</AlertDialogTitle>
                    <AlertDialogDescription>
                      คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลสุขภาพนี้? การกระทำนี้ไม่สามารถย้อนกลับได้
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-primary/30 hover:bg-secondary/50 transition-colors">
                      ยกเลิก
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={deleteHealthData}
                      className="bg-destructive hover:bg-destructive/90 transition-colors border border-destructive/30"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          กำลังลบ...
                        </>
                      ) : (
                        "ลบข้อมูล"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </motion.div>
      </main>
    </div>
  )
}
