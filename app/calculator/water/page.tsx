"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { CalculatorSidebar } from "@/components/calculator-sidebar"
import { Droplet, Info, ChevronDown, ChevronUp, Scale, Waves, Check } from "lucide-react"

export default function WaterCalculator() {
  const [weight, setWeight] = useState<string>("")
  const [minWater, setMinWater] = useState<number | null>(null)
  const [maxWater, setMaxWater] = useState<number | null>(null)
  const [showInfo, setShowInfo] = useState(false)

  const calculateWaterIntake = () => {
    if (!weight) return

    const weightNum = Number.parseFloat(weight)

    if (weightNum <= 0) return

    // Calculate water intake based on the formula
    // Minimum water intake (liters) = Body weight (kg) × 0.03
    // Maximum water intake (liters) = Body weight (kg) × 0.035
    const minWaterLiters = weightNum * 0.03
    const maxWaterLiters = weightNum * 0.035

    // Convert to milliliters
    const minWaterML = Math.round(minWaterLiters * 1000)
    const maxWaterML = Math.round(maxWaterLiters * 1000)

    setMinWater(minWaterML)
    setMaxWater(maxWaterML)
  }

  // Calculate percentage of daily water intake for visualization
  const getWaterPercentage = (value: number) => {
    // Assuming 3000ml is 100%
    return Math.min(Math.round((value / 3000) * 100), 100)
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
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  }

  const resultVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 25 },
    },
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader activePage="calculator" />

      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
        {/* Sidebar Menu */}
        <CalculatorSidebar activePage="water" />

        {/* Main Content */}
        <motion.div
          className="flex-1 border border-primary/20 rounded-lg p-8 bg-gradient-to-b from-background to-background/80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <Waves className="text-primary h-8 w-8" />
            <h1 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
              โปรแกรมคำนวณการดื่มน้ำต่อวัน
            </h1>
            <Waves className="text-primary h-8 w-8" />
          </motion.div>

          <motion.div
            className="max-w-md mx-auto space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="bg-secondary/30 border border-primary/30 rounded-xl p-6 shadow-lg"
              variants={itemVariants}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Scale className="text-primary h-5 w-5" />
                  <label htmlFor="weight" className="block text-lg font-medium">
                    น้ำหนัก (กิโลกรัม):
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="weight"
                    type="number"
                    placeholder="กรอกน้ำหนักของคุณ"
                    className="w-full px-4 py-3 bg-background/80 border border-primary/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg transition-all duration-200"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primary/70">kg</span>
                </div>
              </div>

              <motion.button
                onClick={calculateWaterIntake}
                className="w-full mt-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-2 shadow-md"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Droplet className="h-5 w-5" />
                คำนวณปริมาณน้ำที่ควรดื่ม
              </motion.button>
            </motion.div>

            <AnimatePresence>
              {minWater !== null && maxWater !== null && (
                <motion.div
                  className="mt-8 space-y-6"
                  variants={resultVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  <motion.div
                    className="bg-gradient-to-br from-secondary/40 to-secondary/20 border border-primary/30 rounded-xl p-6 shadow-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className="text-xl font-semibold text-center mb-4 text-foreground">ปริมาณน้ำที่แนะนำ</h2>

                    <div className="flex flex-col items-center justify-center gap-4">
                      <p className="text-lg text-center">คุณควรดื่มน้ำประมาณ</p>

                      <div className="flex items-center justify-center gap-2 w-full">
                        <div className="relative w-full h-8 bg-secondary/40 rounded-full overflow-hidden">
                          <motion.div
                            className="absolute top-0 left-0 h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${getWaterPercentage(minWater)}%` }}
                            transition={{ delay: 0.5, duration: 1 }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-lg drop-shadow-md">
                              <span className="text-2xl">{minWater}</span> มล.
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-lg text-center">ถึง</p>

                      <div className="flex items-center justify-center gap-2 w-full">
                        <div className="relative w-full h-8 bg-secondary/40 rounded-full overflow-hidden">
                          <motion.div
                            className="absolute top-0 left-0 h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${getWaterPercentage(maxWater)}%` }}
                            transition={{ delay: 0.7, duration: 1 }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-lg drop-shadow-md">
                              <span className="text-2xl">{maxWater}</span> มล.
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-center text-muted-foreground mt-2">
                        หมายเหตุ: 1,000 มิลลิลิตร เท่ากับ น้ำ 1 ลิตร
                      </p>
                    </div>

                    <div className="mt-4 flex justify-center">
                      <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <motion.div
                              key={i}
                              className={`w-4 h-4 rounded-full ${i <= Math.ceil(maxWater / 500) ? "bg-primary" : "bg-secondary"}`}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.8 + i * 0.1 }}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">= แก้วน้ำขนาด 250 มล.</span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div className="mt-6">
                    <button
                      onClick={() => setShowInfo(!showInfo)}
                      className="flex items-center justify-between w-full px-4 py-3 bg-secondary/30 border border-primary/20 rounded-lg text-foreground hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        <span className="font-medium">ข้อมูลเพิ่มเติมเกี่ยวกับการดื่มน้ำ</span>
                      </div>
                      {showInfo ? (
                        <ChevronUp className="h-5 w-5 text-primary" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-primary" />
                      )}
                    </button>

                    <AnimatePresence>
                      {showInfo && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 space-y-6 p-4 bg-secondary/20 border border-primary/20 rounded-lg">
                            <div>
                              <h3 className="font-medium text-lg text-foreground mb-3 flex items-center gap-2">
                                <Droplet className="h-5 w-5 text-primary" />
                                ประโยชน์ของการดื่มน้ำให้เพียงพอ:
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                  "ช่วยในการขับถ่ายของเสียออกจากร่างกาย",
                                  "ช่วยควบคุมอุณหภูมิของร่างกาย",
                                  "ช่วยหล่อลื่นข้อต่อและกล้ามเนื้อ",
                                  "ช่วยในการย่อยอาหารและการดูดซึมสารอาหาร",
                                  "ช่วยให้ผิวพรรณชุ่มชื้น",
                                  "ช่วยลดความเสี่ยงในการเกิดนิ่วในไต",
                                ].map((benefit, index) => (
                                  <motion.div
                                    key={index}
                                    className="flex items-start gap-2 bg-secondary/30 p-3 rounded-lg"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                  >
                                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                    <span className="text-sm">{benefit}</span>
                                  </motion.div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h3 className="font-medium text-lg text-foreground mb-3 flex items-center gap-2">
                                <Droplet className="h-5 w-5 text-primary" />
                                เคล็ดลับการดื่มน้ำให้เพียงพอ:
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                  "พกขวดน้ำติดตัวเสมอ",
                                  "ดื่มน้ำก่อนและหลังมื้ออาหาร",
                                  "ดื่มน้ำเพิ่มเมื่อออกกำลังกายหรืออยู่ในที่ร้อน",
                                  "ตั้งเตือนเพื่อดื่มน้ำเป็นประจำ",
                                  "เพิ่มรสชาติให้น้ำด้วยผลไม้หรือสมุนไพร",
                                ].map((tip, index) => (
                                  <motion.div
                                    key={index}
                                    className="flex items-start gap-2 bg-secondary/30 p-3 rounded-lg"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * index + 0.3 }}
                                  >
                                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                    <span className="text-sm">{tip}</span>
                                  </motion.div>
                                ))}
                              </div>
                            </div>

                            <div className="bg-secondary/40 p-4 rounded-lg border border-primary/30">
                              <h3 className="font-medium text-foreground mb-2">ปริมาณน้ำที่แนะนำในกิจกรรมต่างๆ:</h3>
                              <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                                  <span>เพิ่มอีก 500-1,000 มล. เมื่อออกกำลังกายหนัก</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                                  <span>เพิ่มอีก 300-500 มล. เมื่ออยู่ในสภาพอากาศร้อน</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                                  <span>เพิ่มอีก 300 มล. สำหรับผู้หญิงตั้งครรภ์</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
