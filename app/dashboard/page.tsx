"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { HealthMetricsChart } from "@/components/health-metrics-chart"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  Heart,
  Droplets,
  Scale,
  Loader2,
  TrendingUp,
  TrendingDown,
  Target,
  ChevronRight,
  Calendar,
  BarChart3,
  TableProperties,
  PlusCircle,
  Sparkles,
  RefreshCw,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getUserHealthData, type HealthDataEntry } from "@/lib/health-data"
import { toast } from "@/components/ui/use-toast"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { getActiveGoals } from "@/lib/goals"
import { GoalProgressCard } from "@/components/goal-progress-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function Dashboard() {
  const [healthData, setHealthData] = useState<HealthDataEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const [activeGoals, setActiveGoals] = useState([])
  const [chartHeight, setChartHeight] = useState(250)
  const [refreshing, setRefreshing] = useState(false)
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.2])

  // ตรวจสอบขนาดหน้าจอและปรับความสูงของกราฟ
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768) {
        setChartHeight(200)
      } else {
        setChartHeight(250)
      }
    }

    // เรียกใช้ฟังก์ชันครั้งแรกเพื่อตั้งค่าเริ่มต้น
    handleResize()

    // เพิ่ม event listener สำหรับการปรับขนาดหน้าจอ
    window.addEventListener("resize", handleResize)

    // ทำความสะอาด event listener เมื่อ component unmount
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const refreshData = async () => {
    if (!user || refreshing) return

    setRefreshing(true)
    try {
      const data = await getUserHealthData(user.id)
      setHealthData(data)

      const goals = await getActiveGoals(user.id)
      setActiveGoals(goals)

      toast({
        title: "อัพเดทข้อมูลสำเร็จ",
        description: "ข้อมูลสุขภาพของคุณได้รับการอัพเดทแล้ว",
        variant: "default",
      })
    } catch (error) {
      console.error("Error refreshing data:", error)
      toast({
        title: "ไม่สามารถอัพเดทข้อมูลได้",
        description: "เกิดข้อผิดพลาดในการอัพเดทข้อมูล โปรดลองอีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    async function fetchData() {
      if (!user) return

      setIsLoading(true)
      try {
        const data = await getUserHealthData(user.id)
        setHealthData(data)
      } catch (error) {
        console.error("Error fetching health data:", error)
        toast({
          title: "ไม่สามารถโหลดข้อมูลได้",
          description: "เกิดข้อผิดพลาดในการโหลดข้อมูลสุขภาพของคุณ",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }

      // โหลดข้อมูลเป้าหมายแยกต่างหาก
      try {
        const goals = await getActiveGoals(user.id)
        setActiveGoals(goals)
      } catch (error) {
        console.error("Error fetching active goals:", error)
        setActiveGoals([])
      }
    }

    fetchData()
  }, [user])

  // Get the most recent data for the summary cards
  const latestData = healthData.length > 0 ? healthData[healthData.length - 1] : null
  const previousData = healthData.length > 1 ? healthData[healthData.length - 2] : null

  // Calculate changes from previous entry if available
  const weightChange = latestData && previousData ? latestData.weight - previousData.weight : 0
  const bmiChange = latestData && previousData ? latestData.bmi - previousData.bmi : 0
  const bodyFatChange = latestData && previousData ? latestData.body_fat - previousData.body_fat : 0
  const waterIntakeChange = latestData && previousData ? latestData.water_intake - previousData.water_intake : 0

  // Function to get BMI category
  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { text: "น้ำหนักน้อย", color: "text-blue-500", bgColor: "bg-blue-500/10" }
    if (bmi < 25) return { text: "น้ำหนักปกติ", color: "text-green-500", bgColor: "bg-green-500/10" }
    if (bmi < 30) return { text: "น้ำหนักเกิน", color: "text-yellow-400", bgColor: "bg-yellow-400/10" }
    return { text: "อ้วน", color: "text-red-500", bgColor: "bg-red-500/10" }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  }

  const cardVariants = {
    hover: {
      y: -8,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
    tap: {
      scale: 0.98,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <DashboardHeader activePage="dashboard" />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold">ข้อมูลสุขภาพของคุณ</h1>
            </div>
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-4">
                <motion.div
                  animate={{
                    rotate: 360,
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    rotate: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                    scale: { duration: 1, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
                  }}
                >
                  <Loader2 className="h-12 w-12 text-primary" />
                </motion.div>
                <motion.p
                  className="text-muted-foreground text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  กำลังโหลดข้อมูลสุขภาพของคุณ...
                </motion.p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (healthData.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <DashboardHeader activePage="dashboard" />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold">ข้อมูลสุขภาพของคุณ</h1>
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-secondary/50 to-background">
                <CardContent className="p-8 flex flex-col items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
                    className="p-6 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 mb-6 relative"
                  >
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      animate={{
                        boxShadow: ["0 0 0 0px rgba(250, 204, 21, 0.3)", "0 0 0 10px rgba(250, 204, 21, 0)"],
                      }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    />
                    <Activity className="h-20 w-20 text-primary" />
                  </motion.div>
                  <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    ยังไม่มีข้อมูลสุขภาพ
                  </h2>
                  <p className="text-muted-foreground text-center mb-8 max-w-md text-lg">
                    คุณยังไม่มีข้อมูลสุขภาพในระบบ เริ่มต้นบันทึกข้อมูลสุขภาพของคุณเพื่อติดตามความก้าวหน้า
                  </p>
                  <Link href="/dashboard/add-health-data">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 py-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl text-lg">
                        <PlusCircle className="mr-2 h-5 w-5" />
                        เพิ่มข้อมูลสุขภาพ
                      </Button>
                    </motion.div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden" ref={containerRef}>
      <DashboardHeader activePage="dashboard" />

      <main className="container mx-auto px-4 py-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-8">
          {/* Header Section */}
          <motion.div
            className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            variants={itemVariants}
            style={{ opacity: headerOpacity }}
          >
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="relative"
              >
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                  <Activity className="h-7 w-7 text-primary-foreground" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    boxShadow: ["0 0 0 0px rgba(250, 204, 21, 0.3)", "0 0 0 10px rgba(250, 204, 21, 0)"],
                  }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  ข้อมูลสุขภาพของคุณ
                </h1>
                <p className="text-muted-foreground">
                  อัพเดทล่าสุด: {latestData ? formatDate(latestData.date) : "ไม่มีข้อมูล"}
                </p>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={refreshData}
                variant="outline"
                className="gap-2 rounded-full border-primary/30 hover:border-primary/50 hover:bg-primary/10"
                disabled={refreshing}
              >
                <motion.div
                  animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 1, repeat: refreshing ? Number.POSITIVE_INFINITY : 0, ease: "linear" }}
                >
                  <RefreshCw className="h-4 w-4 text-primary" />
                </motion.div>
                {refreshing ? "กำลังอัพเดท..." : "รีเฟรชข้อมูล"}
              </Button>
            </motion.div>
          </motion.div>

          {/* Health Metric Cards */}
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5" variants={itemVariants}>
            <motion.div variants={cardVariants} whileHover="hover" whileTap="tap" className="group">
              <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-secondary/50 to-background h-full">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">น้ำหนัก</p>
                      <div className="flex items-baseline gap-1">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                          {latestData?.weight || 0}
                        </h2>
                        <span className="text-primary/70 text-sm">กก.</span>
                      </div>
                    </div>
                    <motion.div
                      className="bg-gradient-to-br from-primary to-primary/80 p-2.5 rounded-full shadow-md"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Scale className="h-5 w-5 text-primary-foreground" />
                    </motion.div>
                  </div>

                  {previousData && (
                    <div className="mt-4 flex items-center text-sm">
                      {weightChange < 0 ? (
                        <motion.div
                          className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10"
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <TrendingDown className="h-3.5 w-3.5 text-green-500" />
                          <span className="text-green-500 font-medium">{Math.abs(weightChange).toFixed(1)} กก.</span>
                        </motion.div>
                      ) : weightChange > 0 ? (
                        <motion.div
                          className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10"
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <TrendingUp className="h-3.5 w-3.5 text-red-500" />
                          <span className="text-red-500 font-medium">{weightChange.toFixed(1)} กก.</span>
                        </motion.div>
                      ) : (
                        <span className="text-muted-foreground text-xs px-2 py-1 rounded-full bg-muted/30">
                          ไม่มีการเปลี่ยนแปลง
                        </span>
                      )}
                      <span className="text-muted-foreground ml-1 text-xs">จากครั้งก่อน</span>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-border/30">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">ค่าเฉลี่ย</span>
                      <span className="font-medium text-primary">
                        {healthData.reduce((sum, entry) => sum + entry.weight, 0) / healthData.length || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} whileHover="hover" whileTap="tap" className="group">
              <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-secondary/50 to-background h-full">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">BMI</p>
                      <div className="flex items-baseline gap-1">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
                          {latestData?.bmi.toFixed(1) || 0}
                        </h2>
                      </div>
                    </div>
                    <motion.div
                      className="bg-gradient-to-br from-green-400 to-green-500 p-2.5 rounded-full shadow-md"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Activity className="h-5 w-5 text-primary-foreground" />
                    </motion.div>
                  </div>

                  {latestData && (
                    <motion.div
                      className="mt-2"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Badge
                        className={cn(
                          "font-normal",
                          getBmiCategory(latestData.bmi).bgColor,
                          getBmiCategory(latestData.bmi).color,
                        )}
                      >
                        {getBmiCategory(latestData.bmi).text}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-2">({latestData.height} ซม.)</span>
                    </motion.div>
                  )}

                  {previousData && (
                    <div className="mt-2 flex items-center text-sm">
                      {bmiChange < 0 ? (
                        <motion.div
                          className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10"
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <TrendingDown className="h-3.5 w-3.5 text-green-500" />
                          <span className="text-green-500 font-medium">{Math.abs(bmiChange).toFixed(1)}</span>
                        </motion.div>
                      ) : bmiChange > 0 ? (
                        <motion.div
                          className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10"
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <TrendingUp className="h-3.5 w-3.5 text-red-500" />
                          <span className="text-red-500 font-medium">{bmiChange.toFixed(1)}</span>
                        </motion.div>
                      ) : (
                        <span className="text-muted-foreground text-xs px-2 py-1 rounded-full bg-muted/30">
                          ไม่มีการเปลี่ยนแปลง
                        </span>
                      )}
                      <span className="text-muted-foreground ml-1 text-xs">จากครั้งก่อน</span>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-border/30">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">ค่าเฉลี่ย</span>
                      <span className="font-medium text-green-400">
                        {(healthData.reduce((sum, entry) => sum + entry.bmi, 0) / healthData.length || 0).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} whileHover="hover" whileTap="tap" className="group">
              <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-secondary/50 to-background h-full">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">เปอร์เซ็นต์ไขมัน</p>
                      <div className="flex items-baseline gap-1">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">
                          {latestData?.body_fat || 0}
                        </h2>
                        <span className="text-red-500/70 text-sm">%</span>
                      </div>
                    </div>
                    <motion.div
                      className="bg-gradient-to-br from-red-400 to-red-500 p-2.5 rounded-full shadow-md"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Heart className="h-5 w-5 text-primary-foreground" />
                    </motion.div>
                  </div>

                  {previousData && (
                    <div className="mt-4 flex items-center text-sm">
                      {bodyFatChange < 0 ? (
                        <motion.div
                          className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10"
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <TrendingDown className="h-3.5 w-3.5 text-green-500" />
                          <span className="text-green-500 font-medium">{Math.abs(bodyFatChange).toFixed(1)}%</span>
                        </motion.div>
                      ) : bodyFatChange > 0 ? (
                        <motion.div
                          className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10"
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <TrendingUp className="h-3.5 w-3.5 text-red-500" />
                          <span className="text-red-500 font-medium">{bodyFatChange.toFixed(1)}%</span>
                        </motion.div>
                      ) : (
                        <span className="text-muted-foreground text-xs px-2 py-1 rounded-full bg-muted/30">
                          ไม่มีการเปลี่ยนแปลง
                        </span>
                      )}
                      <span className="text-muted-foreground ml-1 text-xs">จากครั้งก่อน</span>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-border/30">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">ค่าเฉลี่ย</span>
                      <span className="font-medium text-red-400">
                        {(
                          healthData.reduce((sum, entry) => sum + (entry.body_fat || 0), 0) /
                            healthData.filter((entry) => entry.body_fat).length || 0
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} whileHover="hover" whileTap="tap" className="group">
              <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-secondary/50 to-background h-full">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">น้ำที่ดื่ม</p>
                      <div className="flex items-baseline gap-1">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                          {latestData?.water_intake || 0}
                        </h2>
                        <span className="text-blue-500/70 text-sm">มล.</span>
                      </div>
                    </div>
                    <motion.div
                      className="bg-gradient-to-br from-blue-400 to-blue-500 p-2.5 rounded-full shadow-md"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Droplets className="h-5 w-5 text-primary-foreground" />
                    </motion.div>
                  </div>

                  {previousData && (
                    <div className="mt-4 flex items-center text-sm">
                      {waterIntakeChange > 0 ? (
                        <motion.div
                          className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10"
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                          <span className="text-green-500 font-medium">+{waterIntakeChange} มล.</span>
                        </motion.div>
                      ) : waterIntakeChange < 0 ? (
                        <motion.div
                          className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10"
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                          <span className="text-red-500 font-medium">{waterIntakeChange} มล.</span>
                        </motion.div>
                      ) : (
                        <span className="text-muted-foreground text-xs px-2 py-1 rounded-full bg-muted/30">
                          ไม่มีการเปลี่ยนแปลง
                        </span>
                      )}
                      <span className="text-muted-foreground ml-1 text-xs">จากครั้งก่อน</span>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-border/30">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">ค่าเฉลี่ย</span>
                      <span className="font-medium text-blue-400">
                        {(
                          healthData.reduce((sum, entry) => sum + (entry.water_intake || 0), 0) /
                            healthData.filter((entry) => entry.water_intake).length || 0
                        ).toFixed(0)}{" "}
                        มล.
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* เป้าหมายที่กำลังดำเนินการ */}
          {activeGoals.length > 0 && (
            <motion.div variants={itemVariants} className="mt-2">
              <div className="mb-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <motion.div
                    initial={{ rotate: -10 }}
                    animate={{ rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    <Target className="h-6 w-6 text-primary" />
                  </motion.div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    เป้าหมายของฉัน
                  </h2>
                  <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/30">
                    {activeGoals.length} เป้าหมาย
                  </Badge>
                </div>
                <Link href="/dashboard/goals">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1 rounded-full border-primary/30 hover:border-primary/50 hover:bg-primary/10"
                    >
                      จัดการเป้าหมาย
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </motion.div>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {activeGoals.map((goal, index) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <GoalProgressCard goal={goal} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="mt-2">
            <Tabs defaultValue="graph" className="w-full">
              <TabsList className="mb-6 bg-gradient-to-r from-secondary/50 to-background p-1 rounded-full border border-border/30 shadow-md">
                <TabsTrigger
                  value="graph"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground rounded-full transition-all duration-300 px-5 py-2.5 gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  กราฟ
                </TabsTrigger>
                <TabsTrigger
                  value="table"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground rounded-full transition-all duration-300 px-5 py-2.5 gap-2"
                >
                  <TableProperties className="h-4 w-4" />
                  ตารางข้อมูล
                </TabsTrigger>
                <TabsTrigger
                  value="add"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground rounded-full transition-all duration-300 px-5 py-2.5 gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  เพิ่มข้อมูล
                </TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <TabsContent value="graph" className="mt-0">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <Card className="bg-[#121212] border border-border/30 shadow-lg overflow-hidden">
                          <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-xl font-medium flex items-center gap-2">
                                <Scale className="h-5 w-5 text-primary" />
                                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                  น้ำหนัก (กก.)
                                </span>
                              </h3>
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                                <Calendar className="h-3 w-3 mr-1" />
                                {healthData.length} บันทึก
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">ข้อมูลน้ำหนักย้อนหลัง</p>
                            <HealthMetricsChart
                              data={healthData}
                              dataKey="weight"
                              color="#FACC15"
                              height={chartHeight}
                            />
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <Card className="bg-[#121212] border border-border/30 shadow-lg overflow-hidden">
                          <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-xl font-medium flex items-center gap-2">
                                <Activity className="h-5 w-5 text-green-400" />
                                <span className="bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
                                  BMI
                                </span>
                              </h3>
                              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                                <Calendar className="h-3 w-3 mr-1" />
                                {healthData.length} บันทึก
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">ข้อมูล BMI ย้อนหลัง</p>
                            <HealthMetricsChart data={healthData} dataKey="bmi" color="#10B981" height={chartHeight} />
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <Card className="bg-[#121212] border border-border/30 shadow-lg overflow-hidden">
                          <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-xl font-medium flex items-center gap-2">
                                <Heart className="h-5 w-5 text-red-400" />
                                <span className="bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">
                                  เปอร์เซ็นต์ไขมัน (%)
                                </span>
                              </h3>
                              <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">
                                <Calendar className="h-3 w-3 mr-1" />
                                {healthData.filter((d) => d.body_fat).length} บันทึก
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">ข้อมูลเปอร์เซ็นต์ไขมันย้อนหลัง</p>
                            <HealthMetricsChart
                              data={healthData}
                              dataKey="body_fat"
                              color="#F43F5E"
                              height={chartHeight}
                            />
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <Card className="bg-[#121212] border border-border/30 shadow-lg overflow-hidden">
                          <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-xl font-medium flex items-center gap-2">
                                <Droplets className="h-5 w-5 text-blue-400" />
                                <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                                  น้ำที่ดื่ม (มล.)
                                </span>
                              </h3>
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">
                                <Calendar className="h-3 w-3 mr-1" />
                                {healthData.filter((d) => d.water_intake).length} บันทึก
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">ข้อมูลการดื่มน้ำย้อนหลัง</p>
                            <HealthMetricsChart
                              data={healthData}
                              dataKey="water_intake"
                              color="#3B82F6"
                              height={chartHeight}
                            />
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                  </motion.div>
                </TabsContent>

                <TabsContent value="table">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border border-border/30 bg-gradient-to-br from-secondary/50 to-background shadow-lg overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-5">
                          <h3 className="text-xl font-medium flex items-center gap-2">
                            <TableProperties className="h-5 w-5 text-primary" />
                            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                              ตารางข้อมูลสุขภาพ
                            </span>
                          </h3>
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                            <Calendar className="h-3 w-3 mr-1" />
                            {healthData.length} บันทึก
                          </Badge>
                        </div>
                        <div className="overflow-x-auto rounded-lg border border-border/30">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-secondary/50">
                                <th className="text-left py-3 px-4 font-medium text-foreground/80">วันที่</th>
                                <th className="text-right py-3 px-4 font-medium text-foreground/80">น้ำหนัก (กก.)</th>
                                <th className="text-right py-3 px-4 font-medium text-foreground/80">BMI</th>
                                <th className="text-right py-3 px-4 font-medium text-foreground/80">ไขมัน (%)</th>
                                <th className="text-right py-3 px-4 font-medium text-foreground/80">น้ำที่ดื่ม (มล.)</th>
                                <th className="text-right py-3 px-4 font-medium text-foreground/80">รายละเอียด</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[...healthData]
                                .reverse()
                                .slice(0, 6)
                                .map((entry, index) => (
                                  <motion.tr
                                    key={index}
                                    className="border-b border-border/30 hover:bg-secondary/30 transition-colors"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                  >
                                    <td className="py-3 px-4 font-medium">{formatDate(entry.date)}</td>
                                    <td className="text-right py-3 px-4 text-primary">{entry.weight}</td>
                                    <td className="text-right py-3 px-4 text-green-400">{entry.bmi.toFixed(1)}</td>
                                    <td className="text-right py-3 px-4 text-red-400">{entry.body_fat || "-"}%</td>
                                    <td className="text-right py-3 px-4 text-blue-400">{entry.water_intake || "-"}</td>
                                    <td className="text-right py-3 px-4">
                                      <Link href={`/dashboard/health-detail/${entry.id}`}>
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-xs h-7 rounded-full border-primary/30 hover:border-primary/50 hover:bg-primary/10 gap-1"
                                          >
                                            ดูรายละเอียด
                                            <ChevronRight className="h-3 w-3" />
                                          </Button>
                                        </motion.div>
                                      </Link>
                                    </td>
                                  </motion.tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                        {healthData.length > 6 && (
                          <div className="mt-5 text-center">
                            <Link href="/dashboard/health-history">
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  variant="outline"
                                  className="rounded-full border-primary/30 hover:border-primary/50 hover:bg-primary/10 gap-2"
                                >
                                  ดูข้อมูลทั้งหมด
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            </Link>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="add">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border border-border/30 bg-gradient-to-br from-secondary/50 to-background shadow-lg overflow-hidden">
                      <CardContent className="p-8 flex flex-col items-center justify-center">
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.5, type: "spring" }}
                          className="p-5 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 mb-6 relative"
                        >
                          <motion.div
                            className="absolute inset-0 rounded-full"
                            animate={{
                              boxShadow: ["0 0 0 0px rgba(250, 204, 21, 0.3)", "0 0 0 10px rgba(250, 204, 21, 0)"],
                            }}
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                          />
                          <Sparkles className="h-16 w-16 text-primary" />
                        </motion.div>
                        <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                          เพิ่มข้อมูลสุขภาพใหม่
                        </h3>
                        <p className="text-muted-foreground text-center mb-6 max-w-md">
                          บันทึกข้อมูลสุขภาพของคุณเพื่อติดตามความก้าวหน้าและบรรลุเป้าหมายสุขภาพของคุณ
                        </p>
                        <Link href="/dashboard/add-health-data">
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 py-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl text-lg gap-2">
                              <PlusCircle className="h-5 w-5" />
                              เพิ่มข้อมูลสุขภาพ
                            </Button>
                          </motion.div>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
