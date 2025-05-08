import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function createIncrementFunctions() {
  const supabase = createServerSupabaseClient()

  // สร้าง function สำหรับเพิ่มค่า login_count
  await supabase.rpc("create_increment_login_count_function", {})

  // สร้าง function สำหรับเพิ่มค่า health_records_count
  await supabase.rpc("create_increment_health_records_count_function", {})

  return { success: true }
}
