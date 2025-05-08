import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "กรุณากรอกอีเมลและรหัสผ่าน" }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // ทดลองเข้าสู่ระบบด้วยรหัสผ่านที่ให้มา
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error verifying password:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการตรวจสอบรหัสผ่าน" }, { status: 500 })
  }
}
