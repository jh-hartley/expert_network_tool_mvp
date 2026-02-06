"use client"

import { useState, useCallback } from "react"
import { Plus } from "lucide-react"
import Link from "next/link"
import PageHeader from "../components/page-header"
import ExpertLensTable from "../components/expert-lens-table"
import {
  getExpertProfiles,
  saveExpertProfiles,
  type ExpertProfile,
} from "@/lib/expert-profiles"

/* ------------------------------------------------------------------ */
/*  Experts page                                                       */
/*                                                                     */
/*  State is held here so shortlisting, notes, and CID updates are    */
/*  reflected immediately. Every mutation persists to localStorage.    */
/* ------------------------------------------------------------------ */

export default function ExpertsPage() {
  const [experts, setExperts] = useState<ExpertProfile[]>(() =>
    getExpertProfiles(),
  )

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
          pageSize={10}
          onUpdateExpert={handleUpdate}
        />
      </div>
    </div>
  )
}
