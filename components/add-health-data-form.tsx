"use client"

import { useState, useEffect } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Check, AlertCircle, Loader2, Flame, Utensils, Dumbbell, Droplets } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  getCommonFoods,
  getCommonExercises,
  type CommonFood,
  type CommonExercise,
  type FoodItem,
  type ExerciseItem,
} from "@/lib/health-data"
import { motion, AnimatePresence } from "framer-motion"

interface AddHealthDataFormProps {
  onSubmit: (data: any) => void
  isSubmitting?: boolean
}

export function AddHealthDataForm({ onSubmit, isSubmitting = false }: AddHealthDataFormProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    weight: "",
    height: "",
    bodyFat: "",
    waterIntake: "",
    bmi: 0,
  })

  // สถานะสำหรับข้อมูลอาหาร
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [commonFoods, setCommonFoods] = useState<CommonFood[]>([])
  const [customFoodName, setCustomFoodName] = useState("")
  const [customFoodCalories, setCustomFoodCalories] = useState("")
  const [customFoodQuantity, setCustomFoodQuantity] = useState("1")
  const [selectedFood, setSelectedFood] = useState("")
  const [selectedFoodQuantity, setSelectedFoodQuantity] = useState("1")
  const [isLoadingFoods, setIsLoadingFoods] = useState(false)

  // สถานะสำหรับข้อมูลการออกกำลังกาย
  const [exerciseItems, setExerciseItems] = useState<ExerciseItem[]>([])
  const [commonExercises, setCommonExercises] = useState<CommonExercise[]>([])
  const [selectedExercise, setSelectedExercise] = useState("")
  const [exerciseDuration, setExerciseDuration] = useState("30")
  const [customExerciseName, setCustomExerciseName] = useState("")
  const [customExerciseCalories, setCustomExerciseCalories] = useState("")
  const [customExerciseDuration, setCustomExerciseDuration] = useState("30")
  const [customExerciseIntensity, setCustomExerciseIntensity] = useState("ปานกลาง")
  const [isLoadingExercises, setIsLoadingExercises] = useState(false)

  // State for active tab
  const [activeTab, setActiveTab] = useState("basic")

  // คำนวณ BMI เมื่อน้ำหนักหรือส่วนสูงเปลี่ยนแปลง
  useEffect(() => {
    if (formData.weight && formData.height) {
      const weight = Number.parseFloat(formData.weight)
      const height = Number.parseFloat(formData.height) / 100 // แปลงเป็นเมตร
      const bmi = weight / (height * height)
      setFormData((prev) => ({ ...prev, bmi: Number.parseFloat(bmi.toFixed(2)) }))
    }
  }, [formData.weight, formData.height])

  // โหลดข้อมูลอาหารและการออกกำลังกายทั่วไป
  useEffect(() => {
    async function loadCommonData() {
      try {
        setIsLoadingFoods(true)
        setIsLoadingExercises(true)

        const [foods, exercises] = await Promise.all([getCommonFoods(), getCommonExercises()])

        setCommonFoods(foods)
        setCommonExercises(exercises)
      } catch (error) {
        console.error("Error loading common data:", error)
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลอาหารและการออกกำลังกายได้",
          variant: "destructive",
        })
      } finally {
        setIsLoadingFoods(false)
        setIsLoadingExercises(false)
      }
    }

    loadCommonData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // คำนวณแคลอรี่รวมจากอาหาร
  const totalFoodCalories = foodItems.reduce((sum, item) => sum + item.calories * item.quantity, 0)

  // คำนวณแคลอรี่รวมที่เผาผลาญจากการออกกำลังกาย
  const totalExerciseCalories = exerciseItems.reduce((sum, item) => sum + item.caloriesBurned, 0)

  // คำนวณแคลอรี่สุทธิ (อาหาร - ออกกำลังกาย)
  const netCalories = totalFoodCalories - totalExerciseCalories

  // ประเมินการบริโภคแคลอรี่
  const getTdeeEstimate = () => {
    // ถ้ามีน้ำหนักและส่วนสูง ให้ประมาณ TDEE อย่างง่าย
    if (formData.weight && formData.height) {
      const weightNum = Number.parseFloat(formData.weight)
      const heightNum = Number.parseFloat(formData.height) / 100 // แปลงเป็นเมตร
      const bmi = weightNum / (heightNum * heightNum)

      // ประมาณ TDEE อย่างง่าย (BMR * 1.4)
      // สูตร BMR สำหรับผู้ชาย (ประมาณการ)
      return Math.round((10 * weightNum + 6.25 * heightNum * 100 - 5 * 30 + 5) * 1.4)
    }

    // ถ้าไม่มีข้อมูล ใช้ค่าเฉลี่ยทั่วไป
    return 2000
  }

  const tdeeEstimate = getTdeeEstimate()

  // ประเมินการบริโภค
  const getCalorieStatus = () => {
    const percentOfTdee = (netCalories / tdeeEstimate) * 100

    if (percentOfTdee < 80) {
      return { status: "ต่ำกว่าเป้าหมาย", color: "text-blue-500", icon: <AlertCircle className="h-4 w-4" /> }
    } else if (percentOfTdee <= 100) {
      return { status: "เหมาะสม", color: "text-green-500", icon: <Check className="h-4 w-4" /> }
    } else {
      return { status: "เกินเป้าหมาย", color: "text-red-500", icon: <AlertCircle className="h-4 w-4" /> }
    }
  }

  const calorieStatus = getCalorieStatus()

  // ประเมินการออกกำลังกาย
  const getExerciseStatus = () => {
    // ประเมินจากแคลอรี่ที่เผาผลาญเทียบกับเป้าหมายที่ควรเผาผลาญต่อวัน (ประมาณ 15-20% ของ TDEE)
    const targetExerciseCalories = tdeeEstimate * 0.15
    const percentOfTarget = (totalExerciseCalories / targetExerciseCalories) * 100

    if (percentOfTarget < 50) {
      return { status: "น้อยเกินไป", color: "text-red-500", icon: <AlertCircle className="h-4 w-4" /> }
    } else if (percentOfTarget < 100) {
      return { status: "พอใช้", color: "text-yellow-400", icon: <AlertCircle className="h-4 w-4" /> }
    } else if (percentOfTarget <= 200) {
      return { status: "ดี", color: "text-green-500", icon: <Check className="h-4 w-4" /> }
    } else {
      return { status: "มากเกินไป", color: "text-blue-500", icon: <AlertCircle className="h-4 w-4" /> }
    }
  }

  const exerciseStatus = getExerciseStatus()

  // ประเมินผลรวมของวันนั้น
  const getDayOverallStatus = () => {
    // ประเมินจากความสมดุลของแคลอรี่และการออกกำลังกาย
    const calorieBalanceGood = netCalories <= tdeeEstimate && netCalories >= tdeeEstimate * 0.8
    const exerciseGood = totalExerciseCalories >= tdeeEstimate * 0.15

    if (calorieBalanceGood && exerciseGood) {
      return { status: "ดีเยี่ยม", color: "text-green-500", description: "ทั้งการบริโภคและการออกกำลังกายอยู่ในเกณฑ์ดี" }
    } else if (calorieBalanceGood) {
      return { status: "ดี", color: "text-green-500", description: "การบริโภคอยู่ในเกณฑ์ดี แต่ควรออกกำลังกายเพิ่มขึ้น" }
    } else if (exerciseGood) {
      return {
        status: "พอใช้",
        color: "text-yellow-400",
        description: "การออกกำลังกายอยู่ในเกณฑ์ดี แต่ควรปรับการบริโภคให้เหมาะสม",
      }
    } else {
      return { status: "ควรปรับปรุง", color: "text-red-500", description: "ควรปรับทั้งการบริโภคและการออกกำลังกาย" }
    }
  }

  const dayOverallStatus = getDayOverallStatus()

  // เพิ่มอาหารจากรายการที่มีอยู่
  const addCommonFood = () => {
    if (!selectedFood) return

    const food = commonFoods.find((f) => f.id === Number(selectedFood))
    if (!food) return

    const quantity = Number.parseInt(selectedFoodQuantity) || 1

    const newItem: FoodItem = {
      id: Date.now().toString(),
      name: food.name,
      calories: food.calories,
      quantity: quantity,
    }

    setFoodItems([...foodItems, newItem])
    setSelectedFood("")
    setSelectedFoodQuantity("1")

    toast({
      title: "เพิ่มอาหารสำเร็จ",
      description: `เพิ่ม ${food.name} (${food.calories} แคลอรี่) x ${quantity} แล้ว`,
    })
  }

  // เพิ่มอาหารแบบกำหนดเอง
  const addCustomFood = () => {
    if (!customFoodName || !customFoodCalories) return

    const calories = Number.parseInt(customFoodCalories)
    const quantity = Number.parseInt(customFoodQuantity) || 1

    if (isNaN(calories) || calories <= 0) {
      toast({
        title: "ข้อมูลไม่ถูกต้อง",
        description: "กรุณาระบุแคลอรี่เป็นตัวเลขที่มากกว่า 0",
        variant: "destructive",
      })
      return
    }

    const newItem: FoodItem = {
      id: Date.now().toString(),
      name: customFoodName,
      calories: calories,
      quantity: quantity,
    }

    setFoodItems([...foodItems, newItem])
    setCustomFoodName("")
    setCustomFoodCalories("")
    setCustomFoodQuantity("1")

    toast({
      title: "เพิ่มอาหารสำเร็จ",
      description: `เพิ่ม ${customFoodName} (${calories} แคลอรี่) x ${quantity} แล้ว`,
    })
  }

  // เพิ่มการออกกำลังกายจากรายการที่มีอยู่
  const addCommonExercise = () => {
    if (!selectedExercise || !formData.weight) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณาระบุน้ำหนักและเลือกประเภทการออกกำลังกาย",
        variant: "destructive",
      })
      return
    }

    const exercise = commonExercises.find((e) => e.id === Number(selectedExercise))
    if (!exercise) return

    const duration = Number.parseInt(exerciseDuration) || 30
    const weightNum = Number.parseFloat(formData.weight)

    // คำนวณแคลอรี่ที่เผาผลาญ = อัตราการเผาผลาญต่อนาทีต่อกิโลกรัม x น้ำหนัก x ระยะเวลา
    const caloriesBurned = Math.round(exercise.calories_per_minute_per_kg * weightNum * duration)

    const newItem: ExerciseItem = {
      id: Date.now().toString(),
      name: exercise.name,
      duration: duration,
      caloriesBurned: caloriesBurned,
      intensity: exercise.intensity,
    }

    setExerciseItems([...exerciseItems, newItem])
    setSelectedExercise("")
    setExerciseDuration("30")

    toast({
      title: "เพิ่มการออกกำลังกายสำเร็จ",
      description: `เพิ่ม ${exercise.name} (${duration} นาที, ${caloriesBurned} แคลอรี่) แล้ว`,
    })
  }

  // เพิ่มการออกกำลังกายแบบกำหนดเอง
  const addCustomExercise = () => {
    if (!customExerciseName || !customExerciseCalories || !customExerciseDuration) return

    const calories = Number.parseInt(customExerciseCalories)
    const duration = Number.parseInt(customExerciseDuration) || 30

    if (isNaN(calories) || calories <= 0) {
      toast({
        title: "ข้อมูลไม่ถูกต้อง",
        description: "กรุณาระบุแคลอรี่เป็นตัวเลขที่มากกว่า 0",
        variant: "destructive",
      })
      return
    }

    const newItem: ExerciseItem = {
      id: Date.now().toString(),
      name: customExerciseName,
      duration: duration,
      caloriesBurned: calories,
      intensity: customExerciseIntensity,
    }

    setExerciseItems([...exerciseItems, newItem])
    setCustomExerciseName("")
    setCustomExerciseCalories("")
    setCustomExerciseDuration("30")

    toast({
      title: "เพิ่มการออกกำลังกายสำเร็จ",
      description: `เพิ่ม ${customExerciseName} (${duration} นาที, ${calories} แคลอรี่) แล้ว`,
    })
  }

  // ลบอาหาร
  const removeFood = (id: string | number) => {
    setFoodItems(foodItems.filter((item) => item.id !== id))
  }

  // ลบการออกกำลังกาย
  const removeExercise = (id: string | number) => {
    setExerciseItems(exerciseItems.filter((item) => item.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!formData.date || !formData.weight || !formData.height) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        description: "วันที่, น้ำหนัก และส่วนสูงเป็นข้อมูลที่จำเป็น",
        variant: "destructive",
      })
      return
    }

    // Create new data object with all the information
    const newData = {
      ...formData,
      weight: Number.parseFloat(formData.weight),
      height: Number.parseFloat(formData.height),
      bodyFat: formData.bodyFat ? Number.parseFloat(formData.bodyFat) : null,
      waterIntake: formData.waterIntake ? Number.parseFloat(formData.waterIntake) : null,
      foodItems: foodItems,
      totalFoodCalories: totalFoodCalories,
      exerciseItems: exerciseItems,
      totalExerciseCalories: totalExerciseCalories,
      netCalories: netCalories,
      tdeeEstimate: tdeeEstimate,
      calorieStatus: calorieStatus.status,
      exerciseStatus: exerciseStatus.status,
      dayOverallStatus: dayOverallStatus.status,
    }

    // Submit data
    onSubmit(newData)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
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

  const listItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 },
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="basic" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 p-1 bg-gradient-to-r from-secondary/30 to-secondary/10 rounded-xl">
          <TabsTrigger
            value="basic"
            className="data-[state=active]:bg-gradient-to-b data-[state=active]:from-background data-[state=active]:to-background/90 data-[state=active]:text-primary data-[state=active]:shadow-md rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <Droplets className="h-4 w-4" />
            <span>ข้อมูลพื้นฐาน</span>
          </TabsTrigger>
          <TabsTrigger
            value="food"
            className="data-[state=active]:bg-gradient-to-b data-[state=active]:from-background data-[state=active]:to-background/90 data-[state=active]:text-primary data-[state=active]:shadow-md rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <Utensils className="h-4 w-4" />
            <span>อาหารและแคลอรี่</span>
          </TabsTrigger>
          <TabsTrigger
            value="exercise"
            className="data-[state=active]:bg-gradient-to-b data-[state=active]:from-background data-[state=active]:to-background/90 data-[state=active]:text-primary data-[state=active]:shadow-md rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <Dumbbell className="h-4 w-4" />
            <span>การออกกำลังกาย</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-6">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="space-y-2" variants={itemVariants}>
              <Label htmlFor="date" className="text-sm font-medium">
                วันที่
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/70 focus:border-primary/70 border-primary/20"
              />
            </motion.div>

            <motion.div className="space-y-2" variants={itemVariants}>
              <Label htmlFor="weight" className="text-sm font-medium">
                น้ำหนัก (กก.)
              </Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                step="0.1"
                placeholder="เช่น 65.5"
                value={formData.weight}
                onChange={handleChange}
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </motion.div>

            <motion.div className="space-y-2" variants={itemVariants}>
              <Label htmlFor="height" className="text-sm font-medium">
                ส่วนสูง (ซม.)
              </Label>
              <Input
                id="height"
                name="height"
                type="number"
                step="0.1"
                placeholder="เช่น 170.0"
                value={formData.height}
                onChange={handleChange}
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </motion.div>

            <motion.div className="space-y-2" variants={itemVariants}>
              <Label htmlFor="bodyFat" className="text-sm font-medium">
                เปอร์เซ็นต์ไขมัน (%)
              </Label>
              <Input
                id="bodyFat"
                name="bodyFat"
                type="number"
                step="0.1"
                placeholder="เช่น 20.0"
                value={formData.bodyFat}
                onChange={handleChange}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </motion.div>

            <motion.div className="space-y-2" variants={itemVariants}>
              <Label htmlFor="waterIntake" className="text-sm font-medium">
                ปริมาณน้ำที่ดื่ม (มล.)
              </Label>
              <Input
                id="waterIntake"
                name="waterIntake"
                type="number"
                placeholder="เช่น 2000"
                value={formData.waterIntake}
                onChange={handleChange}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </motion.div>

            <motion.div className="space-y-2" variants={itemVariants}>
              <Label htmlFor="bmi" className="text-sm font-medium">
                ค่าดัชนีมวลกาย (BMI)
              </Label>
              <Input
                id="bmi"
                name="bmi"
                type="number"
                step="0.01"
                value={formData.bmi || ""}
                readOnly
                className="bg-secondary/30 font-medium"
              />
              {formData.bmi > 0 && (
                <motion.p
                  className={`text-sm mt-1 ${
                    formData.bmi < 18.5
                      ? "text-blue-500"
                      : formData.bmi < 25
                        ? "text-green-500"
                        : formData.bmi < 30
                          ? "text-yellow-500"
                          : "text-red-500"
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {formData.bmi < 18.5
                    ? "น้ำหนักน้อย/ผอม"
                    : formData.bmi < 25
                      ? "ปกติ (สุขภาพดี)"
                      : formData.bmi < 30
                        ? "น้ำหนักเกิน"
                        : "อ้วน"}
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        </TabsContent>

        <TabsContent value="food" className="space-y-6 mt-6">
          {/* สรุปแคลอรี่ */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="bg-gradient-to-r from-secondary/20 to-background overflow-hidden border border-primary/20 shadow-md hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <h3 className="text-lg font-medium text-foreground/90">แคลอรี่จากอาหาร</h3>
                    <p className="text-3xl font-bold text-primary drop-shadow-sm">{totalFoodCalories} แคลอรี่</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">เป้าหมายประจำวัน (ประมาณ)</p>
                    <p className="font-medium">{tdeeEstimate} แคลอรี่</p>
                  </div>
                  <div>
                    <Badge
                      variant="outline"
                      className={`flex items-center gap-1 ${calorieStatus.color} border-current px-3 py-1 shadow-sm`}
                    >
                      {calorieStatus.icon}
                      {calorieStatus.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* รายการอาหารที่บันทึกไว้ */}
          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <Utensils className="h-4 w-4 text-primary" />
              รายการอาหารวันนี้
            </h3>
            {foodItems.length === 0 ? (
              <p className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg border border-dashed">
                ยังไม่มีรายการอาหาร กรุณาเพิ่มอาหารที่คุณรับประทานวันนี้
              </p>
            ) : (
              <motion.div className="space-y-2" variants={containerVariants} initial="hidden" animate="visible">
                <AnimatePresence>
                  {foodItems.map((item) => (
                    <motion.div
                      key={item.id}
                      className="flex items-center justify-between p-3 border border-primary/10 rounded-md bg-gradient-to-r from-white to-secondary/5 dark:from-gray-800 dark:to-gray-800/90 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200"
                      variants={listItemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.calories} แคลอรี่ x {item.quantity} = {item.calories * item.quantity} แคลอรี่
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFood(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {/* เพิ่มอาหารจากรายการที่มีอยู่ */}
          <motion.div
            className="space-y-2 border-t pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-medium">เพิ่มอาหารจากรายการ</h3>
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1">
                <Select value={selectedFood} onValueChange={setSelectedFood} disabled={isLoadingFoods}>
                  <SelectTrigger className="border-border focus:ring-2 focus:ring-primary focus:border-primary">
                    <SelectValue placeholder={isLoadingFoods ? "กำลังโหลด..." : "เลือกอาหาร"} />
                  </SelectTrigger>
                  <SelectContent>
                    {commonFoods.map((food) => (
                      <SelectItem key={food.id} value={food.id.toString()}>
                        {food.name} ({food.calories} แคลอรี่)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-24">
                <Input
                  type="number"
                  placeholder="จำนวน"
                  value={selectedFoodQuantity}
                  onChange={(e) => setSelectedFoodQuantity(e.target.value)}
                  min="1"
                  className="border-border focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <Button
                type="button"
                onClick={addCommonFood}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
                disabled={!selectedFood || isLoadingFoods}
              >
                <Plus className="h-4 w-4 mr-2" />
                เพิ่ม
              </Button>
            </div>
          </motion.div>

          {/* เพิ่มอาหารแบบกำหนดเอง */}
          <motion.div
            className="space-y-2 border-t pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="font-medium">เพิ่มอาหารแบบกำหนดเอง</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input
                placeholder="ชื่ออาหาร"
                value={customFoodName}
                onChange={(e) => setCustomFoodName(e.target.value)}
                className="border-border focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="แคลอรี่"
                  value={customFoodCalories}
                  onChange={(e) => setCustomFoodCalories(e.target.value)}
                  min="1"
                  className="border-border focus:ring-2 focus:ring-primary focus:border-primary"
                />
                <Input
                  type="number"
                  placeholder="จำนวน"
                  value={customFoodQuantity}
                  onChange={(e) => setCustomFoodQuantity(e.target.value)}
                  min="1"
                  className="w-24 border-border focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <Button
                type="button"
                onClick={addCustomFood}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
                disabled={!customFoodName || !customFoodCalories}
              >
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มอาหารใหม่
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="exercise" className="space-y-6 mt-6">
          {/* สรุปการออกกำลังกาย */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="bg-secondary/30 overflow-hidden border border-border shadow-md">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <h3 className="text-lg font-medium">แคลอรี่ที่เผาผลาญ</h3>
                    <p className="text-3xl font-bold text-primary drop-shadow-sm">{totalExerciseCalories} แคลอรี่</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">เป้าหมายการเผาผลาญ (ประมาณ)</p>
                    <p className="font-medium">{Math.round(tdeeEstimate * 0.15)} แคลอรี่</p>
                  </div>
                  <div>
                    <Badge
                      variant="outline"
                      className={`flex items-center gap-1 ${exerciseStatus.color} border-current px-3 py-1 shadow-sm`}
                    >
                      {exerciseStatus.icon}
                      {exerciseStatus.status}
                    </Badge>
                  </div>
                </div>

                {/* แสดงสมดุลแคลอรี่ */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>แคลอรี่จากอาหาร: {totalFoodCalories}</span>
                    <span>แคลอรี่สุทธิ: {netCalories}</span>
                  </div>
                  <Progress
                    value={(netCalories / tdeeEstimate) * 100}
                    max={100}
                    className="h-3 rounded-full"
                    indicatorClassName={
                      netCalories > tdeeEstimate
                        ? "bg-destructive rounded-full"
                        : netCalories < tdeeEstimate * 0.8
                          ? "bg-blue-500 rounded-full"
                          : "bg-primary rounded-full"
                    }
                  />
                  <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                    <span>0</span>
                    <span>{tdeeEstimate * 0.8}</span>
                    <span>{tdeeEstimate}</span>
                    <span>{tdeeEstimate * 1.2}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* รายการออกกำลังกายที่บันทึกไว้ */}
          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-primary" />
              รายการออกกำลังกายวันนี้
            </h3>
            {exerciseItems.length === 0 ? (
              <p className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg border border-dashed">
                ยังไม่มีรายการออกกำลังกาย กรุณาเพิ่มการออกกำลังกายของคุณวันนี้
              </p>
            ) : (
              <motion.div className="space-y-2" variants={containerVariants} initial="hidden" animate="visible">
                <AnimatePresence>
                  {exerciseItems.map((item) => (
                    <motion.div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-md bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200"
                      variants={listItemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{item.name}</p>
                          <Badge
                            variant="outline"
                            className={
                              item.intensity === "หนักมาก"
                                ? "bg-red-500/10 text-red-500 border-red-500/20"
                                : item.intensity === "หนัก"
                                  ? "bg-orange-500/10 text-orange-500 border-orange-500/20"
                                  : item.intensity === "ปานกลาง"
                                    ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                    : "bg-green-500/10 text-green-500 border-green-500/20"
                            }
                          >
                            {item.intensity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item.duration} นาที, เผาผลาญ {item.caloriesBurned} แคลอรี่
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExercise(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {/* เพิ่มการออกกำลังกายจากรายการที่มีอยู่ */}
          <motion.div
            className="space-y-2 border-t pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-medium">เพิ่มการออกกำลังกายจากรายการ</h3>
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1">
                <Select value={selectedExercise} onValueChange={setSelectedExercise} disabled={isLoadingExercises}>
                  <SelectTrigger className="border-border focus:ring-2 focus:ring-primary focus:border-primary">
                    <SelectValue placeholder={isLoadingExercises ? "กำลังโหลด..." : "เลือกการออกกำลังกาย"} />
                  </SelectTrigger>
                  <SelectContent>
                    {commonExercises.map((exercise) => (
                      <SelectItem key={exercise.id} value={exercise.id.toString()}>
                        {exercise.name} ({exercise.intensity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-24">
                <Input
                  type="number"
                  placeholder="นาที"
                  value={exerciseDuration}
                  onChange={(e) => setExerciseDuration(e.target.value)}
                  min="1"
                  className="border-border focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <Button
                type="button"
                onClick={addCommonExercise}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
                disabled={!selectedExercise || !formData.weight || isLoadingExercises}
              >
                <Flame className="h-4 w-4 mr-2" />
                เพิ่ม
              </Button>
            </div>
            {!formData.weight && (
              <p className="text-xs text-red-500">* กรุณากรอกน้ำหนักในแท็บข้อมูลพื้นฐานเพื่อคำนวณแคลอรี่ที่เผาผลาญ</p>
            )}
          </motion.div>

          {/* เพิ่มการออกกำลังกายแบบกำหนดเอง */}
          <motion.div
            className="space-y-2 border-t pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="font-medium">เพิ่มการออกกำลังกายแบบกำหนดเอง</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Input
                placeholder="ชื่อการออกกำลังกาย"
                value={customExerciseName}
                onChange={(e) => setCustomExerciseName(e.target.value)}
                className="border-border focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <Input
                type="number"
                placeholder="แคลอรี่ที่เผาผลาญ"
                value={customExerciseCalories}
                onChange={(e) => setCustomExerciseCalories(e.target.value)}
                min="1"
                className="border-border focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="นาที"
                  value={customExerciseDuration}
                  onChange={(e) => setCustomExerciseDuration(e.target.value)}
                  min="1"
                  className="border-border focus:ring-2 focus:ring-primary focus:border-primary"
                />
                <Select value={customExerciseIntensity} onValueChange={setCustomExerciseIntensity}>
                  <SelectTrigger className="w-24 border-border focus:ring-2 focus:ring-primary focus:border-primary">
                    <SelectValue placeholder="ความหนัก" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="เบา">เบา</SelectItem>
                    <SelectItem value="ปานกลาง">ปานกลาง</SelectItem>
                    <SelectItem value="หนัก">หนัก</SelectItem>
                    <SelectItem value="หนักมาก">หนักมาก</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                onClick={addCustomExercise}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
                disabled={!customExerciseName || !customExerciseCalories}
              >
                <Flame className="h-4 w-4 mr-2" />
                เพิ่มการออกกำลังกายใหม่
              </Button>
            </div>
          </motion.div>

          {/* สรุปผลรวมของวัน */}
          {(foodItems.length > 0 || exerciseItems.length > 0) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card
                className="mt-4 border-2 shadow-lg"
                style={{ borderColor: `hsl(var(--${dayOverallStatus.color.split("-")[1]}))` }}
              >
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium">สรุปผลรวมของวัน</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`${dayOverallStatus.color} px-3 py-1`}>{dayOverallStatus.status}</Badge>
                    <p>{dayOverallStatus.description}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-secondary/30 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">แคลอรี่จากอาหาร</p>
                      <p className="text-xl font-bold text-primary">{totalFoodCalories} แคลอรี่</p>
                    </div>
                    <div className="bg-secondary/30 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">แคลอรี่ที่เผาผลาญ</p>
                      <p className="text-xl font-bold text-primary">{totalExerciseCalories} แคลอรี่</p>
                    </div>
                    <div className="bg-secondary/30 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">แคลอรี่สุทธิ</p>
                      <p className="text-xl font-bold text-primary">{netCalories} แคลอรี่</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>

      <motion.div
        className="mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg hover:shadow-xl transition-all duration-300 py-6"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              กำลังบันทึกข้อมูล...
            </>
          ) : (
            "บันทึกข้อมูล"
          )}
        </Button>
      </motion.div>
    </form>
  )
}
