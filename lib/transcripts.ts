/* ------------------------------------------------------------------ */
/*  Helmsman -- Transcript storage                                     */
/*                                                                     */
/*  Transcripts are stored in localStorage keyed by engagement ID.     */
/*  Each transcript carries the expert name, company, and expert type  */
/*  so they can be queried/filtered independently.                     */
/* ------------------------------------------------------------------ */

export interface Transcript {
  /** The engagement record ID this transcript belongs to */
  engagement_id: string
  /** Expert name (for searching/filtering) */
  expert_name: string
  /** Expert company */
  expert_company: string
  /** Expert type: customer | competitor | target | competitor_customer */
  expert_type: string
  /** "call" or "survey" */
  engagement_type: "call" | "survey"
  /** Raw transcript text */
  text: string
  /** ISO date when the transcript was uploaded */
  uploaded_at: string
}

/* ------------------------------------------------------------------ */
/*  localStorage persistence                                           */
/* ------------------------------------------------------------------ */

const LS_KEY = "helmsman_transcripts"

function readAll(): Transcript[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as Transcript[]) : []
  } catch {
    return []
  }
}

function writeAll(transcripts: Transcript[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(LS_KEY, JSON.stringify(transcripts))
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/** Get a transcript by engagement ID, or null if none exists. */
export function getTranscript(engagementId: string): Transcript | null {
  return readAll().find((t) => t.engagement_id === engagementId) ?? null
}

/** Get all transcripts (optionally filtered). */
export function getTranscripts(filters?: {
  expert_name?: string
  expert_type?: string
  engagement_type?: "call" | "survey"
}): Transcript[] {
  let list = readAll()
  if (filters?.expert_name) {
    const q = filters.expert_name.toLowerCase()
    list = list.filter(
      (t) =>
        t.expert_name.toLowerCase().includes(q) ||
        t.expert_company.toLowerCase().includes(q),
    )
  }
  if (filters?.expert_type) {
    list = list.filter((t) => t.expert_type === filters.expert_type)
  }
  if (filters?.engagement_type) {
    list = list.filter((t) => t.engagement_type === filters.engagement_type)
  }
  return list
}

/** Save or update a transcript for a given engagement. */
export function saveTranscript(transcript: Transcript): void {
  const all = readAll()
  const idx = all.findIndex((t) => t.engagement_id === transcript.engagement_id)
  if (idx >= 0) {
    all[idx] = transcript
  } else {
    all.push(transcript)
  }
  writeAll(all)
}

/** Delete a transcript by engagement ID. */
export function deleteTranscript(engagementId: string): void {
  writeAll(readAll().filter((t) => t.engagement_id !== engagementId))
}

/** Check if a transcript exists for a given engagement ID. */
export function hasTranscript(engagementId: string): boolean {
  return readAll().some((t) => t.engagement_id === engagementId)
}

/** Get a map of engagement_id -> true for all engagements that have transcripts. */
export function getTranscriptMap(): Set<string> {
  return new Set(readAll().map((t) => t.engagement_id))
}
