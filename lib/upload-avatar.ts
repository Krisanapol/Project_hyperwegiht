import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export async function uploadAvatar(file: File, userId: string): Promise<{ path: string; error: Error | null }> {
  try {
    const supabase = createClientComponentClient()

    // ใช้ bucket ที่มีอยู่แล้ว (ในที่นี้คือ "storage")
    const bucketName = "storage"

    // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
    const fileExt = file.name.split(".").pop()
    const fileName = `avatar-${userId}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `avatars/${fileName}` // เก็บในโฟลเดอร์ avatars

    // อัพโหลดไฟล์ไปยัง Supabase Storage
    const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (uploadError) {
      console.error("Error uploading file:", uploadError)
      throw new Error(`Error uploading file: ${uploadError.message}`)
    }

    // สร้าง public URL สำหรับรูปภาพ
    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath)

    return { path: data.publicUrl, error: null }
  } catch (error) {
    console.error("Error uploading avatar:", error)
    return { path: "", error: error as Error }
  }
}
