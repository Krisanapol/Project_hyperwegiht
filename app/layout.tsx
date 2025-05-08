import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import ClientLayout from "./client-layout"
import "../styles/animations.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "HyperWeight - ทำให้การออกกำลังกายง่ายขึ้น",
  description: "แพลตฟอร์มออกกำลังกายที่ช่วยให้คุณบรรลุเป้าหมายสุขภาพได้ง่ายขึ้น",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
