/* ------------------------------------------------------------------ */
/*  Helmsman -- Reusable client-side LLM API caller                   */
/*  Use this from any page / component to invoke server-side LLM      */
/*  extraction endpoints without duplicating fetch logic.             */
/* ------------------------------------------------------------------ */

import type { ExtractionResult, InputFormat } from "@/lib/llm"

/**
 * Call the /api/extract endpoint and return typed extraction results.
 * Throws on network or server errors with a descriptive message.
 */
export async function extractExperts(
  content: string,
  format: InputFormat,
): Promise<ExtractionResult> {
  const res = await fetch("/api/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, format }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as {
      error?: string
      debug?: Record<string, unknown>
    }
    const debugStr = body.debug
      ? `\n\nDebug: ${JSON.stringify(body.debug, null, 2)}`
      : ""
    throw new Error(
      (body.error ?? `Extraction failed (${res.status})`) + debugStr,
    )
  }

  return res.json() as Promise<ExtractionResult>
}
