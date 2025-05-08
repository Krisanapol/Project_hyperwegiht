"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { getUserHealthData, type HealthDataEntry } from "@/lib/health-data"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function HealthHistory() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [healthData, setHealthData] = useState<HealthDataEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchHealthData() {
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
    }

    fetchHealthData()
  }, [user, toast])

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader activePage="dashboard" />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6 max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">ประวัติข้อมูลสุขภาพ</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลสุขภาพทั้งหมด</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
                </div>
              ) : healthData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">ยังไม่มีข้อมูลสุขภาพ</p>
                  <Link href="/dashboard/add-health-data">
                    <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">เพิ่มข้อมูลสุขภาพ</Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4">วันที่</th>
                        <th className="text-right py-3 px-4">น้ำหนัก (กก.)</th>
                        <th className="text-right py-3 px-4">ส่วนสูง (ซม.)</th>
                        <th className="text-right py-3 px-4">BMI</th>
                        <th className="text-right py-3 px-4">ไขมัน (%)</th>
                        <th className="text-right py-3 px-4">น้ำที่ดื่ม (มล.)</th>
                        <th className="text-right py-3 px-4">รายละเอียด</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...healthData]
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((entry) => (
                          <tr key={entry.id} className="border-b border-border">
                            <td className="py-3 px-4">{formatDate(entry.date)}</td>
                            <td className="text-right py-3 px-4">{entry.weight}</td>
                            <td className="text-right py-3 px-4">{entry.height}</td>
                            <td className="text-right py-3 px-4">{entry.bmi.toFixed(1)}</td>
                            <td className="text-right py-3 px-4">{entry.body_fat || "-"}%</td>
                            <td className="text-right py-3 px-4">{entry.water_intake || "-"}</td>
                            <td className="text-right py-3 px-4">
                              <Link href={`/dashboard/health-detail/${entry.id}`}>
                                <Button size="sm" variant="outline" className="text-xs h-7">
                                  ดูรายละเอียด
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
