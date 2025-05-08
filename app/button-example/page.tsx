"use client"

import { useState } from "react"
import { ApproveButton } from "@/components/ui/approve-button"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

export default function ButtonExamplePage() {
  const [approvalCount, setApprovalCount] = useState(0)

  const handleApprove = async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Increment approval count
    setApprovalCount((prev) => prev + 1)

    // Show toast notification
    toast({
      title: "อนุมัติสำเร็จ",
      description: `อนุมัติหมายเหตุกำกับตำแหน่งเรียบร้อยแล้ว (ครั้งที่ ${approvalCount + 1})`,
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <Card className="border-none shadow-lg bg-gradient-to-br from-background to-secondary/10">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/20 pb-4">
            <CardTitle>ตัวอย่างปุ่มอนุมัติ</CardTitle>
            <CardDescription>ตัวอย่างการใช้งานปุ่มอนุมัติหมายเหตุกำกับตำแหน่ง</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-medium">ปุ่มอนุมัติพื้นฐาน</h3>
              <div className="flex flex-wrap gap-4">
                <ApproveButton onApprove={handleApprove} />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-medium">ปุ่มอนุมัติแบบกำหนดข้อความเอง</h3>
              <div className="flex flex-wrap gap-4">
                <ApproveButton text="อนุมัติคำขอ" onApprove={handleApprove} />
                <ApproveButton text="ยืนยันการทำรายการ" onApprove={handleApprove} />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-medium">ปุ่มอนุมัติแบบกำหนดสไตล์เอง</h3>
              <div className="flex flex-wrap gap-4">
                <ApproveButton
                  text="อนุมัติแบบมีขอบ"
                  onApprove={handleApprove}
                  className="bg-transparent text-black border-2 border-primary hover:bg-primary/10"
                />
                <ApproveButton
                  text="อนุมัติแบบมีเงา"
                  onApprove={handleApprove}
                  className="shadow-lg shadow-primary/20 hover:shadow-primary/30"
                />
              </div>
            </div>

            <div className="p-4 bg-secondary/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                จำนวนการอนุมัติทั้งหมด: <span className="font-medium text-primary">{approvalCount}</span> ครั้ง
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
