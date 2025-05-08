"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Logo } from "./logo"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {
  Menu,
  Activity,
  Calculator,
  MessageSquare,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Shield,
  Target,
} from "lucide-react"

interface DashboardHeaderProps {
  activePage?: string
}

export function DashboardHeader({ activePage }: DashboardHeaderProps) {
  const pathname = usePathname()
  const { user, profile, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (profile?.first_name || profile?.last_name) {
      const firstInitial = profile.first_name ? profile.first_name.charAt(0) : ""
      const lastInitial = profile.last_name ? profile.last_name.charAt(0) : ""
      return (firstInitial + lastInitial).toUpperCase()
    }
    return user?.email?.charAt(0).toUpperCase() || "U"
  }

  // Get user display name
  const getDisplayName = () => {
    if (profile?.first_name || profile?.last_name) {
      return `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
    }
    return user?.email?.split("@")[0] || "User"
  }

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const navItems = [
    {
      name: "dashboard",
      label: "แดชบอร์ด",
      href: "/dashboard",
      icon: Activity,
      color: "from-yellow-400 to-yellow-500",
    },
    {
      name: "goals",
      label: "เป้าหมาย",
      href: "/dashboard/goals",
      icon: Target,
      color: "from-purple-400 to-purple-500",
    },
    {
      name: "calculator",
      label: "เครื่องคำนวณ",
      href: "/calculator",
      icon: Calculator,
      color: "from-green-400 to-green-500",
    },
    {
      name: "chathp",
      label: "แชทสุขภาพ",
      href: "/chathp",
      icon: MessageSquare,
      color: "from-blue-400 to-blue-500",
    },
    {
      name: "profile",
      label: "โปรไฟล์",
      href: "/profile",
      icon: User,
      color: "from-purple-400 to-purple-500",
    },
    {
      name: "settings",
      label: "ตั้งค่า",
      href: "/settings",
      icon: Settings,
      color: "from-gray-400 to-gray-500",
    },
  ]

  // แก้ไขฟังก์ชัน isActive เพื่อให้ตรวจจับหน้า /dashboard/goals ได้ถูกต้อง

  const isActive = (name: string) => {
    if (activePage) {
      return activePage === name
    }

    // เพิ่มเงื่อนไขพิเศษสำหรับหน้า goals
    if (name === "goals" && pathname?.includes("/dashboard/goals")) {
      return true
    }

    // สำหรับหน้าอื่นๆ ให้ตรวจสอบว่า pathname มี name หรือไม่
    return pathname?.includes(name)
  }

  // Animation variants for dropdown content
  const dropdownVariants = {
    hidden: { opacity: 0, y: -5, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut",
        staggerChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      y: -5,
      scale: 0.95,
      transition: {
        duration: 0.15,
        ease: "easeIn",
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 },
  }

  // Animation variants for menu items
  const menuItemVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-md shadow-md" : "bg-gradient-to-r from-background to-background/95"
      }`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link href="/dashboard">
                <Logo asLink={false} />
              </Link>
            </motion.div>

            <nav className="hidden md:flex ml-10 space-x-1">
              {navItems.map((item) => {
                const isActiveItem = isActive(item.name)
                return (
                  <motion.div
                    key={item.name}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                    variants={menuItemVariants}
                  >
                    <Link
                      href={item.href}
                      className="relative px-3 py-2 rounded-full flex items-center gap-2 transition-all duration-300"
                    >
                      {isActiveItem && (
                        <motion.div
                          className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-10 rounded-full`}
                          layoutId="activeBackground"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <motion.div
                        className={`flex items-center justify-center h-8 w-8 rounded-full ${
                          isActiveItem
                            ? `bg-gradient-to-r ${item.color} text-white shadow-md`
                            : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                        }`}
                        whileHover={{
                          scale: 1.1,
                          transition: { duration: 0.2 },
                        }}
                      >
                        <item.icon className="h-4 w-4" />
                      </motion.div>
                      <span
                        className={`text-sm font-medium ${isActiveItem ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {item.label}
                      </span>
                      {isActiveItem && (
                        <motion.div
                          className="absolute bottom-0 left-1/2 w-1 h-1 bg-yellow-400 rounded-full"
                          layoutId="activeIndicator"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                )
              })}
            </nav>
          </motion.div>

          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* User Profile Dropdown */}
            <DropdownMenu onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative h-10 rounded-full overflow-hidden transition-all duration-300 flex items-center gap-2 px-2 ${
                    isDropdownOpen ? "bg-yellow-400/10 ring-2 ring-yellow-400/30" : "hover:bg-yellow-400/10"
                  }`}
                >
                  <Avatar className="h-8 w-8 border-2 border-transparent transition-all duration-300 group-hover:border-yellow-400/50">
                    <AvatarImage src={profile?.avatar_url || ""} alt={getDisplayName()} />
                    <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-black font-medium">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline-block text-sm font-medium max-w-[100px] truncate">
                    {getDisplayName()}
                  </span>
                  <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronRight className="h-4 w-4 rotate-90" />
                  </motion.div>
                </motion.button>
              </DropdownMenuTrigger>
              <AnimatePresence>
                {isDropdownOpen && (
                  <DropdownMenuContent className="w-72 p-0 overflow-hidden" align="end" forceMount asChild>
                    <motion.div initial="hidden" animate="visible" exit="exit" variants={dropdownVariants}>
                      <div className="bg-gradient-to-r from-yellow-400/20 to-yellow-500/10 p-4">
                        <div className="flex items-start gap-3">
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Avatar className="h-12 w-12 border-2 border-yellow-400/50 ring-2 ring-background/50">
                              <AvatarImage src={profile?.avatar_url || ""} alt={getDisplayName()} />
                              <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-black text-lg font-medium">
                                {getInitials()}
                              </AvatarFallback>
                            </Avatar>
                          </motion.div>
                          <div className="flex flex-col">
                            <p className="text-base font-semibold leading-none mb-1">{getDisplayName()}</p>
                            <p className="text-xs text-muted-foreground mb-2">{user?.email}</p>
                            <div className="inline-flex items-center gap-1 text-xs bg-yellow-400/20 text-yellow-500 px-2 py-0.5 rounded-full">
                              <motion.span
                                className="h-1.5 w-1.5 rounded-full bg-green-500"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                              />
                              <span>ออนไลน์</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        <motion.div variants={itemVariants}>
                          <DropdownMenuItem
                            asChild
                            className="flex items-center p-3 cursor-pointer rounded-md hover:bg-yellow-400/10 focus:bg-yellow-400/10"
                          >
                            <Link href="/profile" className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-3">
                                <motion.div
                                  className="flex items-center justify-center h-8 w-8 rounded-full bg-yellow-400/10 text-yellow-500"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <User className="h-4 w-4" />
                                </motion.div>
                                <div>
                                  <p className="text-sm font-medium">โปรไฟล์</p>
                                  <p className="text-xs text-muted-foreground">จัดการข้อมูลส่วนตัว</p>
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </Link>
                          </DropdownMenuItem>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                          <DropdownMenuItem
                            asChild
                            className="flex items-center p-3 cursor-pointer rounded-md hover:bg-yellow-400/10 focus:bg-yellow-400/10"
                          >
                            <Link href="/settings" className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-3">
                                <motion.div
                                  className="flex items-center justify-center h-8 w-8 rounded-full bg-yellow-400/10 text-yellow-500"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Settings className="h-4 w-4" />
                                </motion.div>
                                <div>
                                  <p className="text-sm font-medium">ตั้งค่า</p>
                                  <p className="text-xs text-muted-foreground">ปรับแต่งการใช้งาน</p>
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </Link>
                          </DropdownMenuItem>
                        </motion.div>

                        <DropdownMenuSeparator className="my-1" />

                        <motion.div variants={itemVariants}>
                          <DropdownMenuItem
                            asChild
                            className="flex items-center p-3 cursor-pointer rounded-md hover:bg-yellow-400/10 focus:bg-yellow-400/10"
                          >
                            <Link href="/profile/change-password" className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-3">
                                <motion.div
                                  className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-400/10 text-blue-500"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Shield className="h-4 w-4" />
                                </motion.div>
                                <div>
                                  <p className="text-sm font-medium">เปลี่ยนรหัสผ่าน</p>
                                  <p className="text-xs text-muted-foreground">อัพเดทความปลอดภัย</p>
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </Link>
                          </DropdownMenuItem>
                        </motion.div>

                        <DropdownMenuSeparator className="my-1" />

                        <motion.div variants={itemVariants}>
                          <DropdownMenuItem
                            className="flex items-center p-3 cursor-pointer rounded-md hover:bg-red-500/10 focus:bg-red-500/10 text-red-500 hover:text-red-500 focus:text-red-500"
                            onClick={() => signOut()}
                          >
                            <div className="flex items-center gap-3">
                              <motion.div
                                className="flex items-center justify-center h-8 w-8 rounded-full bg-red-500/10 text-red-500"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <LogOut className="h-4 w-4" />
                              </motion.div>
                              <div>
                                <p className="text-sm font-medium">ออกจากระบบ</p>
                                <p className="text-xs text-red-500/70">ออกจากระบบทันที</p>
                              </div>
                            </div>
                          </DropdownMenuItem>
                        </motion.div>
                      </div>
                    </motion.div>
                  </DropdownMenuContent>
                )}
              </AnimatePresence>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="md:hidden p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              className="md:hidden mt-4 pb-4 space-y-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {navItems.map((item, index) => {
                const isActiveItem = isActive(item.name)
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium ${
                        isActiveItem
                          ? `bg-gradient-to-r ${item.color} bg-opacity-10 text-foreground`
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <motion.div
                        className={`flex items-center justify-center h-8 w-8 rounded-full ${
                          isActiveItem
                            ? `bg-gradient-to-r ${item.color} text-white shadow-md`
                            : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <item.icon className="h-4 w-4" />
                      </motion.div>
                      {item.label}
                    </Link>
                  </motion.div>
                )
              })}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
