"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
  login_count: number
  health_records_count: number
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  signUp: (
    email: string,
    password: string,
  ) => Promise<{
    error: any | null
    data: any | null
  }>
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    error: any | null
    data: any | null
  }>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<Profile>) => Promise<{
    error: any | null
    data: Profile | null
  }>
  refreshProfile: () => Promise<void>
  sendOTP: (email: string) => Promise<{
    error: any | null
  }>
  verifyOTP: (
    email: string,
    token: string,
  ) => Promise<{
    data: any | null
    error: any | null
  }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// เพิ่มตัวแปรเพื่อเก็บข้อมูลโปรไฟล์ไว้ใช้ซ้ำ
let profileCache: { [key: string]: Profile } = {}

// ใช้ localStorage แทน sessionStorage เพื่อให้ข้อมูลถูกเก็บไว้แม้จะรีเฟรชหน้า
const SESSION_KEY = "hyperweight_session_active"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  // เพิ่มตัวแปรเพื่อป้องกันการเรียกใช้ API ซ้ำๆ
  const [isRefreshing, setIsRefreshing] = useState(false)

  // แก้ไขฟังก์ชัน fetchProfile เพื่อรองรับกรณีที่ไม่พบข้อมูลโปรไฟล์และจัดการข้อผิดพลาด
  const fetchProfile = async (userId: string) => {
    try {
      // ตรวจสอบว่ามีข้อมูลในแคชหรือไม่
      if (profileCache[userId]) {
        return profileCache[userId]
      }

      // ลองดึงข้อมูลจาก localStorage ก่อน
      const cachedProfile = localStorage.getItem(`profile_${userId}`)
      if (cachedProfile) {
        try {
          const parsedProfile = JSON.parse(cachedProfile) as Profile
          profileCache[userId] = parsedProfile
          return parsedProfile
        } catch (e) {
          // หากมีข้อผิดพลาดในการแปลงข้อมูล ให้ลบข้อมูลที่ไม่ถูกต้องออก
          localStorage.removeItem(`profile_${userId}`)
        }
      }

      // ดึงข้อมูลโปรไฟล์จาก Supabase
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle()

      if (error) {
        console.error("Error fetching profile:", error)
        return null
      }

      // ถ้าไม่พบข้อมูลโปรไฟล์ ให้สร้างข้อมูลใหม่
      if (!data) {
        try {
          // สร้างข้อมูลโปรไฟล์ใหม่
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert([{ id: userId }])
            .select("*")
            .single()

          if (insertError) {
            console.error("Error creating profile:", insertError)
            return null
          }

          // เก็บข้อมูลในแคชและ localStorage
          profileCache[userId] = newProfile as Profile
          localStorage.setItem(`profile_${userId}`, JSON.stringify(newProfile))
          return newProfile as Profile
        } catch (insertError) {
          console.error("Error in profile creation:", insertError)
          return null
        }
      }

      // เก็บข้อมูลในแคชและ localStorage
      profileCache[userId] = data as Profile
      localStorage.setItem(`profile_${userId}`, JSON.stringify(data))
      return data as Profile
    } catch (error) {
      // จัดการกับข้อผิดพลาด "Too Many Requests"
      if (error instanceof Error && error.message.includes("Too Many")) {
        console.warn("Rate limit exceeded. Using cached data if available.")
        return profileCache[userId] || null
      }

      console.error("Error in fetchProfile:", error)
      return null
    }
  }

  // ฟังก์ชันสำหรับรีเฟรชข้อมูลโปรไฟล์ พร้อมป้องกันการเรียกซ้ำ
  const refreshProfile = async () => {
    if (!user || isRefreshing) return

    try {
      setIsRefreshing(true)
      const profileData = await fetchProfile(user.id)
      if (profileData) {
        setProfile(profileData)
      }
    } catch (error) {
      console.error("Error refreshing profile:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // แก้ไขฟังก์ชัน updateLoginCount เพื่อรองรับกรณีที่ API ยังไม่พร้อม
  const updateLoginCount = async () => {
    if (!user) return

    try {
      // ใช้ข้อมูลจากแคชถ้ามี
      const currentProfile = profileCache[user.id] || profile

      // อัปเดตจำนวนการเข้าใช้งานโดยตรง
      const { error } = await supabase
        .from("profiles")
        .update({
          login_count: currentProfile ? currentProfile.login_count + 1 : 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) {
        console.error("Error updating login count:", error)
      } else {
        // อัปเดตแคช
        if (currentProfile) {
          profileCache[user.id] = {
            ...currentProfile,
            login_count: currentProfile.login_count + 1,
            updated_at: new Date().toISOString(),
          }
        }
      }
    } catch (error) {
      console.error("Error updating login count:", error)
    }
  }

  // ฟังก์ชันสำหรับตรวจสอบว่าควรออกจากระบบหรือไม่เมื่อกลับมาที่หน้าเว็บ
  const checkSessionStatus = async () => {
    // ตรวจสอบว่ามีการเข้าสู่ระบบอยู่หรือไม่
    const isSessionActive = localStorage.getItem(SESSION_KEY) === "true"

    if (!isSessionActive && user) {
      // ถ้าไม่มีเซสชันที่ active แต่มี user ให้ออกจากระบบ
      await signOut()
    }
  }

  useEffect(() => {
    // ตรวจสอบสถานะการล็อกอินเมื่อโหลดหน้า
    const getSession = async () => {
      setIsLoading(true)
      try {
        // ตรวจสอบว่าควรออกจากระบบหรือไม่
        await checkSessionStatus()

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (session) {
          setSession(session)
          setUser(session.user)

          // บันทึกว่ามีเซสชันที่ active
          localStorage.setItem(SESSION_KEY, "true")

          // ดึงข้อมูลโปรไฟล์
          const profileData = await fetchProfile(session.user.id)
          if (profileData) {
            setProfile(profileData)

            // อัปเดตจำนวนการเข้าใช้งานเฉพาะเมื่อเข้าสู่ระบบครั้งแรก
            // ตรวจสอบว่าเพิ่งเข้าสู่ระบบหรือไม่
            const lastLoginTime = localStorage.getItem("lastLoginTime")
            const currentTime = new Date().getTime()

            // ถ้าไม่มีเวลาล็อกอินล่าสุด หรือเวลาผ่านไปมากกว่า 1 ชั่วโมง ให้อัปเดตจำนวนการเข้าใช้งาน
            if (!lastLoginTime || currentTime - Number.parseInt(lastLoginTime) > 3600000) {
              await updateLoginCount()
              localStorage.setItem("lastLoginTime", currentTime.toString())
            }
          }
        }
      } catch (error) {
        console.error("Error getting session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    // ตั้ง listener สำหรับการเปลี่ยนแปลงสถานะการล็อกอิน
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        // บันทึกว่ามีเซสชันที่ active
        localStorage.setItem(SESSION_KEY, "true")

        // ดึงข้อมูลโปรไฟล์
        const profileData = await fetchProfile(session.user.id)
        if (profileData) {
          setProfile(profileData)
        }
      } else {
        // ลบข้อมูลเซสชัน
        localStorage.removeItem(SESSION_KEY)
        setProfile(null)
      }

      router.refresh()
    })

    // เพิ่ม event listener สำหรับ visibilitychange เพื่อตรวจสอบเมื่อผู้ใช้กลับมาที่หน้าเว็บ
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkSessionStatus()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      subscription.unsubscribe()
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [router, supabase])

  // เพิ่ม event listener สำหรับ beforeunload เพื่อลบข้อมูลเซสชันเมื่อปิดแท็บ
  useEffect(() => {
    const handleBeforeUnload = () => {
      // ไม่ต้องลบข้อมูลเซสชันเมื่อปิดแท็บ เพื่อให้ยังคงล็อกอินอยู่เมื่อกลับมา
      // localStorage.removeItem(SESSION_KEY) // ลบบรรทัดนี้ออก
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (!error && data.user) {
        // บันทึกว่ามีเซสชันที่ active
        localStorage.setItem(SESSION_KEY, "true")
      }

      return { data, error }
    } catch (error) {
      console.error("Error signing up:", error)
      return { data: null, error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (!error && data.user) {
        // บันทึกว่ามีเซสชันที่ active
        localStorage.setItem(SESSION_KEY, "true")

        // อัปเดตจำนวนการเข้าใช้งาน
        await updateLoginCount()
      }

      return { data, error }
    } catch (error) {
      console.error("Error signing in:", error)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()

      // ล้างข้อมูลการเข้าสู่ระบบจาก localStorage
      localStorage.removeItem(SESSION_KEY)
      localStorage.removeItem("lastLoginTime")

      // ล้างข้อมูลโปรไฟล์ทั้งหมดใน localStorage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("profile_")) {
          localStorage.removeItem(key)
        }
      })

      // ล้างแคช
      profileCache = {}
      setUser(null)
      setSession(null)
      setProfile(null)
      router.push("/signin")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) {
      return { error: "Not authenticated", data: null }
    }

    try {
      // อัปเดตโดยตรงผ่าน Supabase เพื่อลดการเรียกใช้ API
      const { data: updatedProfile, error } = await supabase
        .from("profiles")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single()

      if (error) {
        return { error, data: null }
      }

      // อัปเดตข้อมูลโปรไฟล์ในสเตท, แคช และ localStorage
      const newProfile = updatedProfile as Profile
      setProfile(newProfile)
      profileCache[user.id] = newProfile
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(newProfile))

      return { error: null, data: newProfile }
    } catch (error) {
      console.error("Error updating profile:", error)
      return { error, data: null }
    }
  }

  // เพิ่มฟังก์ชันสำหรับส่ง OTP ไปยังอีเมล
  const sendOTP = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      })
      return { error }
    } catch (error) {
      console.error("Error sending OTP:", error)
      return { error }
    }
  }

  // เพิ่มฟังก์ชันสำหรับยืนยัน OTP
  const verifyOTP = async (email: string, token: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      })
      return { data, error }
    } catch (error) {
      console.error("Error verifying OTP:", error)
      return { data: null, error }
    }
  }

  const value = {
    user,
    session,
    profile,
    isLoading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
    sendOTP,
    verifyOTP,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
