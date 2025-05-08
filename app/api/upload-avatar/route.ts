import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// สร้าง Supabase client ด้วย service_role key เพื่อให้มีสิทธิ์ในการสร้าง bucket
const supabaseAdmin = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "")

// ชื่อ bucket ที่ต้องการใช้
const BUCKET_NAME = "avatars"

// ฟังก์ชันสำหรับตรวจสอบและสร้าง bucket ถ้าไม่มีอยู่
async function ensureBucketExists() {
  try {
    // ตรวจสอบว่า bucket มีอยู่หรือไม่
    const { data: buckets } = await supabaseAdmin.storage.listBuckets()
    const bucketExists = buckets?.some((bucket) => bucket.name === BUCKET_NAME)

    // ถ้า bucket ไม่มีอยู่ ให้สร้างใหม่
    if (!bucketExists) {
      const { error } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
        public: true, // ตั้งค่าให้เป็น public bucket
        fileSizeLimit: 1024 * 1024 * 2, // จำกัดขนาดไฟล์ไม่เกิน 2MB
      })

      if (error) {
        console.error("Error creating bucket:", error)
        return false
      }
    }

    return true
  } catch (error) {
    console.error("Error ensuring bucket exists:", error)
    return false
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const userId = formData.get("userId") as string

    if (!file || !userId) {
      return NextResponse.json({ error: "File and userId are required" }, { status: 400 })
    }

    // ตรวจสอบและสร้าง bucket ถ้าไม่มีอยู่
    const bucketExists = await ensureBucketExists()
    if (!bucketExists) {
      return NextResponse.json(
        { error: "Could not create or access storage bucket. Please contact administrator." },
        { status: 500 },
      )
    }

    // ใช้ client ปกติสำหรับการอัพโหลดไฟล์
    const supabase = createRouteHandlerClient({ cookies })

    // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
    const fileExt = file.name.split(".").pop()
    const fileName = `avatar-${userId}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `${fileName}`

    // อัพโหลดไฟล์ไปยัง Supabase Storage
    const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (uploadError) {
      console.error("Error uploading file:", uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // สร้าง public URL สำหรับรูปภาพ
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)

    return NextResponse.json({ path: data.publicUrl })
  } catch (error: any) {
    console.error("Error uploading avatar:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
