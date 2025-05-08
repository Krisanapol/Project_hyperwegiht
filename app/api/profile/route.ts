import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET: ดึงข้อมูลโปรไฟล์
export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient()

    // ดึงข้อมูลเซสชันปัจจุบัน
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ดึงข้อมูลโปรไฟล์
    const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // ถ้าไม่พบข้อมูลโปรไฟล์ ให้สร้างใหม่
    if (!profile) {
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert([{ id: session.user.id }])
        .select()
        .single()

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }

      return NextResponse.json({ profile: newProfile })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// PUT: อัปเดตข้อมูลโปรไฟล์
export async function PUT(request: Request) {
  try {
    const supabase = createServerSupabaseClient()

    // ดึงข้อมูลเซสชันปัจจุบัน
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ดึงข้อมูลจาก request body
    const body = await request.json()

    // อัปเดตข้อมูลโปรไฟล์
    const { data: profile, error } = await supabase
      .from("profiles")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id)
      .select()
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
