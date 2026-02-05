"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Upload,
  Users,
  Phone,
  ClipboardList,
  Search,
  Settings,
  Compass,
} from "lucide-react"

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Upload", href: "/upload", icon: Upload },
  { label: "Experts", href: "/experts", icon: Users },
  { label: "Calls", href: "/calls", icon: Phone },
  { label: "AI Surveys", href: "/ai-surveys", icon: ClipboardList },
  { label: "Search", href: "/search", icon: Search },
  { label: "Settings", href: "/settings", icon: Settings },
]

export function TopNav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-foreground transition-colors hover:text-primary"
        >
          <Compass className="h-5 w-5 text-primary" />
          <span className="text-base font-semibold tracking-tight">
            Helmsman
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
