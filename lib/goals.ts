import { getSupabaseBrowserClient } from "./supabase/client"
import type { HealthDataEntry } from "./health-data"

export interface Goal {
  id?: number
  user_id: string
  goal_type: "weight" | "bmi" | "body_fat" | "water_intake"
  target_value: number
  start_value: number
  current_value: number
  start_date: string
  target_date: string
  status: "active" | "completed" | "abandoned"
  created_at?: string
  updated_at?: string
}

// ดึงข้อมูลเป้าหมายตาม ID
export async function getGoalById(goalId: number): Promise<Goal | null> {
  const supabase = getSupabaseBrowserClient()

  try {
    const { data, error } = await supabase.from("goals").select("*").eq("id", goalId).single()

    if (error) {
      console.error("Error fetching goal by ID:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Unexpected error in getGoalById:", error)
    return null
  }
}

// ดึงข้อมูลเป้าหมายทั้งหมดของผู้ใช้
export async function getUserGoals(userId: string): Promise<Goal[]> {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching goals:", error)
    throw error
  }

  return data || []
}

// ดึงข้อมูลเป้าหมายที่กำลังใช้งานอยู่ของผู้ใช้
export async function getActiveGoals(userId: string): Promise<Goal[]> {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching active goals:", error)
    throw error
  }

  return data || []
}

// ดึงข้อมูลเป้าหมายตามประเภท
export async function getGoalByType(userId: string, goalType: Goal["goal_type"]): Promise<Goal | null> {
  const supabase = getSupabaseBrowserClient()

  try {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .eq("goal_type", goalType)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // ไม่พบข้อมูล
        return null
      }
      console.error(`Error fetching ${goalType} goal:`, error)
      throw error
    }

    return data
  } catch (error) {
    console.error(`Unexpected error in getGoalByType for ${goalType}:`, error)
    return null
  }
}

