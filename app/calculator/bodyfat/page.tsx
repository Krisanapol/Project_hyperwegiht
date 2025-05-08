"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { CalculatorSidebar } from "@/components/calculator-sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Info,
  Ruler,
  Weight,
  CassetteTapeIcon as Tape,
  User,
  ChevronDown,
  ChevronUp,
  UserIcon as Male,
  UserIcon as Female,
  BarChart3,
} from "lucide-react"

export default function BodyFatCalculator() {
  // สถานะสำหรับวิธี Navy
  const [navyGender, setNavyGender] = useState<string>("male")
  const [navyWaist, setNavyWaist] = useState<string>("")
  const [navyNeck, setNavyNeck] = useState<string>("")
  const [navyHip, setNavyHip] = useState<string>("")
  const [navyHeight, setNavyHeight] = useState<string>("")
  const [navyResult, setNavyResult] = useState<number | null>(null)

  // สถานะสำหรับวิธี BMI
  const [bmiGender, setBmiGender] = useState<string>("male")
  const [bmiWeight, setBmiWeight] = useState<string>("")
  const [bmiHeight, setBmiHeight] = useState<string>("")
  const [bmiAge, setBmiAge] = useState<string>("")
  const [bmiResult, setBmiResult] = useState<number | null>(null)

  // สถานะสำหรับการแสดงข้อมูลเพิ่มเติม
  const [showInfo, setShowInfo] = useState<boolean>(false)

  // คำนวณ Body Fat % ด้วยวิธี Navy
  const calculateNavyBodyFat = () => {
    if (!navyWaist || !navyNeck || !navyHeight || (navyGender === "female" && !navyHip)) return

    const waist = Number.parseFloat(navyWaist)
    const neck = Number.parseFloat(navyNeck)
    const height = Number.parseFloat(navyHeight)

    let bodyFat: number

    if (navyGender === "male") {
      // สูตรสำหรับผู้ชาย: 86.010 × log10(waist - neck) - 70.041 × log10(height) + 36.76
      bodyFat = 86.01 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76
    } else {
      // สูตรสำหรับผู้หญิง: 163.205 × log10(waist + hip - neck) - 97.684 × log10(height) - 78.387
      const hip = Number.parseFloat(navyHip)
      bodyFat = 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(height) - 78.387
    }

    // ป้องกันค่าติดลบ
    bodyFat = Math.max(bodyFat, 0)

    setNavyResult(Number.parseFloat(bodyFat.toFixed(1)))
  }

  // คำนวณ Body Fat % ด้วยวิธี BMI
  const calculateBmiBodyFat = () => {
    if (!bmiWeight || !bmiHeight || !bmiAge) return

    const weight = Number.parseFloat(bmiWeight)
    const height = Number.parseFloat(bmiHeight) / 100 // แปลงเป็นเมตร
    const age = Number.parseFloat(bmiAge)

    // คำนวณ BMI
    const bmi = weight / (height * height)

    let bodyFat: number

    if (bmiGender === "male") {
      // สูตรสำหรับผู้ชาย: (1.20 × BMI) + (0.23 × Age) - 16.2
      bodyFat = 1.2 * bmi + 0.23 * age - 16.2
    } else {
      // สูตรสำหรับผู้หญิง: (1.20 × BMI) + (0.23 × Age) - 5.4
      bodyFat = 1.2 * bmi + 0.23 * age - 5.4
    }

    // ป้องกันค่าติดลบ
    bodyFat = Math.max(bodyFat, 0)

    setBmiResult(Number.parseFloat(bodyFat.toFixed(1)))
  }

  // ฟังก์ชันสำหรับแสดงคำอธิบายระดับไขมัน
  const getBodyFatCategory = (bodyFat: number, gender: string) => {
    if (gender === "male") {
      if (bodyFat < 6)
        return {
          category: "ไขมันจำเป็น",
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
          border: "border-blue-500/30",
        }
      if (bodyFat < 14)
        return { category: "นักกีฬา", color: "text-green-500", bgColor: "bg-green-500/10", border: "border-green-500/30" }
      if (bodyFat < 18)
        return { category: "ฟิต", color: "text-green-500", bgColor: "bg-green-500/10", border: "border-green-500/30" }
      if (bodyFat < 25)
        return {
          category: "ปกติ",
          color: "text-yellow-400",
          bgColor: "bg-yellow-400/10",
          border: "border-yellow-400/30",
        }
      return { category: "อ้วน", color: "text-red-500", bgColor: "bg-red-500/10", border: "border-red-500/30" }
    } else {
      if (bodyFat < 14)
        return {
          category: "ไขมันจำเป็น",
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
          border: "border-blue-500/30",
        }
      if (bodyFat < 21)
        return { category: "นักกีฬา", color: "text-green-500", bgColor: "bg-green-500/10", border: "border-green-500/30" }
      if (bodyFat < 25)
        return { category: "ฟิต", color: "text-green-500", bgColor: "bg-green-500/10", border: "border-green-500/30" }
      if (bodyFat < 32)
        return {
          category: "ปกติ",
          color: "text-yellow-400",
          bgColor: "bg-yellow-400/10",
          border: "border-yellow-400/30",
        }
      return { category: "อ้วน", color: "text-red-500", bgColor: "bg-red-500/10", border: "border-red-500/30" }
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
      },
    },
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader activePage="calculator" />

      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
        {/* Sidebar Menu */}
        <CalculatorSidebar activePage="bodyfat" />

        {/* Main Content */}
        <motion.div
          className="flex-1 border border-yellow-400/20 rounded-lg p-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="mb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">โปรแกรมคำนวณเปอร์เซ็นต์ไขมันในร่างกาย</h1>
            <p className="text-muted-foreground">คำนวณเปอร์เซ็นต์ไขมันในร่างกายด้วยวิธี Navy และ BMI</p>
          </motion.div>

          <Tabs defaultValue="navy" className="w-full">
            <motion.div variants={itemVariants}>
              <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto mb-6 p-1 bg-background border border-yellow-400/20 rounded-lg">
                <TabsTrigger
                  value="navy"
                  className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black rounded-md transition-all duration-200"
                >
                  <div className="flex items-center gap-2">
                    <Tape className="h-4 w-4" />
                    <span>วิธี Navy</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="bmi"
                  className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black rounded-md transition-all duration-200"
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>วิธี BMI</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </motion.div>

            <TabsContent value="navy" className="mt-6">
              <motion.div variants={itemVariants}>
                <Card className="border border-yellow-400/20 overflow-hidden shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-yellow-400/10 to-transparent border-b border-yellow-400/20">
                    <CardTitle className="flex items-center gap-2">
                      <Tape className="h-5 w-5 text-yellow-400" />
                      คำนวณเปอร์เซ็นต์ไขมันด้วยวิธี Navy
                    </CardTitle>
                    <CardDescription>
                      วิธีนี้ใช้การวัดรอบเอว คอ และสะโพก (สำหรับผู้หญิง) เพื่อคำนวณเปอร์เซ็นต์ไขมันในร่างกาย
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="max-w-md mx-auto space-y-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">เพศ:</Label>
                        <RadioGroup value={navyGender} onValueChange={setNavyGender} className="flex gap-4">
                          <div className="flex-1">
                            <div
                              className={`flex items-center justify-center gap-2 p-3 rounded-lg border ${navyGender === "male" ? "bg-yellow-400/10 border-yellow-400" : "border-border hover:border-yellow-400/50"} transition-all cursor-pointer`}
                              onClick={() => setNavyGender("male")}
                            >
                              <RadioGroupItem value="male" id="navy-male" className="sr-only" />
                              <Male
                                className={`h-5 w-5 ${navyGender === "male" ? "text-yellow-400" : "text-muted-foreground"}`}
                              />
                              <Label
                                htmlFor="navy-male"
                                className={`cursor-pointer ${navyGender === "male" ? "text-foreground font-medium" : "text-muted-foreground"}`}
                              >
                                ชาย
                              </Label>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div
                              className={`flex items-center justify-center gap-2 p-3 rounded-lg border ${navyGender === "female" ? "bg-yellow-400/10 border-yellow-400" : "border-border hover:border-yellow-400/50"} transition-all cursor-pointer`}
                              onClick={() => setNavyGender("female")}
                            >
                              <RadioGroupItem value="female" id="navy-female" className="sr-only" />
                              <Female
                                className={`h-5 w-5 ${navyGender === "female" ? "text-yellow-400" : "text-muted-foreground"}`}
                              />
                              <Label
                                htmlFor="navy-female"
                                className={`cursor-pointer ${navyGender === "female" ? "text-foreground font-medium" : "text-muted-foreground"}`}
                              >
                                หญิง
                              </Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="navy-height" className="flex items-center gap-2 text-sm font-medium">
                          <Ruler className="h-4 w-4 text-yellow-400" />
                          ส่วนสูง (ซม.):
                        </Label>
                        <div className="relative">
                          <Input
                            id="navy-height"
                            type="number"
                            placeholder="ส่วนสูง"
                            value={navyHeight}
                            onChange={(e) => setNavyHeight(e.target.value)}
                            className="bg-background border border-yellow-400/50 focus-visible:ring-yellow-400 pr-12 transition-all"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                            ซม.
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="navy-waist" className="flex items-center gap-2 text-sm font-medium">
                          <Tape className="h-4 w-4 text-yellow-400" />
                          รอบเอว (ซม.):
                        </Label>
                        <div className="relative">
                          <Input
                            id="navy-waist"
                            type="number"
                            placeholder="รอบเอว"
                            value={navyWaist}
                            onChange={(e) => setNavyWaist(e.target.value)}
                            className="bg-background border border-yellow-400/50 focus-visible:ring-yellow-400 pr-12 transition-all"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                            ซม.
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="navy-neck" className="flex items-center gap-2 text-sm font-medium">
                          <Tape className="h-4 w-4 text-yellow-400" />
                          รอบคอ (ซม.):
                        </Label>
                        <div className="relative">
                          <Input
                            id="navy-neck"
                            type="number"
                            placeholder="รอบคอ"
                            value={navyNeck}
                            onChange={(e) => setNavyNeck(e.target.value)}
                            className="bg-background border border-yellow-400/50 focus-visible:ring-yellow-400 pr-12 transition-all"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                            ซม.
                          </div>
                        </div>
                      </div>

                      {navyGender === "female" && (
                        <motion.div
                          className="space-y-2"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Label htmlFor="navy-hip" className="flex items-center gap-2 text-sm font-medium">
                            <Tape className="h-4 w-4 text-yellow-400" />
                            รอบสะโพก (ซม.):
                          </Label>
                          <div className="relative">
                            <Input
                              id="navy-hip"
                              type="number"
                              placeholder="รอบสะโพก"
                              value={navyHip}
                              onChange={(e) => setNavyHip(e.target.value)}
                              className="bg-background border border-yellow-400/50 focus-visible:ring-yellow-400 pr-12 transition-all"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                              ซม.
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={calculateNavyBodyFat}
                          className="w-full py-6 bg-yellow-400 rounded-md text-black font-medium hover:bg-yellow-500 transition-colors"
                        >
                          คำนวณเปอร์เซ็นต์ไขมัน
                        </Button>
                      </motion.div>

                      {navyResult !== null && (
                        <motion.div
                          className={`mt-8 space-y-4 p-6 rounded-lg ${getBodyFatCategory(navyResult, navyGender).border} ${getBodyFatCategory(navyResult, navyGender).bgColor}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ type: "spring", stiffness: 100 }}
                        >
                          <div className="text-center">
                            <div className="text-sm uppercase tracking-wider text-muted-foreground mb-2">ผลลัพธ์</div>
                            <p className="text-lg">เปอร์เซ็นต์ไขมันในร่างกายของคุณคือ</p>
                            <div className="text-yellow-400 font-bold text-5xl my-3">{navyResult}%</div>

                            <div
                              className={`inline-block px-4 py-1 rounded-full ${getBodyFatCategory(navyResult, navyGender).bgColor} ${getBodyFatCategory(navyResult, navyGender).border} ${getBodyFatCategory(navyResult, navyGender).color} font-medium mt-2`}
                            >
                              {getBodyFatCategory(navyResult, navyGender).category}
                            </div>
                          </div>

                          <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full mt-4 overflow-hidden">
                            <div className="relative w-full h-full">
                              {/* Body fat scale */}
                              <div className="absolute inset-0 flex">
                                <div className="h-full w-1/5 bg-blue-500"></div>
                                <div className="h-full w-1/5 bg-green-500"></div>
                                <div className="h-full w-1/5 bg-green-400"></div>
                                <div className="h-full w-1/5 bg-yellow-400"></div>
                                <div className="h-full w-1/5 bg-red-500"></div>
                              </div>

                              {/* Indicator */}
                              {navyGender === "male" ? (
                                <div
                                  className="absolute top-0 h-full w-1 bg-white"
                                  style={{
                                    left: `${Math.min(Math.max((navyResult / 40) * 100, 0), 100)}%`,
                                    transform: "translateX(-50%)",
                                  }}
                                ></div>
                              ) : (
                                <div
                                  className="absolute top-0 h-full w-1 bg-white"
                                  style={{
                                    left: `${Math.min(Math.max((navyResult / 50) * 100, 0), 100)}%`,
                                    transform: "translateX(-50%)",
                                  }}
                                ></div>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>ไขมันจำเป็น</span>
                            <span>นักกีฬา</span>
                            <span>ฟิต</span>
                            <span>ปกติ</span>
                            <span>อ้วน</span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="bmi" className="mt-6">
              <motion.div variants={itemVariants}>
                <Card className="border border-yellow-400/20 overflow-hidden shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-yellow-400/10 to-transparent border-b border-yellow-400/20">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-yellow-400" />
                      คำนวณเปอร์เซ็นต์ไขมันด้วยวิธี BMI
                    </CardTitle>
                    <CardDescription>วิธีนี้ใช้ค่า BMI, อายุ และเพศ เพื่อประมาณเปอร์เซ็นต์ไขมันในร่างกาย</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="max-w-md mx-auto space-y-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">เพศ:</Label>
                        <RadioGroup value={bmiGender} onValueChange={setBmiGender} className="flex gap-4">
                          <div className="flex-1">
                            <div
                              className={`flex items-center justify-center gap-2 p-3 rounded-lg border ${bmiGender === "male" ? "bg-yellow-400/10 border-yellow-400" : "border-border hover:border-yellow-400/50"} transition-all cursor-pointer`}
                              onClick={() => setBmiGender("male")}
                            >
                              <RadioGroupItem value="male" id="bmi-male" className="sr-only" />
                              <Male
                                className={`h-5 w-5 ${bmiGender === "male" ? "text-yellow-400" : "text-muted-foreground"}`}
                              />
                              <Label
                                htmlFor="bmi-male"
                                className={`cursor-pointer ${bmiGender === "male" ? "text-foreground font-medium" : "text-muted-foreground"}`}
                              >
                                ชาย
                              </Label>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div
                              className={`flex items-center justify-center gap-2 p-3 rounded-lg border ${bmiGender === "female" ? "bg-yellow-400/10 border-yellow-400" : "border-border hover:border-yellow-400/50"} transition-all cursor-pointer`}
                              onClick={() => setBmiGender("female")}
                            >
                              <RadioGroupItem value="female" id="bmi-female" className="sr-only" />
                              <Female
                                className={`h-5 w-5 ${bmiGender === "female" ? "text-yellow-400" : "text-muted-foreground"}`}
                              />
                              <Label
                                htmlFor="bmi-female"
                                className={`cursor-pointer ${bmiGender === "female" ? "text-foreground font-medium" : "text-muted-foreground"}`}
                              >
                                หญิง
                              </Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bmi-weight" className="flex items-center gap-2 text-sm font-medium">
                          <Weight className="h-4 w-4 text-yellow-400" />
                          น้ำหนัก (กก.):
                        </Label>
                        <div className="relative">
                          <Input
                            id="bmi-weight"
                            type="number"
                            placeholder="น้ำหนัก"
                            value={bmiWeight}
                            onChange={(e) => setBmiWeight(e.target.value)}
                            className="bg-background border border-yellow-400/50 focus-visible:ring-yellow-400 pr-12 transition-all"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                            กก.
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bmi-height" className="flex items-center gap-2 text-sm font-medium">
                          <Ruler className="h-4 w-4 text-yellow-400" />
                          ส่วนสูง (ซม.):
                        </Label>
                        <div className="relative">
                          <Input
                            id="bmi-height"
                            type="number"
                            placeholder="ส่วนสูง"
                            value={bmiHeight}
                            onChange={(e) => setBmiHeight(e.target.value)}
                            className="bg-background border border-yellow-400/50 focus-visible:ring-yellow-400 pr-12 transition-all"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                            ซม.
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bmi-age" className="flex items-center gap-2 text-sm font-medium">
                          <User className="h-4 w-4 text-yellow-400" />
                          อายุ (ปี):
                        </Label>
                        <div className="relative">
                          <Input
                            id="bmi-age"
                            type="number"
                            placeholder="อายุ"
                            value={bmiAge}
                            onChange={(e) => setBmiAge(e.target.value)}
                            className="bg-background border border-yellow-400/50 focus-visible:ring-yellow-400 pr-12 transition-all"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                            ปี
                          </div>
                        </div>
                      </div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={calculateBmiBodyFat}
                          className="w-full py-6 bg-yellow-400 rounded-md text-black font-medium hover:bg-yellow-500 transition-colors"
                        >
                          คำนวณเปอร์เซ็นต์ไขมัน
                        </Button>
                      </motion.div>

                      {bmiResult !== null && (
                        <motion.div
                          className={`mt-8 space-y-4 p-6 rounded-lg ${getBodyFatCategory(bmiResult, bmiGender).border} ${getBodyFatCategory(bmiResult, bmiGender).bgColor}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ type: "spring", stiffness: 100 }}
                        >
                          <div className="text-center">
                            <div className="text-sm uppercase tracking-wider text-muted-foreground mb-2">ผลลัพธ์</div>
                            <p className="text-lg">เปอร์เซ็นต์ไขมันในร่างกายของคุณคือ</p>
                            <div className="text-yellow-400 font-bold text-5xl my-3">{bmiResult}%</div>

                            <div
                              className={`inline-block px-4 py-1 rounded-full ${getBodyFatCategory(bmiResult, bmiGender).bgColor} ${getBodyFatCategory(bmiResult, bmiGender).border} ${getBodyFatCategory(bmiResult, bmiGender).color} font-medium mt-2`}
                            >
                              {getBodyFatCategory(bmiResult, bmiGender).category}
                            </div>
                          </div>

                          <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full mt-4 overflow-hidden">
                            <div className="relative w-full h-full">
                              {/* Body fat scale */}
                              <div className="absolute inset-0 flex">
                                <div className="h-full w-1/5 bg-blue-500"></div>
                                <div className="h-full w-1/5 bg-green-500"></div>
                                <div className="h-full w-1/5 bg-green-400"></div>
                                <div className="h-full w-1/5 bg-yellow-400"></div>
                                <div className="h-full w-1/5 bg-red-500"></div>
                              </div>

                              {/* Indicator */}
                              {bmiGender === "male" ? (
                                <div
                                  className="absolute top-0 h-full w-1 bg-white"
                                  style={{
                                    left: `${Math.min(Math.max((bmiResult / 40) * 100, 0), 100)}%`,
                                    transform: "translateX(-50%)",
                                  }}
                                ></div>
                              ) : (
                                <div
                                  className="absolute top-0 h-full w-1 bg-white"
                                  style={{
                                    left: `${Math.min(Math.max((bmiResult / 50) * 100, 0), 100)}%`,
                                    transform: "translateX(-50%)",
                                  }}
                                ></div>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>ไขมันจำเป็น</span>
                            <span>นักกีฬา</span>
                            <span>ฟิต</span>
                            <span>ปกติ</span>
                            <span>อ้วน</span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>

          <motion.div variants={itemVariants} className="mt-8">
            <div className="border border-yellow-400/20 rounded-lg overflow-hidden">
              <div
                className="p-4 bg-yellow-400/5 border-b border-yellow-400/20 flex items-center justify-between cursor-pointer"
                onClick={() => setShowInfo(!showInfo)}
              >
                <div className="flex items-center gap-3">
                  <Info className="h-5 w-5 text-yellow-400" />
                  <h3 className="font-medium">เกี่ยวกับเปอร์เซ็นต์ไขมันในร่างกาย</h3>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {showInfo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>

              {showInfo && (
                <motion.div
                  className="p-4 space-y-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-sm">
                    เปอร์เซ็นต์ไขมันในร่างกาย (Body Fat Percentage) คือสัดส่วนของมวลไขมันต่อน้ำหนักตัวทั้งหมด เป็นตัวชี้วัดที่ดีกว่า BMI
                    ในการประเมินสุขภาพและความฟิต เนื่องจากคำนึงถึงองค์ประกอบของร่างกาย
                  </p>

                  <div className="grid md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Male className="h-4 w-4 text-yellow-400" />
                        ระดับเปอร์เซ็นต์ไขมันสำหรับผู้ชาย:
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2 p-2 rounded-md bg-blue-500/10 border border-blue-500/30">
                          <span className="text-blue-500 font-medium">ไขมันจำเป็น:</span> 2-5% - ระดับต่ำมาก
                          ใช้สำหรับการแข่งขันเท่านั้น
                        </li>
                        <li className="flex items-center gap-2 p-2 rounded-md bg-green-500/10 border border-green-500/30">
                          <span className="text-green-500 font-medium">นักกีฬา:</span> 6-13% -
                          ระดับของนักกีฬาและคนที่ออกกำลังกายอย่างสม่ำเสมอ
                        </li>
                        <li className="flex items-center gap-2 p-2 rounded-md bg-green-500/10 border border-green-500/30">
                          <span className="text-green-500 font-medium">ฟิต:</span> 14-17% - ระดับที่ดีสำหรับสุขภาพและความฟิต
                        </li>
                        <li className="flex items-center gap-2 p-2 rounded-md bg-yellow-400/10 border border-yellow-400/30">
                          <span className="text-yellow-400 font-medium">ปกติ:</span> 18-24% - ระดับปกติทั่วไป
                        </li>
                        <li className="flex items-center gap-2 p-2 rounded-md bg-red-500/10 border border-red-500/30">
                          <span className="text-red-500 font-medium">อ้วน:</span> 25%+ - ระดับที่อาจเพิ่มความเสี่ยงต่อโรคต่างๆ
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Female className="h-4 w-4 text-yellow-400" />
                        ระดับเปอร์เซ็นต์ไขมันสำหรับผู้หญิง:
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2 p-2 rounded-md bg-blue-500/10 border border-blue-500/30">
                          <span className="text-blue-500 font-medium">ไขมันจำเป็น:</span> 10-13% - ระดับต่ำมาก
                          ใช้สำหรับการแข่งขันเท่านั้น
                        </li>
                        <li className="flex items-center gap-2 p-2 rounded-md bg-green-500/10 border border-green-500/30">
                          <span className="text-green-500 font-medium">นักกีฬา:</span> 14-20% -
                          ระดับของนักกีฬาและคนที่ออกกำลังกายอย่างสม่ำเสมอ
                        </li>
                        <li className="flex items-center gap-2 p-2 rounded-md bg-green-500/10 border border-green-500/30">
                          <span className="text-green-500 font-medium">ฟิต:</span> 21-24% - ระดับที่ดีสำหรับสุขภาพและความฟิต
                        </li>
                        <li className="flex items-center gap-2 p-2 rounded-md bg-yellow-400/10 border border-yellow-400/30">
                          <span className="text-yellow-400 font-medium">ปกติ:</span> 25-31% - ระดับปกติทั่วไป
                        </li>
                        <li className="flex items-center gap-2 p-2 rounded-md bg-red-500/10 border border-red-500/30">
                          <span className="text-red-500 font-medium">อ้วน:</span> 32%+ - ระดับที่อาจเพิ่มความเสี่ยงต่อโรคต่างๆ
                        </li>
                      </ul>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mt-4 border-t border-yellow-400/20 pt-4">
                    หมายเหตุ: การคำนวณนี้เป็นเพียงการประมาณค่าเท่านั้น วิธีที่แม่นยำที่สุดในการวัดเปอร์เซ็นต์ไขมันคือการใช้เครื่องมือเฉพาะทาง เช่น
                    DEXA scan, Bod Pod หรือ Hydrostatic Weighing
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
