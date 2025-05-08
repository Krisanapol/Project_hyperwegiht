"use client"

import { ArrowDown, ArrowUp, Droplets, Heart, Ruler, Weight } from "lucide-react"

interface HealthMetricCardsProps {
  data: any
}

export function HealthMetricCards({ data }: HealthMetricCardsProps) {
  // BMI categories
  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "น้ำหนักน้อย", color: "text-blue-500" }
    if (bmi < 25) return { label: "น้ำหนักปกติ", color: "text-green-500" }
    if (bmi < 30) return { label: "น้ำหนักเกิน", color: "text-yellow-500" }
    return { label: "อ้วน", color: "text-red-500" }
  }

  const bmiCategory = getBmiCategory(data.bmi)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="bg-secondary rounded-lg p-4 border border-border">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">น้ำหนัก</p>
            <h3 className="text-2xl font-bold mt-1">{data.weight} กก.</h3>
          </div>
          <div className="bg-yellow-400/20 p-2 rounded-full">
            <Weight className="h-4 w-4 text-yellow-400" />
          </div>
        </div>
        <div className="mt-3 flex items-center text-xs">
          <ArrowDown className="h-3 w-3 text-green-500 mr-1" />
          <span className="text-green-500 font-medium">-0.5 กก.</span>
          <span className="text-muted-foreground ml-1">จากเดือนที่แล้ว</span>
        </div>
      </div>

      <div className="bg-secondary rounded-lg p-4 border border-border">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">BMI</p>
            <h3 className="text-2xl font-bold mt-1">{data.bmi}</h3>
          </div>
          <div className="bg-green-400/20 p-2 rounded-full">
            <Ruler className="h-4 w-4 text-green-400" />
          </div>
        </div>
        <div className="mt-3 flex items-center text-xs">
          <span className={`font-medium ${bmiCategory.color}`}>{bmiCategory.label}</span>
          <span className="text-muted-foreground ml-1">({data.height} ซม.)</span>
        </div>
      </div>

      <div className="bg-secondary rounded-lg p-4 border border-border">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">เปอร์เซ็นต์ไขมัน</p>
            <h3 className="text-2xl font-bold mt-1">{data.bodyFat}%</h3>
          </div>
          <div className="bg-red-400/20 p-2 rounded-full">
            <Heart className="h-4 w-4 text-red-400" />
          </div>
        </div>
        <div className="mt-3 flex items-center text-xs">
          <ArrowDown className="h-3 w-3 text-green-500 mr-1" />
          <span className="text-green-500 font-medium">-0.5%</span>
          <span className="text-muted-foreground ml-1">จากเดือนที่แล้ว</span>
        </div>
      </div>

      <div className="bg-secondary rounded-lg p-4 border border-border">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">น้ำที่ดื่ม</p>
            <h3 className="text-2xl font-bold mt-1">{data.waterIntake} มล.</h3>
          </div>
          <div className="bg-blue-400/20 p-2 rounded-full">
            <Droplets className="h-4 w-4 text-blue-400" />
          </div>
        </div>
        <div className="mt-3 flex items-center text-xs">
          <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
          <span className="text-green-500 font-medium">+100 มล.</span>
          <span className="text-muted-foreground ml-1">จากเดือนที่แล้ว</span>
        </div>
      </div>
    </div>
  )
}
