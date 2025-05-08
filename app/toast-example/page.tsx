"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

export default function ToastExamplePage() {
  const { toast } = useToast()

  const showDefaultToast = () => {
    toast({
      title: "แจ้งเตือน",
      description: "นี่คือข้อความแจ้งเตือนทั่วไป",
    })
  }

  const showSuccessToast = () => {
    toast({
      variant: "success",
      title: "สำเร็จ!",
      description: "การดำเนินการเสร็จสมบูรณ์",
    })
  }

  const showErrorToast = () => {
    toast({
      variant: "destructive",
      title: "เกิดข้อผิดพลาด",
      description: "ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง",
    })
  }

  const showWarningToast = () => {
    toast({
      variant: "warning",
      title: "คำเตือน",
      description: "กรุณาตรวจสอบข้อมูลของคุณอีกครั้ง",
    })
  }

  const showInfoToast = () => {
    toast({
      variant: "info",
      title: "ข้อมูล",
      description: "มีการอัปเดตใหม่พร้อมใช้งาน",
    })
  }

  const showToastWithAction = () => {
    toast({
      title: "มีการแจ้งเตือนใหม่",
      description: "คุณได้รับข้อความใหม่",
      action: (
        <Button variant="outline" size="sm" onClick={() => console.log("Action clicked")}>
          ดูข้อความ
        </Button>
      ),
    })
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
        stiffness: 300,
        damping: 24,
      },
    },
  }

  return (
    <div className="container mx-auto py-10">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold mb-2">ตัวอย่าง Toast Notification</h1>
          <p className="text-muted-foreground mb-6">คลิกที่ปุ่มด้านล่างเพื่อดูตัวอย่างการแจ้งเตือนแบบต่างๆ</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>ประเภทของการแจ้งเตือน</CardTitle>
              <CardDescription>เลือกรูปแบบการแจ้งเตือนที่คุณต้องการทดสอบ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button onClick={showDefaultToast} variant="outline" className="h-20 flex flex-col gap-1">
                  <span className="font-semibold">แจ้งเตือนทั่วไป</span>
                  <span className="text-xs text-muted-foreground">การแจ้งเตือนพื้นฐาน</span>
                </Button>

                <Button
                  onClick={showSuccessToast}
                  variant="outline"
                  className="h-20 flex flex-col gap-1 border-green-500/30 hover:border-green-500/50 hover:bg-green-500/10"
                >
                  <span className="font-semibold text-green-600">แจ้งเตือนสำเร็จ</span>
                  <span className="text-xs text-muted-foreground">แสดงเมื่อดำเนินการสำเร็จ</span>
                </Button>

                <Button
                  onClick={showErrorToast}
                  variant="outline"
                  className="h-20 flex flex-col gap-1 border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10"
                >
                  <span className="font-semibold text-red-600">แจ้งเตือนข้อผิดพลาด</span>
                  <span className="text-xs text-muted-foreground">แสดงเมื่อเกิดข้อผิดพลาด</span>
                </Button>

                <Button
                  onClick={showWarningToast}
                  variant="outline"
                  className="h-20 flex flex-col gap-1 border-yellow-500/30 hover:border-yellow-500/50 hover:bg-yellow-500/10"
                >
                  <span className="font-semibold text-yellow-600">แจ้งเตือนคำเตือน</span>
                  <span className="text-xs text-muted-foreground">แสดงเมื่อต้องการเตือนผู้ใช้</span>
                </Button>

                <Button
                  onClick={showInfoToast}
                  variant="outline"
                  className="h-20 flex flex-col gap-1 border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/10"
                >
                  <span className="font-semibold text-blue-600">แจ้งเตือนข้อมูล</span>
                  <span className="text-xs text-muted-foreground">แสดงข้อมูลทั่วไป</span>
                </Button>

                <Button onClick={showToastWithAction} variant="outline" className="h-20 flex flex-col gap-1">
                  <span className="font-semibold">แจ้งเตือนพร้อมการกระทำ</span>
                  <span className="text-xs text-muted-foreground">มีปุ่มให้คลิกเพิ่มเติม</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
