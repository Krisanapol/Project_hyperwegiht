import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// แก้ไขฟังก์ชัน POST เพื่อรองรับกรณีที่ไม่พบข้อมูลโปรไฟล์
export async function POST() {
  try {
    const supabase = createServerSupabaseClient()

    // ดึงข้อมูลเซสชันปัจจุบัน
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ดึงข้อมูลโปรไฟล์ปัจจุบัน
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("login_count")
      .eq("id", session.user.id)
      .maybeSingle()

    if (profileError && profileError.code !== "PGRST116") {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // ถ้าไม่พบข้อมูลโปรไฟล์ ให้สร้างข้อมูลใหม่
    if (!profile) {
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert([{ id: session.user.id, login_count: 1 }])
        .select()
        .single()

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }

      return NextResponse.json({ profile: newProfile })
    }

    // อัปเดตจำนวนการเข้าใช้งาน
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({
        login_count: (profile.login_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ profile: updatedProfile })
  } catch (error) {
    console.error("Error updating login count:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
