"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Upload,
  Users,
  Phone,
  ClipboardList,
  FileText,
  Settings,
  Compass,
} from "lucide-react"

const links = [
  { href: "/demo", label: "Demo", icon: Compass },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/experts", label: "Experts", icon: Users },
  { href: "/calls", label: "Calls", icon: Phone },
  { href: "/ai-surveys", label: "AI Surveys", icon: ClipboardList },
  { href: "/transcripts", label: "Transcripts", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
]

export default function TopNav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-6">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <Compass className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Helmsman
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1 overflow-x-auto" aria-label="Main navigation">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/")
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                ].join(" ")}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
