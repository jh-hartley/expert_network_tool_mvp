/* ------------------------------------------------------------------ */
/*  Helmsman – localStorage CRUD layer                                */
/*  Single source of truth: every page reads/writes through here.     */
/* ------------------------------------------------------------------ */

import type { EntityType, EntityMap } from "./types"
import { seedExperts, seedCalls, seedTranscripts, seedSurveys } from "./seed"

const STORAGE_PREFIX = "helmsman_"
const SEEDED_KEY = "helmsman_seeded"

/* ---------- helpers ------------------------------------------------ */

function key(type: EntityType): string {
  return `${STORAGE_PREFIX}${type}`
}

function read<T>(type: EntityType): T[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(key(type))
  if (!raw) return []
  try {
    return JSON.parse(raw) as T[]
  } catch {
    return []
  }
}

function write<T>(type: EntityType, data: T[]): void {
  localStorage.setItem(key(type), JSON.stringify(data))
}

/* ---------- seed on first visit ----------------------------------- */

export function ensureSeeded(): void {
  if (typeof window === "undefined") return
  if (localStorage.getItem(SEEDED_KEY)) return
  write("experts", seedExperts)
  write("calls", seedCalls)
  write("transcripts", seedTranscripts)
  write("surveys", seedSurveys)
  localStorage.setItem(SEEDED_KEY, "1")
}

/* ---------- CRUD -------------------------------------------------- */

export function getAll<K extends EntityType>(type: K): EntityMap[K][] {
  ensureSeeded()
  return read<EntityMap[K]>(type)
}

export function getById<K extends EntityType>(
  type: K,
  id: string,
): EntityMap[K] | undefined {
  return getAll(type).find((r) => (r as { id: string }).id === id)
}

export function upsert<K extends EntityType>(
  type: K,
  record: EntityMap[K],
): void {
  const list = getAll(type) as Array<EntityMap[K] & { id: string }>
  const idx = list.findIndex((r) => r.id === (record as { id: string }).id)
  if (idx >= 0) {
    list[idx] = record as EntityMap[K] & { id: string }
  } else {
    list.push(record as EntityMap[K] & { id: string })
  }
  write(type, list)
}

export function remove<K extends EntityType>(type: K, id: string): void {
  const list = getAll(type) as Array<EntityMap[K] & { id: string }>
  write(
    type,
    list.filter((r) => r.id !== id),
  )
}

/* ---------- bulk operations --------------------------------------- */

export function resetAll(): void {
  const types: EntityType[] = ["experts", "calls", "transcripts", "surveys"]
  types.forEach((t) => localStorage.removeItem(key(t)))
  localStorage.removeItem(SEEDED_KEY)
  ensureSeeded()
}

export function exportJSON(): string {
  return JSON.stringify(
    {
      experts: getAll("experts"),
      calls: getAll("calls"),
      transcripts: getAll("transcripts"),
      surveys: getAll("surveys"),
      exportedAt: new Date().toISOString(),
    },
    null,
    2,
  )
}

export function importJSON(json: string): { success: boolean; error?: string } {
  try {
    const data = JSON.parse(json)
    if (data.experts) write("experts", data.experts)
    if (data.calls) write("calls", data.calls)
    if (data.transcripts) write("transcripts", data.transcripts)
    if (data.surveys) write("surveys", data.surveys)
    return { success: true }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

/* ---------- unique id generator ----------------------------------- */

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
