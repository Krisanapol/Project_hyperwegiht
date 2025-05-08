import { getSupabaseBrowserClient } from "./supabase/client"
import { updateGoalsFromHealthData } from "./goals"
import { updateGoalProgress } from "./goals" // Import updateGoalProgress
import type { Goal } from "./goals" // Import Goal

export interface HealthDataEntry {
  id: number
  user_id: string
  date: string
  weight: number
  height: number
  bmi: number
  body_fat: number
  water_intake: number
  created_at: string
}

export interface FoodItem {
  id?: string | number
  name: string
  calories: number
  quantity: number
}

export interface ExerciseItem {
  id?: string | number
  name: string
  duration: number // นาที
  caloriesBurned: number
  intensity: string
}

export interface CalorieSummary {
  id?: number
  user_id: string
  health_record_id: number
  total_food_calories: number
  total_exercise_calories: number
  net_calories: number
  tdee_estimate: number
  calorie_status: string
  exercise_status: string
  overall_status: string
}

export interface CommonFood {
  id: number
  name: string
  calories: number
}

export interface CommonExercise {
  id: number
  name: string
  calories_per_minute_per_kg: number
  intensity: string
}

// ดึงข้อมูลสุขภาพของผู้ใช้
export async function getUserHealthData(userId: string): Promise<HealthDataEntry[]> {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase
    .from("health_records")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: true })

  if (error) {
    console.error("Error fetching health data:", error)
    throw error
  }

  return data || []
}

// เพิ่มหรืออัปเดตข้อมูลสุขภาพ
export async function addHealthDataEntry(entry: Omit<HealthDataEntry, "id" | "created_at">): Promise<HealthDataEntry> {
  const supabase = getSupabaseBrowserClient()

  // ตรวจสอบว่ามีข้อมูลของวันนี้อยู่แล้วหรือไม่
  const { data: existingRecord, error: fetchError } = await supabase
    .from("health_records")
    .select("id")
    .eq("user_id", entry.user_id)
    .eq("date", entry.date)
    .single()

  if (fetchError && fetchError.code !== "PGRST116") {
    // PGRST116 คือ "no rows returned" error
    console.error("Error checking for existing record:", fetchError)
    throw fetchError
  }

  let result

  if (existingRecord) {
    // อัปเดตข้อมูลที่มีอยู่แล้ว
    const { data, error } = await supabase
      .from("health_records")
      .update({
        weight: entry.weight,
        height: entry.height,
        bmi: entry.bmi,
        body_fat: entry.body_fat,
        water_intake: entry.water_intake,
      })
      .eq("id", existingRecord.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating health data:", error)
      throw error
    }

    result = data
  } else {
    // เพิ่มข้อมูลใหม่
    const { data, error } = await supabase.from("health_records").insert([entry]).select().single()

    if (error) {
      console.error("Error adding health data:", error)
      throw error
    }

    // อัปเดตจำนวนบันทึกสุขภาพในโปรไฟล์ของผู้ใช้
    try {
      await supabase.rpc("increment_health_records_count")
    } catch (countError) {
      console.error("Error incrementing health records count:", countError)
      // ดำเนินการต่อแม้ว่าจะมีข้อผิดพลาด
    }

    result = data
  }

  // อัพเดทความก้าวหน้าของเป้าหมายโดยอัตโนมัติ
  try {
    await updateGoalsFromHealthData(entry.user_id, result)
  } catch (error) {
    console.error("Error updating goals from health data:", error)
    // ดำเนินการต่อแม้ว่าจะมีข้อผิดพลาด
  }

  return result
}

// ดึงข้อมูลอาหารทั่วไป
export async function getCommonFoods(): Promise<CommonFood[]> {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase.from("common_foods").select("*").order("name", { ascending: true })

  if (error) {
    console.error("Error fetching common foods:", error)
    throw error
  }

  return data || []
}

// ดึงข้อมูลการออกกำลังกายทั่วไป
export async function getCommonExercises(): Promise<CommonExercise[]> {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase.from("common_exercises").select("*").order("name", { ascending: true })

  if (error) {
    console.error("Error fetching common exercises:", error)
    throw error
  }

  return data || []
}

// บันทึกข้อมูลอาหาร
export async function saveFoodItems(
  userId: string,
  healthRecordId: number,
  foodItems: Omit<FoodItem, "id">[],
): Promise<FoodItem[]> {
  const supabase = getSupabaseBrowserClient()

  // ลบข้อมูลอาหารเดิมของบันทึกสุขภาพนี้ (ถ้ามี)
  await supabase.from("food_items").delete().eq("health_record_id", healthRecordId)

  if (foodItems.length === 0) {
    return []
  }

  // เพิ่มข้อมูลอาหารใหม่
  const foodItemsWithIds = foodItems.map((item) => ({
    user_id: userId,
    health_record_id: healthRecordId,
    name: item.name,
    calories: item.calories,
    quantity: item.quantity,
  }))

  const { data, error } = await supabase.from("food_items").insert(foodItemsWithIds).select()

  if (error) {
    console.error("Error saving food items:", error)
    throw error
  }

  return data || []
}

