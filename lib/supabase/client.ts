"use client"

import { createClient } from "@supabase/supabase-js"

// สร้าง singleton pattern สำหรับ client-side Supabase client
let supabaseClient: ReturnType<typeof createBrowserSupabaseClient> | undefined = undefined

export function createBrowserSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true, // เปลี่ยนเป็น true เพื่อให้ Supabase เก็บ session ไว้ระหว่างการรีเฟรชหน้า
      autoRefreshToken: true, // อนุญาตให้รีเฟรช token อัตโนมัติ
    },
  })
}

// ใช้ singleton pattern เพื่อป้องกันการสร้าง client หลายตัว
export function getSupabaseBrowserClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserSupabaseClient()

    // เพิ่มการตรวจสอบ session เมื่อมีการเปลี่ยนแปลง
    supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        // บันทึกเวลาที่เข้าสู่ระบบล่าสุด
        localStorage.setItem("lastLoginTime", new Date().getTime().toString())
        localStorage.setItem("hyperweight_session_active", "true")
      } else if (event === "SIGNED_OUT") {
        // ล้างข้อมูลเมื่อออกจากระบบ
        localStorage.removeItem("lastLoginTime")
        localStorage.removeItem("hyperweight_session_active")
        // ล้างข้อมูลโปรไฟล์ทั้งหมดใน localStorage
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("profile_")) {
            localStorage.removeItem(key)
          }
        })
      }
    })
  }
  return supabaseClient
}
