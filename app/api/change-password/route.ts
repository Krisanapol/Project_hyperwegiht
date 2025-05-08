import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: "กรุณากรอกรหัสผ่านใหม่" }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // ตรวจสอบว่ามีเซสชันหรือไม่
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "ไม่พบเซสชัน กรุณาเข้าสู่ระบบใหม่" }, { status: 401 })
    }

    // เปลี่ยนรหัสผ่าน
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน" }, { status: 500 })
  }
}