// บันทึกข้อมูลการออกกำลังกาย
export async function saveExerciseItems(
  userId: string,
  healthRecordId: number,
  exerciseItems: Omit<ExerciseItem, "id">[],
): Promise<ExerciseItem[]> {
  const supabase = getSupabaseBrowserClient()

  // ลบข้อมูลการออกกำลังกายเดิมของบันทึกสุขภาพนี้ (ถ้ามี)
  await supabase.from("exercise_items").delete().eq("health_record_id", healthRecordId)

  if (exerciseItems.length === 0) {
    return []
  }

  // เพิ่มข้อมูลการออกกำลังกายใหม่
  const exerciseItemsWithIds = exerciseItems.map((item) => ({
    user_id: userId,
    health_record_id: healthRecordId,
    name: item.name,
    duration: item.duration,
    calories_burned: item.caloriesBurned,
    intensity: item.intensity,
  }))

  const { data, error } = await supabase.from("exercise_items").insert(exerciseItemsWithIds).select()

  if (error) {
    console.error("Error saving exercise items:", error)
    throw error
  }

  // อัพเดทเป้าหมายการออกกำลังกาย (ถ้ามี)
  try {
    // ดึงเป้าหมายการออกกำลังกายที่กำลังใช้งานอยู่
    const { data: goals } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .eq("goal_type", "exercise")
      .eq("status", "active")

    if (goals && goals.length > 0) {
      // คำนวณเวลาออกกำลังกายรวมในสัปดาห์นี้
      const today = new Date()
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay()) // วันอาทิตย์ของสัปดาห์นี้
      startOfWeek.setHours(0, 0, 0, 0)

      // ดึงข้อมูลการออกกำลังกายในสัปดาห์นี้
      const { data: weeklyExercises } = await supabase
        .from("exercise_items")
        .select("duration")
        .eq("user_id", userId)
        .gte("created_at", startOfWeek.toISOString())

      if (weeklyExercises) {
        // คำนวณเวลาออกกำลังกายรวม
        const totalDuration = weeklyExercises.reduce((total, item) => total + (item.duration || 0), 0)

        // อัพเดทเป้าหมายการออกกำลังกาย
        for (const goal of goals) {
          if (goal.id) {
            let status: Goal["status"] | undefined = undefined
            if (totalDuration >= goal.target_value) {
              status = "completed"
            }
            await updateGoalProgress(goal.id, totalDuration, status)
          }
        }
      }
    }
  } catch (error) {
    console.error("Error updating exercise goal:", error)
    // ดำเนินการต่อแม้ว่าจะมีข้อผิดพลาด
  }

  return data || []
}

// บันทึกข้อมูลสรุปแคลอรี่
export async function saveCalorieSummary(
  userId: string,
  healthRecordId: number,
  summary: Omit<CalorieSummary, "id" | "user_id" | "health_record_id">,
): Promise<CalorieSummary> {
  const supabase = getSupabaseBrowserClient()

  // ตรวจสอบว่ามีข้อมูลสรุปแคลอรี่ของบันทึกสุขภาพนี้อยู่แล้วหรือไม่
  const { data: existingSummary, error: fetchError } = await supabase
    .from("calorie_summaries")
    .select("id")
    .eq("health_record_id", healthRecordId)
    .single()

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("Error checking for existing calorie summary:", fetchError)
    throw fetchError
  }

  const summaryData = {
    user_id: userId,
    health_record_id: healthRecordId,
    total_food_calories: summary.total_food_calories,
    total_exercise_calories: summary.total_exercise_calories,
    net_calories: summary.net_calories,
    tdee_estimate: summary.tdee_estimate,
    calorie_status: summary.calorie_status,
    exercise_status: summary.exercise_status,
    overall_status: summary.overall_status,
  }

  let result

  if (existingSummary) {
    // อัปเดตข้อมูลสรุปแคลอรี่ที่มีอยู่แล้ว
    const { data, error } = await supabase
      .from("calorie_summaries")
      .update(summaryData)
      .eq("id", existingSummary.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating calorie summary:", error)
      throw error
    }

    result = data
  } else {
    // เพิ่มข้อมูลสรุปแคลอรี่ใหม่
    const { data, error } = await supabase.from("calorie_summaries").insert([summaryData]).select().single()

    if (error) {
      console.error("Error adding calorie summary:", error)
      throw error
    }

    result = data
  }

  return result
}

// ดึงข้อมูลอาหารของบันทึกสุขภาพ
export async function getFoodItems(healthRecordId: number): Promise<FoodItem[]> {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase
    .from("food_items")
    .select("*")
    .eq("health_record_id", healthRecordId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching food items:", error)
    throw error
  }

  return data.map((item) => ({
    id: item.id,
    name: item.name,
    calories: item.calories,
    quantity: item.quantity,
  }))
}

// ดึงข้อมูลการออกกำลังกายของบันทึกสุขภาพ
export async function getExerciseItems(healthRecordId: number): Promise<ExerciseItem[]> {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase
    .from("exercise_items")
    .select("*")
    .eq("health_record_id", healthRecordId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching exercise items:", error)
    throw error
  }

  return data.map((item) => ({
    id: item.id,
    name: item.name,
    duration: item.duration,
    caloriesBurned: item.calories_burned,
    intensity: item.intensity,
  }))
}

// ดึงข้อมูลสรุปแคลอรี่ของบันทึกสุขภาพ
export async function getCalorieSummary(healthRecordId: number): Promise<CalorieSummary | null> {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase
    .from("calorie_summaries")
    .select("*")
    .eq("health_record_id", healthRecordId)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      // ไม่พบข้อมูล
      return null
    }
    console.error("Error fetching calorie summary:", error)
    throw error
  }

  return data
}
