"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import Chart from "chart.js/auto"
import type { HealthDataEntry } from "@/lib/health-data"
import { motion } from "framer-motion"

interface HealthMetricsChartProps {
  data: HealthDataEntry[]
  dataKey: keyof HealthDataEntry | string
  color: string
  height?: number
}

export function HealthMetricsChart({ data, dataKey, color, height = 250 }: HealthMetricsChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark" || true // Force dark theme for this chart

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Format dates for display
    const labels = data.map((item) => {
      const date = new Date(item.date)
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear().toString().substr(2, 2)}`
    })

    // Filter out entries with null or undefined values for the current dataKey
    const filteredData = data.filter((item) => {
      const value = item[dataKey as keyof typeof item]
      return value !== null && value !== undefined && value !== 0
    })

    // Get values for the chart
    const values = filteredData.map((item) => item[dataKey as keyof typeof item] as number)

    // Create gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, `${color}60`) // More opaque at top
    gradient.addColorStop(1, `${color}10`) // More transparent at bottom

    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: filteredData.map((item) => {
          const date = new Date(item.date)
          return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear().toString().substr(2, 2)}`
        }),
        datasets: [
          {
            label: dataKey as string,
            data: values,
            borderColor: color,
            backgroundColor: gradient,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: color,
            pointBorderColor: "#000",
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: color,
            pointHoverBorderWidth: 3,
            borderWidth: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animations: {
          tension: {
            duration: 1000,
            easing: "linear",
            from: 0.4,
            to: 0.3,
            loop: true,
          },
        },
        scales: {
          x: {
            grid: {
              color: "rgba(255, 255, 255, 0.05)",
              drawBorder: false,
            },
            ticks: {
              color: "rgba(255, 255, 255, 0.7)",
              font: {
                size: 10,
              },
              padding: 10,
              maxRotation: 45,
              minRotation: 45,
              autoSkip: true,
              autoSkipPadding: 20,
              maxTicksLimit: 8,
            },
          },
          y: {
            grid: {
              color: "rgba(255, 255, 255, 0.05)",
              drawBorder: false,
            },
            ticks: {
              color: "rgba(255, 255, 255, 0.7)",
              font: {
                size: 10,
              },
              padding: 10,
            },
            beginAtZero: false,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleColor: "rgba(255, 255, 255, 0.9)",
            bodyColor: "rgba(255, 255, 255, 0.9)",
            borderColor: "rgba(255, 255, 255, 0.2)",
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              title: (tooltipItems) => tooltipItems[0].label,
              label: (context) => {
                let label = context.dataset.label || ""
                if (label) {
                  label += ": "
                }
                if (context.parsed.y !== null) {
                  label += context.parsed.y
                }
                return label
              },
            },
          },
        },
        interaction: {
          mode: "index",
          intersect: false,
        },
        elements: {
          line: {
            borderWidth: 3,
          },
        },
        layout: {
          padding: {
            top: 5,
            right: 10,
            bottom: 5,
            left: 10,
          },
        },
        backgroundColor: "#121212", // เพิ่มสีพื้นหลังเข้มให้กับกราฟ
      },
    })

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, dataKey, color, isDark, height])

  // Check if there's valid data for this metric
  const hasValidData = data.some((item) => {
    const value = item[dataKey as keyof typeof item]
    return value !== null && value !== undefined && value !== 0
  })

  if (!hasValidData) {
    return (
      <div
        className="w-full flex items-center justify-center bg-[#121212] rounded-lg border border-border/30"
        style={{ height: `${height}px` }}
      >
        <motion.p
          className="text-muted-foreground"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          ไม่มีข้อมูลเพียงพอสำหรับแสดงกราฟ
        </motion.p>
      </div>
    )
  }

  return (
    <motion.div
      className="w-full relative bg-[#121212] rounded-lg border border-border/30 overflow-hidden"
      style={{ height: `${height}px` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <canvas ref={chartRef} />
    </motion.div>
  )
}
