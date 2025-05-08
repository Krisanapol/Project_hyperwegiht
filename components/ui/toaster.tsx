"use client"

import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { motion } from "framer-motion"

export function Toaster() {
  const { toasts } = useToast()

  // Function to determine which icon to show based on variant
  const getToastIcon = (variant: string | undefined) => {
    switch (variant) {
      case "destructive":
        return <AlertCircle className="h-5 w-5 text-destructive" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
      default:
        return null
    }
  }

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => {
        const icon = getToastIcon(props.variant)

        return (
          <Toast key={id} {...props}>
            <div className="flex items-start gap-3">
              {icon && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  className="flex-shrink-0 mt-0.5"
                >
                  {icon}
                </motion.div>
              )}
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
