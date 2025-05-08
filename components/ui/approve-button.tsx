"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ApproveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string
  onApprove?: () => Promise<void> | void
  className?: string
  iconClassName?: string
}

export function ApproveButton({
  text = "อนุมัติหมายเหตุกำกับตำแหน่ง",
  onApprove,
  className,
  iconClassName,
  ...props
}: ApproveButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleClick = async () => {
    if (isLoading || isSuccess) return

    setIsLoading(true)
    try {
      if (onApprove) {
        await onApprove()
      }
      setIsSuccess(true)
      // Reset success state after 2 seconds
      setTimeout(() => {
        setIsSuccess(false)
      }, 2000)
    } catch (error) {
      console.error("Error during approval:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.button
      onClick={handleClick}
      className={cn(
        "flex items-center gap-3 px-4 py-2 rounded-md bg-black text-white font-medium transition-all",
        "hover:bg-black/90 active:scale-95 disabled:opacity-70 disabled:pointer-events-none",
        isSuccess ? "bg-green-600 hover:bg-green-700" : "",
        className,
      )}
      whileTap={{ scale: 0.98 }}
      disabled={isLoading || isSuccess}
      {...props}
    >
      <div
        className={cn(
          "w-5 h-5 rounded-full flex items-center justify-center",
          isSuccess ? "bg-green-400" : "bg-primary",
          iconClassName,
        )}
      >
        {isLoading ? (
          <Loader2 className="w-3 h-3 text-black animate-spin" />
        ) : isSuccess ? (
          <Check className="w-3 h-3 text-black" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-black/20"></span>
        )}
      </div>
      <span>{isSuccess ? "อนุมัติเรียบร้อยแล้ว" : text}</span>
    </motion.button>
  )
}
