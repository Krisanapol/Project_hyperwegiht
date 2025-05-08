"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronRight, Activity, Dumbbell, Salad, Heart } from "lucide-react"
import { useEffect, useState } from "react"
import "../styles/animations.css"

export default function Home() {
  const { user, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Background patterns and effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-yellow-400/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
        <div
          className="absolute bottom-20 right-1/4 w-96 h-96 bg-yellow-400/10 rounded-full filter blur-3xl animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <Header />

      <main className="container mx-auto px-4 py-16 relative z-10">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-8">
            <div
              className={`space-y-6 ${mounted ? "animate-fade-in" : "opacity-0"}`}
              style={{ animationDelay: "0.2s" }}
            >
              <div className="inline-block px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-sm font-medium mb-4">
                เริ่มต้นการเดินทางสู่สุขภาพที่ดีกว่า
              </div>
              <h1 className="text-5xl font-bold leading-tight">
                We <span className="gradient-text">make</span> exercise
                <br />
                <span className="text-6xl">
                  easy at <span className="gradient-text">Hyperweight</span>.
                </span>
              </h1>
              <p className="text-muted-foreground max-w-lg text-lg">
                เราช่วยให้คุณออกกำลังกายได้อย่างมีประสิทธิภาพมากขึ้นด้วยโปรแกรมการออกกำลังกายที่ปรับให้เหมาะกับคุณ การติดตามความคืบหน้า
                และเครื่องมือต่างๆ เพื่อให้คุณบรรลุเป้าหมายด้านสุขภาพด้วยความพยายามที่น้อยลงและผลลัพธ์ที่ดีขึ้น
              </p>
            </div>

            <div className={`${mounted ? "animate-fade-in" : "opacity-0"}`} style={{ animationDelay: "0.4s" }}>
              {isLoading ? (
                <Button disabled className="px-8 py-6 bg-yellow-400 rounded-md text-black font-medium text-lg">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  กำลังโหลด...
                </Button>
              ) : user ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-8 py-4 bg-yellow-400 rounded-md text-black font-medium text-lg hover:bg-yellow-500 transition-colors hover-lift"
                >
                  ไปที่แดชบอร์ด
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/signin"
                    className="inline-flex items-center justify-center px-8 py-4 bg-yellow-400 rounded-md text-black font-medium text-lg hover:bg-yellow-500 transition-colors hover-lift"
                  >
                    เริ่มต้นใช้งาน
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-8 py-4 border border-yellow-400/50 bg-yellow-400/10 rounded-md text-yellow-400 font-medium text-lg hover:bg-yellow-400/20 transition-colors"
                  >
                    สมัครฟรี
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className={`relative ${mounted ? "animate-fade-in" : "opacity-0"}`} style={{ animationDelay: "0.8s" }}>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-yellow-500/5 rounded-full blur-3xl -z-10"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden h-64 relative bg-secondary border border-yellow-400/20 hover-lift card-3d">
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-yellow-400 card-3d-inner p-6">
                    <Dumbbell className="h-12 w-12 mb-4 animate-float" />
                    <h3 className="text-lg font-medium text-center">แผนการออกกำลังกายเฉพาะบุคคล</h3>
                    <p className="text-sm text-center text-muted-foreground mt-2">
                      ปรับให้เหมาะกับระดับความฟิตและเป้าหมายของคุณ
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden h-48 relative bg-secondary border border-yellow-400/20 hover-lift card-3d">
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-yellow-400 card-3d-inner p-6">
                    <Salad className="h-10 w-10 mb-3 animate-float" style={{ animationDelay: "0.5s" }} />
                    <h3 className="text-lg font-medium text-center">ติดตามโภชนาการ</h3>
                    <p className="text-sm text-center text-muted-foreground mt-2">ติดตามอาหารของคุณได้อย่างง่ายดาย</p>
                  </div>
                </div>
              </div>
              <div className="mt-12">
                <div className="rounded-2xl overflow-hidden h-80 relative bg-secondary border border-yellow-400/20 hover-lift card-3d">
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-yellow-400 card-3d-inner p-6">
                    <Activity className="h-12 w-12 mb-4 animate-float" style={{ animationDelay: "1s" }} />
                    <h3 className="text-lg font-medium text-center">วิเคราะห์ความคืบหน้า</h3>
                    <p className="text-sm text-center text-muted-foreground mt-2">
                      ติดตามความก้าวหน้าของคุณด้วยข้อมูลและการแสดงผลที่ละเอียด
                    </p>
                    <div className="mt-6 w-full bg-background/50 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 w-3/4 animate-shimmer"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className={`mt-24 ${mounted ? "animate-fade-in" : "opacity-0"}`} style={{ animationDelay: "1s" }}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              ทำไมต้องเลือก <span className="gradient-text">Hyperweight</span>?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              แพลตฟอร์มของเรารวมเทคโนโลยีล้ำสมัยเข้ากับวิธีการออกกำลังกายที่พิสูจน์แล้วเพื่อมอบผลลัพธ์ที่ดีที่สุด
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-secondary p-6 rounded-xl border border-border hover-lift">
              <div className="w-12 h-12 rounded-full bg-yellow-400/20 flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-medium mb-2">ติดตามสุขภาพ</h3>
              <p className="text-muted-foreground">ติดตามข้อมูลสุขภาพที่สำคัญและรับคำแนะนำเฉพาะบุคคลตามความคืบหน้าของคุณ</p>
            </div>

            <div className="bg-secondary p-6 rounded-xl border border-border hover-lift">
              <div className="w-12 h-12 rounded-full bg-yellow-400/20 flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-medium mb-2">โค้ชที่ขับเคลื่อนด้วย AI</h3>
              <p className="text-muted-foreground">
                รับข้อเสนอแนะและการปรับเปลี่ยนแบบเรียลไทม์เพื่อเพิ่มประสิทธิภาพการออกกำลังกายของคุณ
              </p>
            </div>

            <div className="bg-secondary p-6 rounded-xl border border-border hover-lift">
              <div className="w-12 h-12 rounded-full bg-yellow-400/20 flex items-center justify-center mb-4">
                <Dumbbell className="h-6 w-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-medium mb-2">การสนับสนุนจากชุมชน</h3>
              <p className="text-muted-foreground">เข้าร่วมชุมชนของผู้ที่มีความคิดเหมือนกันบนเส้นทางสู่สุขภาพที่ดีขึ้น</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
