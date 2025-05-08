"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Check, AlertCircle, Flame } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface HealthDataTableProps {
  data: any[]
}

export function HealthDataTable({ data }: HealthDataTableProps) {
  // Sort data by date in descending order (newest first)
  const sortedData = [...data].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  // ฟังก์ชันสำหรับแสดงสถานะแคลอรี่
  const getCalorieStatusBadge = (status: string) => {
    switch (status) {
      case "เหมาะสม":
        return (
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-500 border-green-500/20 flex items-center gap-1"
          >
            <Check className="h-3 w-3" /> เหมาะสม
          </Badge>
        )
      case "ต่ำกว่าเป้าหมาย":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> ต่ำกว่าเป้าหมาย
          </Badge>
        )
      case "เกินเป้าหมาย":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> เกินเป้าหมาย
          </Badge>
        )
      default:
        return null
    }
  }

  // ฟังก์ชันสำหรับแสดงสถานะการออกกำลังกาย
  const getExerciseStatusBadge = (status: string) => {
    switch (status) {
      case "ดี":
        return (
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-500 border-green-500/20 flex items-center gap-1"
          >
            <Check className="h-3 w-3" /> ดี
          </Badge>
        )
      case "พอใช้":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-400/10 text-yellow-400 border-yellow-400/20 flex items-center gap-1"
          >
            <AlertCircle className="h-3 w-3" /> พอใช้
          </Badge>
        )
      case "น้อยเกินไป":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> น้อยเกินไป
          </Badge>
        )
      case "มากเกินไป":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> มากเกินไป
          </Badge>
        )
      default:
        return null
    }
  }

  // ฟังก์ชันสำหรับแสดงสถานะรวมของวัน
  const getDayOverallStatusBadge = (status: string) => {
    switch (status) {
      case "ดีเยี่ยม":
        return (
          <Badge className="bg-green-500 text-white flex items-center gap-1">
            <Check className="h-3 w-3" /> ดีเยี่ยม
          </Badge>
        )
      case "ดี":
        return (
          <Badge className="bg-green-500 text-white flex items-center gap-1">
            <Check className="h-3 w-3" /> ดี
          </Badge>
        )
      case "พอใช้":
        return (
          <Badge className="bg-yellow-400 text-white flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> พอใช้
          </Badge>
        )
      case "ควรปรับปรุง":
        return (
          <Badge className="bg-red-500 text-white flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> ควรปรับปรุง
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>วันที่</TableHead>
            <TableHead className="text-right">น้ำหนัก (กก.)</TableHead>
            <TableHead className="text-right">BMI</TableHead>
            <TableHead className="text-right">อาหาร (kcal)</TableHead>
            <TableHead className="text-right">ออกกำลังกาย (kcal)</TableHead>
            <TableHead className="text-right">สุทธิ (kcal)</TableHead>
            <TableHead>สถานะ</TableHead>
            <TableHead>รายละเอียด</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((entry, index) => {
            // Format date for display
            const date = new Date(entry.date)
            const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`

            return (
              <TableRow key={index}>
                <TableCell>{formattedDate}</TableCell>
                <TableCell className="text-right">{entry.weight}</TableCell>
                <TableCell className="text-right">{entry.bmi}</TableCell>
                <TableCell className="text-right">{entry.totalFoodCalories || "-"}</TableCell>
                <TableCell className="text-right">
                  {entry.totalExerciseCalories ? (
                    <span className="flex items-center justify-end gap-1">
                      <Flame className="h-3 w-3 text-green-500" />
                      {entry.totalExerciseCalories}
                    </span>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="text-right">{entry.netCalories || "-"}</TableCell>
                <TableCell>{entry.dayOverallStatus ? getDayOverallStatusBadge(entry.dayOverallStatus) : "-"}</TableCell>
                <TableCell>
                  {entry.totalFoodCalories || entry.totalExerciseCalories ? (
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/health-detail/${entry.date}`}>ดูรายละเอียด</Link>
                    </Button>
                  ) : (
                    "-"
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
