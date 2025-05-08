"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import Link from "next/link"
import { motion } from "framer-motion"
import { Calculator, Weight, Flame, Droplets, Activity, BarChart4, MessageSquareText } from "lucide-react"
import { useEffect, useState } from "react"

export default function CalculatorPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader activePage="calculator" />

      <main className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold mb-2">Calculators</h1>
          <p className="text-muted-foreground mb-8">เครื่องมือคำนวณต่างๆ เพื่อสุขภาพที่ดีของคุณ</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item}>
            <Link
              href="/calculator/bmi"
              className="group relative bg-secondary/80 p-6 rounded-lg border border-yellow-400/20 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/10 hover:border-yellow-400/40 flex flex-col h-full"
            >
              <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-yellow-400/10 group-hover:bg-yellow-400/20 transition-all duration-300"></div>
              <div className="flex items-center mb-3">
                <div className="p-2 rounded-lg bg-yellow-400/10 mr-3 group-hover:bg-yellow-400/20 transition-all duration-300">
                  <Weight className="h-5 w-5 text-yellow-400" />
                </div>
                <h2 className="text-xl font-semibold group-hover:text-yellow-400 transition-all duration-300">
                  BMI Calculator
                </h2>
              </div>
              <p className="text-muted-foreground group-hover:text-foreground/80 transition-all duration-300">
                คำนวนค่าดัชนีมวลกาย - BMI
              </p>
              <div className="mt-4 text-sm text-muted-foreground/70">
                <span className="inline-block px-2 py-1 rounded-full bg-yellow-400/10 text-yellow-400 text-xs">
                  ดัชนีมวลกาย
                </span>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={item}>
            <Link
              href="/calculator/bmr"
              className="group relative bg-secondary/80 p-6 rounded-lg border border-yellow-400/20 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/10 hover:border-yellow-400/40 flex flex-col h-full"
            >
              <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-yellow-400/10 group-hover:bg-yellow-400/20 transition-all duration-300"></div>
              <div className="flex items-center mb-3">
                <div className="p-2 rounded-lg bg-yellow-400/10 mr-3 group-hover:bg-yellow-400/20 transition-all duration-300">
                  <Flame className="h-5 w-5 text-yellow-400" />
                </div>
                <h2 className="text-xl font-semibold group-hover:text-yellow-400 transition-all duration-300">
                  BMR Calculator
                </h2>
              </div>
              <p className="text-muted-foreground group-hover:text-foreground/80 transition-all duration-300">
                คำนวณ BMR
              </p>
              <div className="mt-4 text-sm text-muted-foreground/70">
                <span className="inline-block px-2 py-1 rounded-full bg-yellow-400/10 text-yellow-400 text-xs">
                  อัตราการเผาผลาญพลังงาน
                </span>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={item}>
            <Link
              href="/calculator/tdee"
              className="group relative bg-secondary/80 p-6 rounded-lg border border-yellow-400/20 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/10 hover:border-yellow-400/40 flex flex-col h-full"
            >
              <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-yellow-400/10 group-hover:bg-yellow-400/20 transition-all duration-300"></div>
              <div className="flex items-center mb-3">
                <div className="p-2 rounded-lg bg-yellow-400/10 mr-3 group-hover:bg-yellow-400/20 transition-all duration-300">
                  <Activity className="h-5 w-5 text-yellow-400" />
                </div>
                <h2 className="text-xl font-semibold group-hover:text-yellow-400 transition-all duration-300">
                  TDEE Calculator
                </h2>
              </div>
              <p className="text-muted-foreground group-hover:text-foreground/80 transition-all duration-300">
                คำนวณ TDEE
              </p>
              <div className="mt-4 text-sm text-muted-foreground/70">
                <span className="inline-block px-2 py-1 rounded-full bg-yellow-400/10 text-yellow-400 text-xs">
                  พลังงานที่ใช้ในแต่ละวัน
                </span>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={item}>
            <Link
              href="/calculator/bodyfat"
              className="group relative bg-secondary/80 p-6 rounded-lg border border-yellow-400/20 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/10 hover:border-yellow-400/40 flex flex-col h-full"
            >
              <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-yellow-400/10 group-hover:bg-yellow-400/20 transition-all duration-300"></div>
              <div className="flex items-center mb-3">
                <div className="p-2 rounded-lg bg-yellow-400/10 mr-3 group-hover:bg-yellow-400/20 transition-all duration-300">
                  <BarChart4 className="h-5 w-5 text-yellow-400" />
                </div>
                <h2 className="text-xl font-semibold group-hover:text-yellow-400 transition-all duration-300">
                  Body Fat Calculator
                </h2>
              </div>
              <p className="text-muted-foreground group-hover:text-foreground/80 transition-all duration-300">
                คำนวณเปอร์เซ็นต์ไขมันในร่างกาย
              </p>
              <div className="mt-4 text-sm text-muted-foreground/70">
                <span className="inline-block px-2 py-1 rounded-full bg-yellow-400/10 text-yellow-400 text-xs">
                  เปอร์เซ็นต์ไขมัน
                </span>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={item}>
            <Link
              href="/calculator/water"
              className="group relative bg-secondary/80 p-6 rounded-lg border border-yellow-400/20 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/10 hover:border-yellow-400/40 flex flex-col h-full"
            >
              <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-yellow-400/10 group-hover:bg-yellow-400/20 transition-all duration-300"></div>
              <div className="flex items-center mb-3">
                <div className="p-2 rounded-lg bg-yellow-400/10 mr-3 group-hover:bg-yellow-400/20 transition-all duration-300">
                  <Droplets className="h-5 w-5 text-yellow-400" />
                </div>
                <h2 className="text-xl font-semibold group-hover:text-yellow-400 transition-all duration-300">
                  Water Intake Calculator
                </h2>
              </div>
              <p className="text-muted-foreground group-hover:text-foreground/80 transition-all duration-300">
                คำนวณการดื่มน้ำต่อวัน
              </p>
              <div className="mt-4 text-sm text-muted-foreground/70">
                <span className="inline-block px-2 py-1 rounded-full bg-yellow-400/10 text-yellow-400 text-xs">
                  ปริมาณน้ำที่ควรดื่ม
                </span>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={item}>
            <Link
              href="/calculator/calories"
              className="group relative bg-secondary/80 p-6 rounded-lg border border-yellow-400/20 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/10 hover:border-yellow-400/40 flex flex-col h-full"
            >
              <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-yellow-400/10 group-hover:bg-yellow-400/20 transition-all duration-300"></div>
              <div className="flex items-center mb-3">
                <div className="p-2 rounded-lg bg-yellow-400/10 mr-3 group-hover:bg-yellow-400/20 transition-all duration-300">
                  <Calculator className="h-5 w-5 text-yellow-400" />
                </div>
                <h2 className="text-xl font-semibold group-hover:text-yellow-400 transition-all duration-300">
                  Exercise Calories Calculator
                </h2>
              </div>
              <p className="text-muted-foreground group-hover:text-foreground/80 transition-all duration-300">
                คำนวณแคลลอรี่ออกกำลังกาย
              </p>
              <div className="mt-4 text-sm text-muted-foreground/70">
                <span className="inline-block px-2 py-1 rounded-full bg-yellow-400/10 text-yellow-400 text-xs">
                  แคลอรี่ที่เผาผลาญ
                </span>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={item}>
            <Link
              href="/chathp"
              className="group relative bg-secondary/80 p-6 rounded-lg border border-yellow-400/20 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/10 hover:border-yellow-400/40 flex flex-col h-full"
            >
              <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-yellow-400/10 group-hover:bg-yellow-400/20 transition-all duration-300"></div>
              <div className="flex items-center mb-3">
                <div className="p-2 rounded-lg bg-yellow-400/10 mr-3 group-hover:bg-yellow-400/20 transition-all duration-300">
                  <MessageSquareText className="h-5 w-5 text-yellow-400" />
                </div>
                <h2 className="text-xl font-semibold group-hover:text-yellow-400 transition-all duration-300">
                  ผู้ช่วยสุขภาพ
                </h2>
              </div>
              <p className="text-muted-foreground group-hover:text-foreground/80 transition-all duration-300">
                ถามคำถามเกี่ยวกับสุขภาพและการออกกำลังกาย
              </p>
              <div className="mt-4 text-sm text-muted-foreground/70">
                <span className="inline-block px-2 py-1 rounded-full bg-yellow-400/10 text-yellow-400 text-xs">
                  AI ผู้ช่วย
                </span>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
