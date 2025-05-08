"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// ข้อมูลตัวอย่าง (ในระบบจริงควรดึงจากฐานข้อมูล)
const sampleFoodData = {
  date: "2023-12-01",
  totalCalories: 2150,
  tdeeEstimate: 2200,
  calorieStatus: "เหมาะสม",
  meals: [
    {
      type: "มื้อเช้า",
      items: [
        { name: "ข้าวกล้อง 1 จาน", calories: 170, quantity: 1 },
        { name: "ไข่ต้ม", calories: 70, quantity: 2 },
        { name: "นมสด 1 แก้ว", calories: 150, quantity: 1 },
      ],
    },
    {
      type: "มื้อกลางวัน",
      items: [
        { name: "ผัดกะเพราไก่ 1 จาน", calories: 400, quantity: 1 },
        { name: "ส้ม", calories: 45, quantity: 2 },
      ],
    },
    {
      type: "มื้อเย็น",
      items: [
        { name: "ก๋วยเตี๋ยวน้ำ 1 ชาม", calories: 350, quantity: 1 },
        { name: "แอปเปิ้ล 1 ผล", calories: 80, quantity: 1 },
      ],
    },
    {
      type: "ของว่าง",
      items: [
        { name: "โยเกิร์ต 1 ถ้วย", calories: 120, quantity: 1 },
        { name: "กล้วย 1 ผล", calories: 105, quantity: 1 },
      ],
    },
  ],
  nutritionSummary: {
    protein: 95, // กรัม
    carbs: 280, // กรัม
    fat: 65, // กรัม
    fiber: 25, // กรัม
  },
}

export default function FoodDetailPage() {
  const [foodData] = useState(sampleFoodData)

  // คำนวณแคลอรี่แต่ละมื้อ
  const getMealCalories = (meal: any) => {
    return meal.items.reduce((sum: number, item: any) => sum + item.calories * item.quantity, 0)
  }

  // คำนวณสัดส่วนแคลอรี่
  const getCaloriePercentage = (calories: number) => {
    return Math.round((calories / foodData.totalCalories) * 100)
  }

  // แสดงสถานะแคลอรี่
  const getStatusColor = () => {
    switch (foodData.calorieStatus) {
      case "เหมาะสม":
        return "text-green-500"
      case "ต่ำกว่าเป้าหมาย":
        return "text-blue-500"
      case "เกินเป้าหมาย":
        return "text-red-500"
      default:
        return "text-yellow-400"
    }
  }

  // แปลงวันที่เป็นรูปแบบที่อ่านง่าย
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader activePage="dashboard" />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">รายละเอียดอาหารและแคลอรี่</h1>
            </div>
            <div className="relative w-12 h-12 rounded-full overflow-hidden">
              <Image src="/images/healthy-lifestyle.png" alt="Healthy Food" fill className="object-cover" />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>สรุปข้อมูลอาหารวันที่ {formatDate(foodData.date)}</CardTitle>
              <CardDescription>รายละเอียดอาหารและแคลอรี่ที่คุณบริโภคในวันนี้</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* สรุปแคลอรี่ */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">แคลอรี่ทั้งหมด</p>
                  <p className="text-3xl font-bold text-yellow-400">{foodData.totalCalories} kcal</p>
                  <p className="text-sm mt-1">จากเป้าหมาย {foodData.tdeeEstimate} kcal</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">สถานะ</p>
                  <p className={`text-xl font-bold ${getStatusColor()}`}>{foodData.calorieStatus}</p>
                  <p className="text-sm mt-1">
                    {foodData.totalCalories < foodData.tdeeEstimate
                      ? `น้อยกว่าเป้าหมาย ${foodData.tdeeEstimate - foodData.totalCalories} kcal`
                      : foodData.totalCalories > foodData.tdeeEstimate
                        ? `มากกว่าเป้าหมาย ${foodData.totalCalories - foodData.tdeeEstimate} kcal`
                        : "พอดีกับเป้าหมาย"}
                  </p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">สารอาหารหลัก</p>
                  <div className="flex gap-2 mt-1">
                    <div>
                      <span className="text-sm">โปรตีน</span>
                      <p className="font-bold">{foodData.nutritionSummary.protein}g</p>
                    </div>
                    <div>
                      <span className="text-sm">คาร์บ</span>
                      <p className="font-bold">{foodData.nutritionSummary.carbs}g</p>
                    </div>
                    <div>
                      <span className="text-sm">ไขมัน</span>
                      <p className="font-bold">{foodData.nutritionSummary.fat}g</p>
                    </div>
                    <div>
                      <span className="text-sm">ใยอาหาร</span>
                      <p className="font-bold">{foodData.nutritionSummary.fiber}g</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* รายการอาหารแต่ละมื้อ */}
              <div className="space-y-4">
                <h2 className="text-xl font-medium">รายการอาหารตามมื้อ</h2>

                {foodData.meals.map((meal, index) => {
                  const mealCalories = getMealCalories(meal)
                  const percentage = getCaloriePercentage(mealCalories)

                  return (
                    <Card key={index}>
                      <CardHeader className="py-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">{meal.type}</CardTitle>
                          <div className="text-right">
                            <span className="text-lg font-bold">{mealCalories} kcal</span>
                            <p className="text-xs text-muted-foreground">{percentage}% ของทั้งวัน</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="py-2">
                        <ul className="space-y-2">
                          {meal.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex justify-between">
                              <span>
                                {item.name} {item.quantity > 1 ? `x ${item.quantity}` : ""}
                              </span>
                              <span className="font-medium">{item.calories * item.quantity} kcal</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* คำแนะนำ */}
              <Card className="bg-yellow-400/5 border-yellow-400/20">
                <CardHeader>
                  <CardTitle>คำแนะนำ</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    {foodData.calorieStatus === "เหมาะสม"
                      ? "คุณบริโภคแคลอรี่ในปริมาณที่เหมาะสมกับความต้องการของร่างกาย ทำให้สามารถรักษาน้ำหนักได้ดี"
                      : foodData.calorieStatus === "ต่ำกว่าเป้าหมาย"
                        ? "คุณบริโภคแคลอรี่น้อยกว่าที่ร่างกายต้องการ หากต้องการลดน้ำหนัก ไม่ควรลดต่ำกว่า 80% ของ TDEE และควรทานโปรตีนให้เพียงพอ"
                        : "คุณบริโภคแคลอรี่มากกว่าที่ร่างกายต้องการ หากไม่ต้องการเพิ่มน้ำหนัก ควรลดปริมาณอาหารหรือเพิ่มการออกกำลังกาย"}
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
