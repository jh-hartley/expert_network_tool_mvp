/* ------------------------------------------------------------------ */
/*  Helmsman – canonical data types                                   */
/* ------------------------------------------------------------------ */

export type ComplianceStatus = "cleared" | "pending" | "blocked"

export type Network = "GLG" | "AlphaSights" | "Third Bridge" | "Guidepoint" | "Direct"

export type Industry =
  | "Technology"
  | "Healthcare"
  | "Energy"
  | "Finance"
  | "Consumer"

export interface Expert {
  id: string
  name: string
  title: string
  company: string
  industry: Industry
  network: Network
  compliance: ComplianceStatus
  complianceNote?: string
  email?: string
  phone?: string
  tags: string[]
  callCount: number
  createdAt: string   // ISO-8601
  updatedAt: string   // ISO-8601
}

export type CallStatus = "scheduled" | "completed" | "cancelled" | "no-show"

export interface Call {
  id: string
  expertId: string
  expertName: string
  date: string        // ISO-8601
  duration: number    // minutes, 0 if not yet completed
  project: string
  status: CallStatus
  cost: number        // USD cents
  notes?: string
  transcriptId?: string
  createdAt: string
  updatedAt: string
}

export interface Transcript {
  id: string
  callId: string
  expertName: string
  date: string
  summary: string
  fullText: string
  keyTopics: string[]
  createdAt: string
}

export type SurveyStatus = "draft" | "in-progress" | "completed"

export interface AISurvey {
  id: string
  name: string
  topic: string
  status: SurveyStatus
  sentTo: number      // count of experts
  responses: number
  avgNps: number | null
  createdAt: string
  updatedAt: string
}

/* Union type for the storage layer */
export type EntityType = "experts" | "calls" | "transcripts" | "surveys"

export type EntityMap = {
  experts: Expert
  calls: Call
  transcripts: Transcript
  surveys: AISurvey
}
