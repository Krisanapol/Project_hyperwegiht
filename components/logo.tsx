import Link from "next/link"
import { Dumbbell } from "lucide-react"
import "../styles/animations.css"

interface LogoProps {
  asLink?: boolean
}

export function Logo({ asLink = true }: LogoProps) {
  const LogoContent = () => (
    <div className="flex items-center gap-2 hover-lift">
      <div className="bg-yellow-400 p-1.5 rounded-md">
        <Dumbbell className="h-5 w-5 text-black" />
      </div>
      <span className="font-bold text-xl">
        Hyper<span className="text-yellow-400">weight</span>
      </span>
    </div>
  )

  if (asLink) {
    return (
      <Link href="/" className="flex items-center gap-2 hover-lift">
        <LogoContent />
      </Link>
    )
  }

  return <LogoContent />
}
