"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { CalculatorSidebar } from "@/components/calculator-sidebar"
import { Activity, Weight, Clock, Flame, ChevronDown, ChevronUp, Zap, Sun, Dumbbell, Check } from "lucide-react"
import type { JSX } from "react"

// Exercise calorie burn rates per kg per minute
const exerciseCalories: Record<string, number> = {
  walking: 0.063,
  jogging: 0.095,
  running: 0.135,
  cycling: 0.085,
  swimming: 0.11,
  weightlifting: 0.05,
  yoga: 0.045,
  hiit: 0.15,
  dancing: 0.075,
  basketball: 0.09,
}

// Exercise icons mapping
const exerciseIcons: Record<string, JSX.Element> = {
  walking: <Activity className="w-5 h-5" />,
  jogging: <Activity className="w-5 h-5" />,
  running: <Activity className="w-5 h-5" />,
  cycling: <Activity className="w-5 h-5" />,
  swimming: <Activity className="w-5 h-5" />,
  weightlifting: <Dumbbell className="w-5 h-5" />,
  yoga: <Activity className="w-5 h-5" />,
  hiit: <Zap className="w-5 h-5" />,
  dancing: <Activity className="w-5 h-5" />,
  basketball: <Activity className="w-5 h-5" />,
}

// Exercise intensity mapping
const exerciseIntensity: Record<string, string> = {
  walking: "เบา",
  jogging: "ปานกลาง",
  running: "หนัก",
  cycling: "ปานกลาง",
  swimming: "ปานกลาง-หนัก",
  weightlifting: "ปานกลาง",
  yoga: "เบา",
  hiit: "หนักมาก",
  dancing: "ปานกลาง",
  basketball: "ปานกลาง-หนัก",
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function CaloriesCalculator() {
  const [weight, setWeight] = useState<string>("")
  const [exercise, setExercise] = useState<string>("walking")
  const [duration, setDuration] = useState<string>("")
  const [calories, setCalories] = useState<number | null>(null)
  const [showInfo, setShowInfo] = useState<boolean>(false)

  const calculateCalories = () => {
    if (!weight || !duration) return

    const weightNum = Number.parseFloat(weight)
    const durationNum = Number.parseFloat(duration)

    if (weightNum <= 0 || durationNum <= 0) return

    // Calculate calories burned
    const caloriesBurned = Math.round(exerciseCalories[exercise] * weightNum * durationNum)

    setCalories(caloriesBurned)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader activePage="calculator" />

      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
        {/* Sidebar Menu */}
        <CalculatorSidebar activePage="calories" />

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 border border-primary/20 rounded-lg p-8"
        >
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
          >
            โปรแกรมคำนวณแคลลอรี่ออกกำลังกาย
          </motion.h1>

          <motion.div variants={container} initial="hidden" animate="show" className="max-w-md mx-auto space-y-6">
            <motion.div variants={item} className="space-y-2">
              <label htmlFor="weight" className="block flex items-center gap-2 text-primary">
                <Weight className="w-4 h-4" />
                น้ำหนัก (กก.):
              </label>
              <div className="relative">
                <input
                  id="weight"
                  type="number"
                  placeholder="น้ำหนัก"
                  className="w-full px-4 py-3 pl-10 bg-secondary/30 border border-primary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
                <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
              </div>
            </motion.div>

            <motion.div variants={item} className="space-y-2">
              <label htmlFor="exercise" className="block flex items-center gap-2 text-primary">
                <Activity className="w-4 h-4 text-primary" />
                ประเภทการออกกำลังกาย:
              </label>
              <div className="relative">
                <select
                  id="exercise"
                  className="w-full px-4 py-3 pl-10 appearance-none bg-background border border-primary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
                  value={exercise}
                  onChange={(e) => setExercise(e.target.value)}
                >
                  <option value="walking">เดิน</option>
                  <option value="jogging">วิ่งเหยาะ</option>
                  <option value="running">วิ่ง</option>
                  <option value="cycling">ปั่นจักรยาน</option>
                  <option value="swimming">ว่ายน้ำ</option>
                  <option value="weightlifting">ยกน้ำหนัก</option>
                  <option value="yoga">โยคะ</option>
                  <option value="hiit">HIIT</option>
                  <option value="dancing">เต้น</option>
                  <option value="basketball">บาสเกตบอล</option>
                </select>
                {exerciseIcons[exercise] && (
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary">
                    {exerciseIcons[exercise]}
                  </span>
                )}
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
              </div>
            </motion.div>

            <motion.div variants={item} className="space-y-2">
              <label htmlFor="duration" className="block flex items-center gap-2 text-primary">
                <Clock className="w-4 h-4" />
                ระยะเวลา (นาที):
              </label>
              <div className="relative">
                <input
                  id="duration"
                  type="number"
                  placeholder="ระยะเวลา"
                  className="w-full px-4 py-3 pl-10 bg-secondary/30 border border-primary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
              </div>
            </motion.div>

            <motion.button
              variants={item}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={calculateCalories}
              className="w-full py-3 px-4 bg-gradient-to-r from-primary to-primary/90 rounded-md text-primary-foreground font-medium hover:from-primary/90 hover:to-primary/80 transition-all flex items-center justify-center gap-2"
            >
              <Flame className="w-5 h-5" />
              คำนวณแคลอรี่
            </motion.button>

            {calories !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-8 space-y-4"
              >
                <motion.div
                  className="bg-gradient-to-r from-secondary/40 to-secondary/30 border border-primary/30 rounded-lg p-6 shadow-lg"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Flame className="w-8 h-8 text-primary" />
                    <h2 className="text-xl font-bold text-primary">ผลลัพธ์</h2>
                  </div>

                  <div className="text-center">
                    <p className="text-lg">คุณเผาผลาญพลังงานประมาณ</p>
                    <div className="flex items-center justify-center my-3">
                      <motion.span
                        className="text-4xl font-bold text-primary"
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 10,
                          delay: 0.3,
                        }}
                      >
                        {calories}
                      </motion.span>
                      <span className="ml-2 text-xl text-primary/90">แคลอรี่</span>
                    </div>

                    <div className="mt-4 text-sm bg-secondary/40 p-3 rounded-md inline-block">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-primary">ความเข้มข้น:</span>
                        <span className="text-foreground">{exerciseIntensity[exercise]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="w-full bg-secondary/50 rounded-full h-3">
                      <motion.div
                        className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, calories / 10)}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                      <span>0 kcal</span>
                      <span>1000 kcal</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="border border-primary/20 rounded-lg overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="w-full flex items-center justify-between p-4 bg-secondary/30 text-left font-medium text-primary hover:bg-secondary/40 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      ข้อมูลเพิ่มเติมเกี่ยวกับการเผาผลาญแคลอรี่
                    </span>
                    {showInfo ? (
                      <ChevronUp className="w-5 h-5 text-primary" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-primary" />
                    )}
                  </button>

                  {showInfo && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 space-y-6"
                    >
                      <div>
                        <h3 className="font-medium text-primary mb-3 flex items-center gap-2">
                          <Sun className="w-4 h-4" />
                          ข้อมูลเพิ่มเติม:
                        </h3>
                        <p className="text-sm">
                          การเผาผลาญแคลอรี่ขึ้นอยู่กับหลายปัจจัย เช่น น้ำหนัก, อายุ, เพศ, ระดับความเข้มข้นของการออกกำลังกาย
                          และอัตราการเผาผลาญพื้นฐานของแต่ละบุคคล ค่าที่คำนวณได้เป็นเพียงค่าประมาณเท่านั้น
                        </p>
                      </div>

                      <div>
                        <h3 className="font-medium text-primary mb-3 flex items-center gap-2">
                          <Flame className="w-4 h-4" />
                          เคล็ดลับการเผาผลาญแคลอรี่:
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-secondary/30 p-3 rounded-md border border-primary/10">
                            <div className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-sm">
                                การออกกำลังกายแบบ HIIT (High-Intensity Interval Training)
                                ช่วยเผาผลาญแคลอรี่ได้มากกว่าการออกกำลังกายแบบคงที่
                              </p>
                            </div>
                          </div>
                          <div className="bg-secondary/30 p-3 rounded-md border border-primary/10">
                            <div className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-sm">การออกกำลังกายในช่วงเช้าอาจช่วยเพิ่มอัตราการเผาผลาญตลอดทั้งวัน</p>
                            </div>
                          </div>
                          <div className="bg-secondary/30 p-3 rounded-md border border-primary/10">
                            <div className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-sm">การสร้างกล้ามเนื้อช่วยเพิ่มอัตราการเผาผลาญพื้นฐาน</p>
                            </div>
                          </div>
                          <div className="bg-secondary/30 p-3 rounded-md border border-primary/10">
                            <div className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-sm">การดื่มน้ำเพียงพอช่วยเพิ่มประสิทธิภาพในการเผาผลาญแคลอรี่</p>
                            </div>
                          </div>
                          <div className="bg-secondary/30 p-3 rounded-md border border-primary/10">
                            <div className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-sm">การนอนหลับให้เพียงพอมีผลต่อการเผาผลาญและการควบคุมน้ำหนัก</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium text-primary mb-3 flex items-center gap-2">
                          <Dumbbell className="w-4 h-4" />
                          การเผาผลาญแคลอรี่ตามกิจกรรม:
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full border-collapse">
                            <thead>
                              <tr className="bg-secondary/40 text-primary">
                                <th className="py-2 px-3 text-left text-sm font-medium">กิจกรรม</th>
                                <th className="py-2 px-3 text-left text-sm font-medium">ความเข้มข้น</th>
                                <th className="py-2 px-3 text-left text-sm font-medium">แคลอรี่/นาที (70 กก.)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/10">
                              <tr className="hover:bg-secondary/30">
                                <td className="py-2 px-3 text-sm">เดิน</td>
                                <td className="py-2 px-3 text-sm">เบา</td>
                                <td className="py-2 px-3 text-sm">4.4</td>
                              </tr>
                              <tr className="hover:bg-secondary/30">
                                <td className="py-2 px-3 text-sm">วิ่งเหยาะ</td>
                                <td className="py-2 px-3 text-sm">ปานกลาง</td>
                                <td className="py-2 px-3 text-sm">6.7</td>
                              </tr>
                              <tr className="hover:bg-secondary/30">
                                <td className="py-2 px-3 text-sm">วิ่ง</td>
                                <td className="py-2 px-3 text-sm">หนัก</td>
                                <td className="py-2 px-3 text-sm">9.5</td>
                              </tr>
                              <tr className="hover:bg-secondary/30">
                                <td className="py-2 px-3 text-sm">HIIT</td>
                                <td className="py-2 px-3 text-sm">หนักมาก</td>
                                <td className="py-2 px-3 text-sm">10.5</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
