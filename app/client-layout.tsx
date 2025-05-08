"use client"

import type React from "react"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"
import { LanguageProvider } from "@/contexts/language-context"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <LanguageProvider>
        {children}
        <Toaster />
      </LanguageProvider>
    </AuthProvider>
  )
}
