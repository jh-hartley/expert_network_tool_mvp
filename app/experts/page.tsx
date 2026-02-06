"use client"

import { useState, useCallback, useEffect } from "react"
import dynamic from "next/dynamic"
import { Plus } from "lucide-react"
import Link from "next/link"
import PageHeader from "../components/page-header"
import {
  getExpertProfiles,
  saveExpertProfiles,
  type ExpertProfile,
} from "@/lib/expert-profiles"

/* Dynamically import the lens table with SSR disabled so it never
   renders on the server -- this eliminates any localStorage-driven
   hydration mismatches. */
const ExpertLensTable = dynamic(
  () => import("../components/expert-lens-table"),
  { ssr: false },
)

/* ------------------------------------------------------------------ */
/*  Experts page                                                       */
/*                                                                     */
/*  State is held here so shortlisting, notes, and CID updates are    */
/*  reflected immediately. Every mutation persists to localStorage.    */
/* ------------------------------------------------------------------ */

export default function ExpertsPage() {
  const [experts, setExperts] = useState<ExpertProfile[]>([])
  const [loaded, setLoaded] = useState(false)

  // Hydrate from localStorage after mount
  useEffect(() => {
    setExperts(getExpertProfiles())
    setLoaded(true)
  }, [])

  const handleUpdate = useCallback(
    (index: number, updates: Partial<ExpertProfile>) => {
      setExperts((prev) => {
        const next = [...prev]
        next[index] = { ...next[index], ...updates }
        saveExpertProfiles(next)
        return next
      })
    },
    [],
  )

  if (!loaded) {
    return (
      <div className="mx-auto max-w-[1600px] px-6 py-10">
        <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
          Loading expert profiles...
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-10">
      <PageHeader
        title="Experts"
        description="Browse expert profiles by type, review screening responses, and build your shortlist. Use the lens tabs to switch between customer, competitor, and target views with type-specific screening columns. Data is persisted in your browser -- shortlists, notes, and new experts from the Upload page are saved automatically."
        actions={
          <Link
            href="/upload"
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Experts
          </Link>
        }
      />
      {/* Lens table */}
      <div className="mt-6">
        <ExpertLensTable
          experts={experts}
          onUpdateExpert={handleUpdate}
        />
      </div>
    </div>
  )
}
