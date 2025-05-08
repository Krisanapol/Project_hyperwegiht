import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// เพิ่มฟังก์ชันสำหรับสร้าง class ที่มี !important
export function cnImportant(...inputs: ClassValue[]) {
  const classes = cn(...inputs)
  return classes
    .split(" ")
    .map((cls) => `${cls}!important`)
    .join(" ")
}

// ฟังก์ชันสำหรับสร้าง padding class ที่ปลอดภัย
export function safePadding(value: number | string) {
  // ตรวจสอบว่า value เป็นตัวเลขหรือไม่
  if (typeof value === "number" || !isNaN(Number(value))) {
    return `p-${value}`
  }
  // ถ้าเป็น string ที่มีรูปแบบเฉพาะ เช่น "x-4" หรือ "y-6"
  if (typeof value === "string") {
    const [direction, size] = value.split("-")
    if (direction && size && !isNaN(Number(size))) {
      return `p${direction}-${size}`
    }
  }
  // ถ้าไม่ตรงกับรูปแบบใดๆ ให้ใช้ค่าเริ่มต้น
  return "p-4"
}

// ฟังก์ชันสำหรับคำนวณวันที่เหลือจนถึงวันเป้าหมาย
export function calculateRemainingDays(targetDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const target = new Date(targetDate)
  target.setHours(0, 0, 0, 0)

  const diffTime = target.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return Math.max(diffDays, 0)
}