// สร้างหรืออัปเดตเป้าหมาย
export async function saveGoal(goal: Omit<Goal, "id" | "created_at" | "updated_at">): Promise<Goal> {
  const supabase = getSupabaseBrowserClient()

  // ตรวจสอบว่ามีเป้าหมายประเภทนี้ที่กำลังใช้งานอยู่หรือไม่
  const existingGoal = await getGoalByType(goal.user_id, goal.goal_type)

  if (existingGoal) {
    // ถ้ามีเป้าหมายอยู่แล้ว ให้อัปเดตสถานะเป็น abandoned
    await supabase
      .from("goals")
      .update({ status: "abandoned", updated_at: new Date().toISOString() })
      .eq("id", existingGoal.id)
  }

  // สร้างเป้าหมายใหม่
  const { data, error } = await supabase
    .from("goals")
    .insert([
      {
        ...goal,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Error saving goal:", error)
    throw error
  }

  return data
}

// อัปเดตความก้าวหน้าของเป้าหมาย
export async function updateGoalProgress(goalId: number, currentValue: number, status?: Goal["status"]): Promise<Goal> {
  const supabase = getSupabaseBrowserClient()

  const updates: Partial<Goal> = {
    current_value: currentValue,
    updated_at: new Date().toISOString(),
  }

  if (status) {
    updates.status = status
  }

  const { data, error } = await supabase.from("goals").update(updates).eq("id", goalId).select().single()

  if (error) {
    console.error("Error updating goal progress:", error)
    throw error
  }

  return data
}

// ลบเป้าหมาย
export async function deleteGoal(goalId: number): Promise<void> {
  const supabase = getSupabaseBrowserClient()

  const { error } = await supabase.from("goals").delete().eq("id", goalId)

  if (error) {
    console.error("Error deleting goal:", error)
    throw error
  }
}

// แก้ไขฟังก์ชัน calculateGoalProgress ให้คำนวณเปอร์เซ็นต์ความก้าวหน้าได้ถูกต้อง
export function calculateGoalProgress(goal: Goal): number {
  // ตรวจสอบว่าเป้าหมายคือการลดค่าหรือเพิ่มค่า
  const isDecreasing = goal.target_value < goal.start_value

  // กรณีพิเศษ: ถ้าค่าเริ่มต้นเท่ากับค่าเป้าหมาย (ป้องกันการหารด้วย 0)
  if (goal.start_value === goal.target_value) {
    // ถ้าค่าปัจจุบันเท่ากับค่าเป้าหมาย ถือว่าสำเร็จ 100%
    return goal.current_value === goal.target_value ? 100 : 0
  }

  // กรณีเป้าหมายคือการลดค่า (เช่น ลดน้ำหนัก)
  if (isDecreasing) {
    // ถ้าค่าปัจจุบันต่ำกว่าหรือเท่ากับค่าเป้าหมาย (ทำได้ถึงหรือเกินเป้า)
    if (goal.current_value <= goal.target_value) {
      return 100
    }

    // ถ้าค่าปัจจุบันสูงกว่าหรือเท่ากับค่าเริ่มต้น (ยังไม่มีความก้าวหน้า)
    if (goal.current_value >= goal.start_value) {
      return 0
    }

    // คำนวณเปอร์เซ็นต์ความก้าวหน้า
    const totalChange = goal.start_value - goal.target_value
    const currentChange = goal.start_value - goal.current_value
    return (currentChange / totalChange) * 100
  }
  // กรณีเป้าหมายคือการเพิ่มค่า (เช่น เพิ่มการออกกำลังกาย)
  else {
    // ถ้าค่าปัจจุบันสูงกว่าหรือเท่ากับค่าเป้าหมาย (ทำได้ถึงหรือเกินเป้า)
    if (goal.current_value >= goal.target_value) {
      return 100
    }

    // ถ้าค่าปัจจุบันต่ำกว่าหรือเท่ากับค่าเริ่มต้น (ยังไม่มีความก้าวหน้า)
    if (goal.current_value <= goal.start_value) {
      return 0
    }

    // คำนวณเปอร์เซ็นต์ความก้าวหน้า
    const totalChange = goal.target_value - goal.start_value
    const currentChange = goal.current_value - goal.start_value
    return (currentChange / totalChange) * 100
  }
}

// คำนวณวันที่เหลือจนถึงวันเป้าหมาย
export function calculateRemainingDays(targetDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const target = new Date(targetDate)
  target.setHours(0, 0, 0, 0)

  const diffTime = target.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return Math.max(diffDays, 0)
}

// แปลงประเภทเป้าหมายเป็นข้อความภาษาไทย
export function getGoalTypeText(goalType: Goal["goal_type"]): string {
  switch (goalType) {
    case "weight":
      return "น้ำหนัก"
    case "bmi":
      return "BMI"
    case "body_fat":
      return "เปอร์เซ็นต์ไขมัน"
    case "water_intake":
      return "การดื่มน้ำ"
    default:
      return "ไม่ระบุ"
  }
}

// แปลงประเภทเป้าหมายเป็นหน่วย
export function getGoalUnit(goalType: Goal["goal_type"]): string {
  switch (goalType) {
    case "weight":
      return "กก."
    case "bmi":
      return ""
    case "body_fat":
      return "%"
    case "water_intake":
      return "มล./วัน"
    default:
      return ""
  }
}

// ฟังก์ชันใหม่: อัพเดทความก้าวหน้าของเป้าหมายโดยอัตโนมัติจากข้อมูลสุขภาพล่าสุด
export async function updateGoalsFromHealthData(userId: string, healthData: HealthDataEntry): Promise<void> {
  try {
    // ดึงเป้าหมายที่กำลังใช้งานอยู่ทั้งหมด
    const activeGoals = await getActiveGoals(userId)

    if (activeGoals.length === 0) {
      return // ไม่มีเป้าหมายที่กำลังใช้งานอยู่
    }

    // อัพเดทแต่ละเป้าหมายตามประเภท
    for (const goal of activeGoals) {
      let newValue: number | null = null
      let shouldUpdate = false

      // ตรวจสอบประเภทของเป้าหมายและดึงค่าที่เกี่ยวข้องจากข้อมูลสุขภาพ
      switch (goal.goal_type) {
        case "weight":
          if (healthData.weight) {
            newValue = healthData.weight
            shouldUpdate = true
          }
          break
        case "bmi":
          if (healthData.bmi) {
            newValue = healthData.bmi
            shouldUpdate = true
          }
          break
        case "body_fat":
          if (healthData.body_fat) {
            newValue = healthData.body_fat
            shouldUpdate = true
          }
          break
        case "water_intake":
          if (healthData.water_intake) {
            newValue = healthData.water_intake
            shouldUpdate = true
          }
          break
        // สำหรับ exercise จะต้องมีการคำนวณเพิ่มเติม (ไม่ได้อยู่ใน healthData โดยตรง)
        // จะต้องมีการปรับปรุงเพิ่มเติมในอนาคต
      }

      // อัพเดทเป้าหมายถ้ามีค่าใหม่
      if (shouldUpdate && newValue !== null && goal.id) {
        // ตรวจสอบว่าถึงเป้าหมายหรือยัง
        let status: Goal["status"] | undefined = undefined

        if (
          (goal.target_value > goal.start_value && newValue >= goal.target_value) ||
          (goal.target_value < goal.start_value && newValue <= goal.target_value)
        ) {
          status = "completed"
        }

        await updateGoalProgress(goal.id, newValue, status)
      }
    }
  } catch (error) {
    console.error("Error updating goals from health data:", error)
  }
}
