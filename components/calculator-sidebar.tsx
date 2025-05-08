"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Scale, Flame, Activity, Percent, Droplets, Dumbbell } from "lucide-react"
import { useState, useEffect } from "react"

interface CalculatorSidebarProps {
  activePage: string
}

export function CalculatorSidebar({ activePage }: CalculatorSidebarProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const menuItems = [
    {
      href: "/calculator/bmi",
      label: "BMI",
      icon: <Scale className="w-5 h-5" />,
      id: "bmi",
    },
    {
      href: "/calculator/bmr",
      label: "BMR",
      icon: <Flame className="w-5 h-5" />,
      id: "bmr",
    },
    {
      href: "/calculator/tdee",
      label: "TDEE",
      icon: <Activity className="w-5 h-5" />,
      id: "tdee",
    },
    {
      href: "/calculator/bodyfat",
      label: "เปอร์เซ็นต์ไขมัน",
      icon: <Percent className="w-5 h-5" />,
      id: "bodyfat",
    },
    {
      href: "/calculator/water",
      label: "คำนวณการดื่มน้ำต่อวัน",
      icon: <Droplets className="w-5 h-5" />,
      id: "water",
    },
    {
      href: "/calculator/calories",
      label: "คำนวณแคลลอรี่ออกกำลังกาย",
      icon: <Dumbbell className="w-5 h-5" />,
      id: "calories",
    },
  ]

  return (
    <div className="w-full md:w-64 shrink-0 bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-lg p-4 shadow-lg">
      <h2 className="text-xl font-medium mb-6 text-center relative">
        <span className="relative z-10">Menu</span>
        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-yellow-400 rounded-full"></span>
      </h2>
      <div className="space-y-2">
        {menuItems.map((item) => {
          const isActive = activePage === item.id || pathname === item.href
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`
                group flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ease-in-out
                ${
                  isActive
                    ? "bg-yellow-400/20 text-yellow-400 font-medium translate-x-1"
                    : "hover:bg-yellow-400/10 hover:text-yellow-400 hover:translate-x-1"
                }
              `}
            >
              <span
                className={`
                flex items-center justify-center p-2 rounded-full transition-all duration-300
                ${
                  isActive
                    ? "bg-yellow-400/30 text-yellow-400"
                    : "bg-gray-200/30 dark:bg-gray-700/30 group-hover:bg-yellow-400/20 group-hover:text-yellow-400"
                }
              `}
              >
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {isActive && <span className="w-1.5 h-6 bg-yellow-400 rounded-full animate-pulse"></span>}
            </Link>
          )
        })}
      </div>

      {/* Decorative elements */}
      <div className="mt-8 pt-6 border-t border-gray-200/30 dark:border-gray-700/30">
        <div className="flex justify-center">
          <div className="w-8 h-8 rounded-full bg-yellow-400/20 animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
