"use client"

import Link from "next/link"
import { Logo } from "./logo"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "./ui/button"
import { Loader2, ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"
import "../styles/animations.css"

export function Header() {
  const { user, isLoading, signOut } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? "bg-background/80 backdrop-blur-md shadow-sm" : ""}`}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Logo />
        <div className="flex items-center gap-4">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-yellow-400" />
          ) : user ? (
            <>
              <Link
                href="/dashboard"
                className={`px-6 py-2 border border-yellow-400 rounded-md text-yellow-400 hover:bg-yellow-400/10 transition-colors hover-lift ${mounted ? "animate-fade-in" : "opacity-0"}`}
                style={{ animationDelay: "0.1s" }}
              >
                Dashboard
              </Link>
              <Button
                onClick={() => signOut()}
                className={`px-6 py-2 bg-yellow-400 rounded-md text-black font-medium hover:bg-yellow-500 transition-colors hover-lift ${mounted ? "animate-fade-in" : "opacity-0"}`}
                style={{ animationDelay: "0.2s" }}
              >
                ออกจากระบบ
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className={`px-6 py-2 border border-yellow-400 rounded-md text-yellow-400 hover:bg-yellow-400/10 transition-colors hover-lift ${mounted ? "animate-fade-in" : "opacity-0"}`}
                style={{ animationDelay: "0.1s" }}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className={`flex items-center px-6 py-2 bg-yellow-400 rounded-md text-black font-medium hover:bg-yellow-500 transition-colors hover-lift ${mounted ? "animate-fade-in" : "opacity-0"}`}
                style={{ animationDelay: "0.2s" }}
              >
                Sign up
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
