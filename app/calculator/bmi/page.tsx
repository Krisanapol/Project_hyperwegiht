"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { CalculatorSidebar } from "@/components/calculator-sidebar"
import { Scale, ArrowRight, Info, Activity } from "lucide-react"

export default function BMICalculator() {
  const [weight, setWeight] = useState<string>("")
  const [height, setHeight] = useState<string>("")
  const [bmi, setBmi] = useState<number | null>(null)
  const [bmiCategory, setBmiCategory] = useState<string>("")
  const [showInfo, setShowInfo] = useState<boolean>(false)

  const calculateBMI = () => {
    if (!weight || !height) return

    const weightNum = Number.parseFloat(weight)
    const heightNum = Number.parseFloat(height) / 100 // convert cm to m

    if (weightNum <= 0 || heightNum <= 0) return

    const bmiValue = weightNum / (heightNum * heightNum)
    setBmi(Number.parseFloat(bmiValue.toFixed(1)))

    // Set BMI category
    if (bmiValue < 18.5) {
      setBmiCategory("ผอมเกินไป")
    } else if (bmiValue >= 18.5 && bmiValue < 25) {
      setBmiCategory("น้ำหนักปกติ")
    } else if (bmiValue >= 25 && bmiValue < 30) {
      setBmiCategory("อ้วน")
    } else {
      setBmiCategory("อ้วนมาก")
    }
  }

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "ผอมเกินไป":
        return "text-blue-400"
      case "น้ำหนักปกติ":
        return "text-green-400"
      case "อ้วน":
        return "text-orange-400"
      case "อ้วนมาก":
        return "text-red-400"
      default:
        return "text-yellow-400"
    }
  }

  // Get BMI scale position (0-100%)
  const getBmiScalePosition = (bmiValue: number) => {
    if (bmiValue < 15) return 0
    if (bmiValue > 35) return 100
    return ((bmiValue - 15) / 20) * 100
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
        <CalculatorSidebar activePage="bmi" />

        {/* Main Content */}
        <motion.div
          className="flex-1 border border-yellow-400/20 rounded-lg p-8 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none"></div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-3 mb-2"
          >
            <Scale className="text-yellow-400 h-8 w-8" />
            <h1 className="text-2xl font-bold text-center">โปรแกรมคำนวณค่าดัชนีมวลกาย - BMI</h1>
          </motion.div>

          <motion.p
            className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            ค่าดัชนีมวลกาย (BMI) เป็นค่าที่คำนวณจากน้ำหนักและส่วนสูง ใช้ประเมินว่าน้ำหนักของคุณเหมาะสมกับส่วนสูงหรือไม่
          </motion.p>

          <div className="max-w-3xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Input Form */}
              <motion.div
                className="bg-secondary/20 p-6 rounded-xl border border-yellow-400/20 shadow-sm"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="weight" className="block font-medium flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-400">
                        <span className="text-xs">1</span>
                      </span>
                      น้ำหนัก (กิโลกรัม):
                    </label>
                    <div className="relative">
                      <input
                        id="weight"
                        type="number"
                        placeholder="น้ำหนัก"
                        className="w-full px-4 py-3 bg-background border border-yellow-400/30 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">kg</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="height" className="block font-medium flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-400">
                        <span className="text-xs">2</span>
                      </span>
                      ส่วนสูง (เซนติเมตร):
                    </label>
                    <div className="relative">
                      <input
                        id="height"
                        type="number"
                        placeholder="ส่วนสูง"
                        className="w-full px-4 py-3 bg-background border border-yellow-400/30 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">cm</span>
                    </div>
                  </div>

                  <motion.button
                    onClick={calculateBMI}
                    className="w-full py-3 bg-yellow-400 rounded-md text-black font-medium hover:bg-yellow-500 transition-all flex items-center justify-center gap-2 group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    คำนวณ
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </motion.button>
                </motion.div>
              </motion.div>

              {/* Results */}
              <motion.div
                className={`p-6 rounded-xl border ${bmi !== null ? "bg-secondary/20 border-yellow-400/20" : "bg-secondary/10 border-border/50"} shadow-sm flex flex-col justify-center`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {bmi !== null ? (
                  <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">ค่า BMI ของคุณคือ</div>
                      <div className="text-5xl font-bold text-yellow-400 mb-2">{bmi}</div>
                      <div className="inline-block px-3 py-1 rounded-full bg-secondary/30 border border-yellow-400/20">
                        <span className={`font-medium ${getCategoryColor(bmiCategory)}`}>{bmiCategory}</span>
                      </div>
                    </div>

                    {/* BMI Scale */}
                    <div className="space-y-2">
                      <div className="h-3 bg-secondary/30 rounded-full overflow-hidden relative">
                        {/* Color segments */}
                        <div className="absolute top-0 left-0 h-full w-[25%] bg-blue-400/70 rounded-l-full"></div>
                        <div className="absolute top-0 left-[25%] h-full w-[30%] bg-green-400/70"></div>
                        <div className="absolute top-0 left-[55%] h-full w-[20%] bg-orange-400/70"></div>
                        <div className="absolute top-0 left-[75%] h-full w-[25%] bg-red-400/70 rounded-r-full"></div>

                        {/* Indicator */}
                        {bmi && (
                          <motion.div
                            className="absolute top-0 h-full w-1 bg-white shadow-md"
                            style={{ left: `${getBmiScalePosition(bmi)}%` }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                          ></motion.div>
                        )}
                      </div>

                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>15</span>
                        <span>18.5</span>
                        <span>25</span>
                        <span>30</span>
                        <span>35+</span>
                      </div>

                      <div className="flex justify-between text-xs">
                        <span className="text-blue-400">ผอมเกินไป</span>
                        <span className="text-green-400">น้ำหนักปกติ</span>
                        <span className="text-orange-400">อ้วน</span>
                        <span className="text-red-400">อ้วนมาก</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div className="text-center space-y-3 py-6" variants={itemVariants}>
                    <Activity className="h-12 w-12 mx-auto text-yellow-400/50" />
                    <p className="text-muted-foreground">กรุณากรอกน้ำหนักและส่วนสูงเพื่อคำนวณค่า BMI</p>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* BMI Information */}
            <motion.div
              className="mt-8 space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">ข้อมูลเพิ่มเติมเกี่ยวกับ BMI</h3>
                <button
                  onClick={() => setShowInfo(!showInfo)}
                  className="text-yellow-400 hover:text-yellow-500 transition-colors flex items-center gap-1"
                >
                  <Info className="h-4 w-4" />
                  <span className="text-sm">{showInfo ? "ซ่อนข้อมูล" : "แสดงข้อมูล"}</span>
                </button>
              </div>

              {showInfo && (
                <motion.div
                  className="mt-4 space-y-6 bg-secondary/10 p-6 rounded-xl border border-yellow-400/10"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-2">
                    <h3 className="text-yellow-400 font-bold">อ้วนมาก = 30.0 ขึ้นไป</h3>
                    <p className="text-sm">
                      ค่อนข้างอันตราย เสี่ยงต่อการเกิดโรค หลายแรงที่แฝงมากับความอ้วน หากค่า BMI อยู่ในระดับนี้ จะต้องปรับพฤติกรรมการทานอาหาร
                      และควรเริ่มออกกำลังกาย แต่หากเลขยิ่งสูงกว่า 40.0 ยิ่งแสดงถึงความอ้วนที่มากขึ้น ควรไปตรวจสุขภาพ และปรึกษาแพทย์
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-yellow-400 font-bold">อ้วน = 25.0 - 29.9</h3>
                    <p className="text-sm">
                      อ้วนในระดับหนึ่ง ถึงแม้จะไม่อันตรายที่ถึงว่าอ้วนมาก ๆ แต่ก็ยังมีความเสี่ยงต่อการเกิดโรคที่มากับความอ้วนได้เช่นกัน ทั้งโรคเบาหวาน
                      และความดันโลหิตสูง ควรปรับพฤติกรรมการทานอาหาร ออกกำลังกาย และตรวจสุขภาพ
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-yellow-400 font-bold">น้ำหนักปกติ เหมาะสม = 18.6 - 24</h3>
                    <p className="text-sm">
                      น้ำหนักที่เหมาะสมสำหรับคนไทยคือค่า BMI ระหว่าง 18.5-24 ซึ่งอยู่ในเกณฑ์ที่ปกติ ห่างไกลโรคที่เกิดจากความอ้วน
                      และมีความเสี่ยงต่อการเกิดโรคต่าง ๆ น้อยที่สุด ควรพยายามรักษาระดับค่า BMI ให้อยู่ในระดับนี้ให้นานที่สุด และควรตรวจสุขภาพทุกปี
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-yellow-400 font-bold">ผอมเกินไป = น้อยกว่า 18.5</h3>
                    <p className="text-sm">
                      น้ำหนักน้อยกว่าปกติไม่ค่อยดี หากคุณสูงมากแต่น้ำหนักน้อยเกินไป
                      อาจเสี่ยงต่อการได้รับสารอาหารไม่เพียงพอหรือได้รับพลังงานไม่เพียงพอ ส่งผลให้ร่างกายอ่อนเพลียง่าย
                      การรับประทานอาหารให้เพียงพอ และการออกกำลังกายเพื่อเสริมสร้างกล้ามเนื้อสามารถช่วยเพิ่มค่า BMI ให้อยู่ในเกณฑ์ปกติได้
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm">
                      ค่า BMI จากโปรแกรมคำนวณนี้ เป็นค่าสำหรับชาวเอเชียและคนไทย ซึ่งอาจแตกต่างกันไปในแต่ละเชื้อชาติ ค่า BMI
                      เฉลี่ยของผู้หญิงไทยคือ 24.4 และของชายไทยคือ 23.1 (อายุตั้งแต่ 20 ปีขึ้นไป)
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
