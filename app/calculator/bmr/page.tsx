"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { CalculatorSidebar } from "@/components/calculator-sidebar"
import { motion } from "framer-motion"
import { Activity, Flame, Info, UserIcon as Male, UserIcon as Female } from "lucide-react"

export default function BMRCalculator() {
  const [weight, setWeight] = useState<string>("")
  const [height, setHeight] = useState<string>("")
  const [age, setAge] = useState<string>("")
  const [gender, setGender] = useState<string>("male")
  const [bmr, setBmr] = useState<number | null>(null)
  const [showInfo, setShowInfo] = useState<boolean>(false)

  const calculateBMR = () => {
    if (!weight || !height || !age) return

    const weightNum = Number.parseFloat(weight)
    const heightNum = Number.parseFloat(height)
    const ageNum = Number.parseFloat(age)

    if (weightNum <= 0 || heightNum <= 0 || ageNum <= 0) return

    let bmrValue: number

    if (gender === "male") {
      // Harris-Benedict Equation for men
      bmrValue = 88.362 + 13.397 * weightNum + 4.799 * heightNum - 5.677 * ageNum
    } else {
      // Harris-Benedict Equation for women
      bmrValue = 447.593 + 9.247 * weightNum + 3.098 * heightNum - 4.33 * ageNum
    }

    setBmr(Math.round(bmrValue))
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

  const activityLevels = [
    { level: "นั่งอยู่กับที่", multiplier: 1.2, description: "ไม่ได้ออกกำลังกายหรือออกกำลังกายน้อยมาก" },
    { level: "ออกกำลังกายเบา", multiplier: 1.375, description: "ออกกำลังกายเบา 1-3 วัน/สัปดาห์" },
    { level: "ออกกำลังกายปานกลาง", multiplier: 1.55, description: "ออกกำลังกายปานกลาง 3-5 วัน/สัปดาห์" },
    { level: "ออกกำลังกายหนัก", multiplier: 1.725, description: "ออกกำลังกายหนัก 6-7 วัน/สัปดาห์" },
    { level: "ออกกำลังกายหนักมาก", multiplier: 1.9, description: "ออกกำลังกายหนักมากและทำงานที่ใช้แรงกาย" },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader activePage="calculator" />

      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
        {/* Sidebar Menu */}
        <CalculatorSidebar activePage="bmr" />

        {/* Main Content */}
        <motion.div
          className="flex-1 rounded-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-yellow-400/10 to-yellow-400/5 p-6 rounded-t-lg border-b border-yellow-400/20">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3"
            >
              <div className="p-2 bg-yellow-400/20 rounded-full">
                <Flame className="h-6 w-6 text-yellow-400" />
              </div>
              <h1 className="text-2xl font-bold">โปรแกรมคำนวณอัตราการเผาผลาญพลังงาน - BMR</h1>
            </motion.div>
            <motion.p
              className="text-muted-foreground mt-2 ml-11"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              คำนวณพลังงานพื้นฐานที่ร่างกายต้องการในแต่ละวัน
            </motion.p>
          </div>

          <div className="p-8 border border-yellow-400/20 rounded-b-lg bg-background/60 backdrop-blur-sm">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Input Form */}
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                <motion.div variants={itemVariants} className="space-y-2">
                  <label htmlFor="gender" className="block font-medium">
                    เพศ:
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label
                      className={`flex items-center justify-center p-4 rounded-lg border ${gender === "male" ? "bg-yellow-400/20 border-yellow-400" : "border-yellow-400/30 hover:bg-yellow-400/10"} transition-all cursor-pointer`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={gender === "male"}
                        onChange={() => setGender("male")}
                        className="sr-only"
                      />
                      <Male
                        className={`mr-2 h-5 w-5 ${gender === "male" ? "text-yellow-400" : "text-muted-foreground"}`}
                      />
                      ชาย
                    </label>
                    <label
                      className={`flex items-center justify-center p-4 rounded-lg border ${gender === "female" ? "bg-yellow-400/20 border-yellow-400" : "border-yellow-400/30 hover:bg-yellow-400/10"} transition-all cursor-pointer`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={gender === "female"}
                        onChange={() => setGender("female")}
                        className="sr-only"
                      />
                      <Female
                        className={`mr-2 h-5 w-5 ${gender === "female" ? "text-yellow-400" : "text-muted-foreground"}`}
                      />
                      หญิง
                    </label>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <label htmlFor="weight" className="block font-medium">
                    น้ำหนัก (กก.):
                  </label>
                  <div className="relative">
                    <input
                      id="weight"
                      type="number"
                      placeholder="น้ำหนัก"
                      className="w-full px-4 py-3 bg-background border border-yellow-400/50 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-400/70">กก.</span>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <label htmlFor="height" className="block font-medium">
                    ส่วนสูง (ซม.):
                  </label>
                  <div className="relative">
                    <input
                      id="height"
                      type="number"
                      placeholder="ส่วนสูง"
                      className="w-full px-4 py-3 bg-background border border-yellow-400/50 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-400/70">ซม.</span>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <label htmlFor="age" className="block font-medium">
                    อายุ (ปี):
                  </label>
                  <div className="relative">
                    <input
                      id="age"
                      type="number"
                      placeholder="อายุ"
                      className="w-full px-4 py-3 bg-background border border-yellow-400/50 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-400/70">ปี</span>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <motion.button
                    onClick={calculateBMR}
                    className="w-full py-4 bg-yellow-400 rounded-md text-black font-medium hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Flame className="h-5 w-5" />
                    คำนวณ BMR
                  </motion.button>
                </motion.div>
              </motion.div>

              {/* Results and Info */}
              <div>
                {bmr !== null ? (
                  <motion.div
                    className="bg-gradient-to-br from-yellow-400/20 to-yellow-400/5 rounded-lg p-6 border border-yellow-400/30"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 100 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">ผลการคำนวณ</h3>
                      <div className="p-1.5 bg-yellow-400/30 rounded-full">
                        <Activity className="h-5 w-5 text-yellow-400" />
                      </div>
                    </div>

                    <div className="text-center py-4">
                      <p className="text-sm text-yellow-400 uppercase tracking-wider mb-1">BMR ของคุณ</p>
                      <div className="flex items-center justify-center">
                        <motion.span
                          className="text-5xl font-bold text-yellow-400"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={bmr}
                        >
                          {bmr}
                        </motion.span>
                        <span className="ml-2 text-lg">แคลอรี่/วัน</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">พลังงานพื้นฐานที่ร่างกายต้องการในขณะพัก</p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-yellow-400/20">
                      <p className="text-sm font-medium mb-2">ความต้องการพลังงานตามระดับกิจกรรม:</p>
                      <ul className="space-y-2">
                        {activityLevels.map((activity, index) => (
                          <motion.li
                            key={index}
                            className="flex justify-between text-sm p-2 rounded hover:bg-yellow-400/10"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                          >
                            <span className="flex items-center">
                              <span className="w-28">{activity.level}:</span>
                              <span className="text-xs text-muted-foreground">{activity.description}</span>
                            </span>
                            <span className="font-medium text-yellow-400">
                              {Math.round(bmr * activity.multiplier)} แคลอรี่
                            </span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    className="bg-gradient-to-br from-yellow-400/10 to-yellow-400/5 rounded-lg p-6 border border-yellow-400/20 h-full flex flex-col justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="text-center py-8">
                      <div className="mx-auto w-16 h-16 rounded-full bg-yellow-400/20 flex items-center justify-center mb-4">
                        <Flame className="h-8 w-8 text-yellow-400/70" />
                      </div>
                      <h3 className="text-xl font-medium mb-2">กรอกข้อมูลเพื่อคำนวณ BMR</h3>
                      <p className="text-muted-foreground text-sm">กรุณากรอกข้อมูลน้ำหนัก ส่วนสูง และอายุให้ครบถ้วน</p>
                    </div>
                  </motion.div>
                )}

                <motion.div
                  className="mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-500 transition-colors"
                  >
                    <Info className="h-4 w-4" />
                    {showInfo ? "ซ่อนข้อมูลเพิ่มเติม" : "ข้อมูลเพิ่มเติมเกี่ยวกับ BMR"}
                  </button>

                  <motion.div
                    className="mt-3 text-sm text-muted-foreground bg-yellow-400/5 p-4 rounded-lg border border-yellow-400/10"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: showInfo ? "auto" : 0,
                      opacity: showInfo ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: "hidden" }}
                  >
                    <p>
                      BMR (Basal Metabolic Rate) คืออัตราการเผาผลาญพลังงานขั้นพื้นฐานที่ร่างกายต้องการในแต่ละวัน
                      เพื่อรักษาการทำงานของอวัยวะต่างๆ ในขณะพัก ค่านี้ไม่รวมพลังงานที่ใช้ในการทำกิจกรรมต่างๆ
                    </p>
                    <p className="mt-2">
                      การคำนวณใช้สูตร Harris-Benedict ซึ่งเป็นที่ยอมรับในทางการแพทย์ โดยคำนึงถึงเพศ น้ำหนัก ส่วนสูง และอายุ
                    </p>
                    <p className="mt-2">เพื่อคำนวณความต้องการพลังงานทั้งหมดต่อวัน (TDEE) ให้นำค่า BMR คูณกับตัวคูณระดับกิจกรรมของคุณ</p>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
