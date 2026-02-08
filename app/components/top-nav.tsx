"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { type LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  Upload,
  Users,
  Heart,
  Phone,
  ClipboardList,
  FileText,
  Settings,
  Compass,
  ChevronDown,
} from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Nav item types                                                     */
/* ------------------------------------------------------------------ */

type NavLink = {
  kind: "link"
  id: string
  href: string
  label: string
  icon: LucideIcon
}

type NavGroup = {
  kind: "group"
  id: string
  label: string
  icon: LucideIcon
  /** Highlight the group trigger when any of these paths match */
  activePaths: string[]
  children: { href: string; label: string; icon: LucideIcon; description: string }[]
}

type NavItem = NavLink | NavGroup

const NAV_ITEMS: NavItem[] = [
  { kind: "link", id: "demo",        href: "/demo",       label: "Demo",        icon: Compass },
  { kind: "link", id: "dashboard",   href: "/dashboard",  label: "Dashboard",   icon: LayoutDashboard },
  {
    kind: "group",
    id: "experts-group",
    label: "Experts",
    icon: Users,
    activePaths: ["/upload", "/review", "/experts"],
    children: [
      { href: "/upload",   label: "Upload Data",      icon: Upload, description: "Ingest expert profiles from networks" },
      { href: "/review",   label: "Review Profiles",  icon: Heart,  description: "Swipe through experts one at a time" },
      { href: "/experts",  label: "All Experts",       icon: Users,  description: "View and search the full expert table" },
    ],
  },
  {
    kind: "group",
    id: "engagements-group",
    label: "Engagements",
    icon: Phone,
    activePaths: ["/calls", "/ai-surveys"],
    children: [
      { href: "/calls",      label: "Calls",       icon: Phone,         description: "Schedule calls and track spend" },
      { href: "/ai-surveys", label: "AI Surveys",  icon: ClipboardList, description: "Manage AI interview surveys" },
    ],
  },
  { kind: "link", id: "transcripts",  href: "/transcripts", label: "Transcripts", icon: FileText },
  { kind: "link", id: "settings",     href: "/settings",    label: "Settings",    icon: Settings },
]

/* ------------------------------------------------------------------ */
/*  Dropdown group component                                           */
/* ------------------------------------------------------------------ */

function NavDropdown({
  item,
  pathname,
}: {
  item: NavGroup
  pathname: string
}) {
  const isGroupActive = item.activePaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  )

  return (
    <div className="relative group/dropdown">
      {/* Trigger */}
      <button
        type="button"
        className={[
          "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
          isGroupActive
            ? "bg-accent text-foreground"
            : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
        ].join(" ")}
      >
        <item.icon className="h-3.5 w-3.5" />
        {item.label}
        <ChevronDown className="h-3 w-3 opacity-50 transition-transform group-hover/dropdown:rotate-180" />
      </button>

      {/* Dropdown panel */}
      <div className="invisible absolute left-0 top-full pt-1 opacity-0 transition-all group-hover/dropdown:visible group-hover/dropdown:opacity-100">
        <div className="w-56 rounded-lg border border-border bg-card shadow-lg">
          <div className="p-1.5">
            {item.children.map((child) => {
              const isChildActive =
                pathname === child.href || pathname.startsWith(child.href + "/")
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={[
                    "flex items-start gap-2.5 rounded-md px-3 py-2.5 transition-colors",
                    isChildActive
                      ? "bg-accent text-foreground"
                      : "text-foreground hover:bg-accent/60",
                  ].join(" ")}
                >
                  <child.icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium leading-none">{child.label}</p>
                    <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                      {child.description}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Top nav                                                            */
/* ------------------------------------------------------------------ */

export default function TopNav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-6">
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
        <nav className="flex items-center gap-1 overflow-x-visible" aria-label="Main navigation" suppressHydrationWarning>
          {NAV_ITEMS.map((item) => {
            if (item.kind === "group") {
              return <NavDropdown key={item.id} item={item} pathname={pathname} />
            }

            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.id}
                href={item.href}
                className={[
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                ].join(" ")}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
