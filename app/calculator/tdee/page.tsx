"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { CalculatorSidebar } from "@/components/calculator-sidebar"
import { motion } from "framer-motion"
import { Activity, Flame, Info, Zap, UserIcon as Male, UserIcon as Female } from "lucide-react"

export default function TDEECalculator() {
  const [weight, setWeight] = useState<string>("")
  const [height, setHeight] = useState<string>("")
  const [age, setAge] = useState<string>("")
  const [gender, setGender] = useState<string>("male")
  const [activityLevel, setActivityLevel] = useState<string>("sedentary")
  const [tdee, setTdee] = useState<number | null>(null)
  const [bmr, setBmr] = useState<number | null>(null)
  const [showInfo, setShowInfo] = useState(false)

  const calculateTDEE = () => {
    if (!weight || !height || !age) return

    const weightNum = Number.parseFloat(weight)
    const heightNum = Number.parseFloat(height)
    const ageNum = Number.parseFloat(age)

    if (weightNum <= 0 || heightNum <= 0 || ageNum <= 0) return

    // Calculate BMR first
    let bmrValue: number

    if (gender === "male") {
      bmrValue = 88.362 + 13.397 * weightNum + 4.799 * heightNum - 5.677 * ageNum
    } else {
      bmrValue = 447.593 + 9.247 * weightNum + 3.098 * heightNum - 4.33 * ageNum
    }

    setBmr(Math.round(bmrValue))

    // Calculate TDEE based on activity level
    let tdeeValue: number

    switch (activityLevel) {
      case "sedentary":
        tdeeValue = bmrValue * 1.2
        break
      case "light":
        tdeeValue = bmrValue * 1.375
        break
      case "moderate":
        tdeeValue = bmrValue * 1.55
        break
      case "active":
        tdeeValue = bmrValue * 1.725
        break
      case "very_active":
        tdeeValue = bmrValue * 1.9
        break
      default:
        tdeeValue = bmrValue * 1.2
    }

    setTdee(Math.round(tdeeValue))
  }

  const activityLevels = [
    {
      id: "sedentary",
      label: "นั่งทำงานเป็นส่วนใหญ่ ไม่ออกกำลังกาย",
      multiplier: 1.2,
      icon: <Activity className="h-5 w-5" />,
      description: "ใช้ชีวิตแบบนั่งหรือนอนเป็นส่วนใหญ่ ไม่มีการออกกำลังกาย",
    },
    {
      id: "light",
      label: "ออกกำลังกายเบาๆ 1-3 วันต่อสัปดาห์",
      multiplier: 1.375,
      icon: <Activity className="h-5 w-5" />,
      description: "ออกกำลังกายเบาๆ หรือเล่นกีฬาเบาๆ 1-3 วันต่อสัปดาห์",
    },
    {
      id: "moderate",
      label: "ออกกำลังกายปานกลาง 3-5 วันต่อสัปดาห์",
      multiplier: 1.55,
      icon: <Activity className="h-5 w-5" />,
      description: "ออกกำลังกายปานกลาง หรือเล่นกีฬาปานกลาง 3-5 วันต่อสัปดาห์",
    },
    {
      id: "active",
      label: "ออกกำลังกายหนัก 6-7 วันต่อสัปดาห์",
      multiplier: 1.725,
      icon: <Activity className="h-5 w-5" />,
      description: "ออกกำลังกายหนัก หรือเล่นกีฬาหนัก 6-7 วันต่อสัปดาห์",
    },
    {
      id: "very_active",
      label: "ออกกำลังกายหนักมากหรือทำงานใช้แรงงาน",
      multiplier: 1.9,
      icon: <Activity className="h-5 w-5" />,
      description: "ออกกำลังกายหนักมาก หรือทำงานที่ใช้แรงงานมาก หรือเป็นนักกีฬาอาชีพ",
    },
  ]

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
        <CalculatorSidebar activePage="tdee" />

        {/* Main Content */}
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <h1 className="text-3xl font-bold mb-2">โปรแกรมคำนวณพลังงานที่ใช้ในแต่ละวัน</h1>
            <p className="text-muted-foreground">คำนวณ TDEE (Total Daily Energy Expenditure) เพื่อวางแผนควบคุมน้ำหนัก</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-card border border-yellow-400/20 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center mb-6">
                <div className="bg-yellow-400/10 p-2 rounded-full mr-3">
                  <Flame className="h-6 w-6 text-yellow-400" />
                </div>
                <h2 className="text-xl font-semibold">ข้อมูลพื้นฐาน</h2>
              </div>

              <motion.div variants={itemVariants} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="gender" className="block font-medium">
                    เพศ
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${
                        gender === "male"
                          ? "bg-yellow-400/20 border-yellow-400"
                          : "bg-card border-border hover:bg-yellow-400/10"
                      }`}
                      onClick={() => setGender("male")}
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
                        className={`h-5 w-5 mr-2 ${gender === "male" ? "text-yellow-400" : "text-muted-foreground"}`}
                      />
                      <span className={gender === "male" ? "font-medium" : ""}>ชาย</span>
                    </div>
                    <div
                      className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${
                        gender === "female"
                          ? "bg-yellow-400/20 border-yellow-400"
                          : "bg-card border-border hover:bg-yellow-400/10"
                      }`}
                      onClick={() => setGender("female")}
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
                        className={`h-5 w-5 mr-2 ${gender === "female" ? "text-yellow-400" : "text-muted-foreground"}`}
                      />
                      <span className={gender === "female" ? "font-medium" : ""}>หญิง</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="weight" className="block font-medium">
                    น้ำหนัก
                  </label>
                  <div className="relative">
                    <input
                      id="weight"
                      type="number"
                      placeholder="น้ำหนัก"
                      className="w-full px-4 py-3 bg-background border border-yellow-400/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent pr-12 transition-all"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                      กก.
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="height" className="block font-medium">
                    ส่วนสูง
                  </label>
                  <div className="relative">
                    <input
                      id="height"
                      type="number"
                      placeholder="ส่วนสูง"
                      className="w-full px-4 py-3 bg-background border border-yellow-400/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent pr-12 transition-all"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                      ซม.
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="age" className="block font-medium">
                    อายุ
                  </label>
                  <div className="relative">
                    <input
                      id="age"
                      type="number"
                      placeholder="อายุ"
                      className="w-full px-4 py-3 bg-background border border-yellow-400/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent pr-12 transition-all"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                      ปี
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="bg-yellow-400/10 p-1.5 rounded-full mr-2">
                      <Activity className="h-4 w-4 text-yellow-400" />
                    </div>
                    <label htmlFor="activityLevel" className="block font-medium">
                      ระดับกิจกรรม
                    </label>
                  </div>

                  <div className="space-y-2">
                    {activityLevels.map((level) => (
                      <div
                        key={level.id}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                          activityLevel === level.id
                            ? "bg-yellow-400/20 border-yellow-400"
                            : "bg-card border-border hover:bg-yellow-400/10"
                        }`}
                        onClick={() => setActivityLevel(level.id)}
                      >
                        <input
                          type="radio"
                          name="activityLevel"
                          value={level.id}
                          checked={activityLevel === level.id}
                          onChange={() => setActivityLevel(level.id)}
                          className="sr-only"
                        />
                        <div
                          className={`flex-shrink-0 mr-3 ${activityLevel === level.id ? "text-yellow-400" : "text-muted-foreground"}`}
                        >
                          {level.icon}
                        </div>
                        <div>
                          <div className={`${activityLevel === level.id ? "font-medium" : ""}`}>{level.label}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{level.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="mt-8"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={calculateTDEE}
                  className="w-full py-3 px-4 bg-yellow-400 rounded-lg text-black font-medium hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
                >
                  <Zap className="h-5 w-5" />
                  คำนวณ TDEE
                </button>
              </motion.div>
            </motion.div>

            {/* Results */}
            <div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-yellow-400/20 to-yellow-400/5 border border-yellow-400/30 rounded-xl p-6 shadow-sm mb-6"
              >
                <div className="text-center">
                  {tdee === null ? (
                    <div className="py-8">
                      <div className="bg-yellow-400/20 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Flame className="h-8 w-8 text-yellow-400" />
                      </div>
                      <h3 className="text-lg font-medium text-muted-foreground">กรอกข้อมูลและกดคำนวณเพื่อดูผลลัพธ์</h3>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <h3 className="text-xl font-medium">ค่า TDEE ของคุณคือ</h3>
                        <div className="text-5xl font-bold text-yellow-400 my-4 flex items-center justify-center">
                          <span>{tdee}</span>
                          <span className="text-lg ml-2 text-yellow-400/80">แคลอรี่/วัน</span>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          BMR (Basal Metabolic Rate):{" "}
                          <span className="font-medium text-foreground">{bmr} แคลอรี่/วัน</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ตัวคูณกิจกรรม:{" "}
                          <span className="font-medium text-foreground">
                            {activityLevels.find((l) => l.id === activityLevel)?.multiplier}x
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
                        <div className="bg-background/50 p-3 rounded-lg border border-border">
                          <div className="text-sm font-medium mb-1">ลดน้ำหนัก</div>
                          <div className="text-lg font-bold text-red-400">{tdee - 500} แคลอรี่</div>
                          <div className="text-xs text-muted-foreground">-500 แคลอรี่/วัน</div>
                        </div>
                        <div className="bg-background/50 p-3 rounded-lg border border-border">
                          <div className="text-sm font-medium mb-1">รักษาน้ำหนัก</div>
                          <div className="text-lg font-bold text-yellow-400">{tdee} แคลอรี่</div>
                          <div className="text-xs text-muted-foreground">เท่ากับ TDEE</div>
                        </div>
                        <div className="bg-background/50 p-3 rounded-lg border border-border">
                          <div className="text-sm font-medium mb-1">เพิ่มน้ำหนัก</div>
                          <div className="text-lg font-bold text-green-400">{tdee + 500} แคลอรี่</div>
                          <div className="text-xs text-muted-foreground">+500 แคลอรี่/วัน</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                <div
                  className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => setShowInfo(!showInfo)}
                >
                  <div className="flex items-center">
                    <Info className="h-5 w-5 text-yellow-400 mr-2" />
                    <h3 className="font-medium">ข้อมูลเพิ่มเติมเกี่ยวกับ TDEE</h3>
                  </div>
                  <div className={`transform transition-transform ${showInfo ? "rotate-180" : ""}`}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M2.5 4.5L6 8L9.5 4.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                <motion.div
                  initial={false}
                  animate={{ height: showInfo ? "auto" : 0, opacity: showInfo ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 text-sm space-y-3 text-muted-foreground">
                    <p>
                      TDEE (Total Daily Energy Expenditure) คือปริมาณพลังงานทั้งหมดที่ร่างกายใช้ในแต่ละวัน
                      รวมทั้งพลังงานที่ใช้ในการทำกิจกรรมต่างๆ ค่านี้เป็นประโยชน์สำหรับการวางแผนควบคุมน้ำหนัก
                    </p>
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">การนำค่า TDEE ไปใช้:</p>
                      <p>
                        <span className="font-medium text-foreground">การลดน้ำหนัก:</span> ทานอาหารน้อยกว่า TDEE ประมาณ 500
                        แคลอรี่/วัน
                      </p>
                      <p>
                        <span className="font-medium text-foreground">การรักษาน้ำหนัก:</span> ทานอาหารเท่ากับ TDEE
                      </p>
                      <p>
                        <span className="font-medium text-foreground">การเพิ่มน้ำหนัก:</span> ทานอาหารมากกว่า TDEE ประมาณ 500
                        แคลอรี่/วัน
                      </p>
                    </div>
                    <p>
                      การลดหรือเพิ่มแคลอรี่ 500 หน่วยต่อวันจะทำให้น้ำหนักเปลี่ยนแปลงประมาณ 0.5 กิโลกรัมต่อสัปดาห์ ซึ่งเป็นอัตราที่ปลอดภัยและยั่งยืน
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
