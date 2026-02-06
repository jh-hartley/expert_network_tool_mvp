/* ------------------------------------------------------------------ */
/*  Helmsman -- Reusable client-side LLM API caller                   */
/*  Use this from any page / component to invoke server-side LLM      */
/*  extraction endpoints without duplicating fetch logic.             */
/* ------------------------------------------------------------------ */

import type { ExtractionResult, InputFormat } from "@/lib/llm"

export interface ExtractionResponse {
  result: ExtractionResult
  /** The raw text the LLM returned (for debugging) */
  rawLlmText: string | null
}

export interface ExtractionError {
  message: string
  /** The raw text the LLM returned (may be present even on error) */
  rawLlmText: string | null
  debug: Record<string, unknown> | null
}

/**
 * Call the /api/extract endpoint and return typed extraction results
 * along with the raw LLM text for debugging.
 * Throws an ExtractionError on network or server errors.
 */
export async function extractExperts(
  content: string,
  format: InputFormat,
): Promise<ExtractionResponse> {
  const res = await fetch("/api/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, format }),
  })

  const body = await res.json().catch(() => ({})) as Record<string, unknown>

  if (!res.ok) {
    const err: ExtractionError = {
      message:
        (body.error as string) ?? `Extraction failed (${res.status})`,
      rawLlmText: (body.rawLlmText as string) ?? null,
      debug: (body.debug as Record<string, unknown>) ?? null,
    }
    throw err
  }

  // Successful response -- extract the rawLlmText and pass through the rest
  const rawLlmText = (body.rawLlmText as string) ?? null
  // Remove rawLlmText from the extraction result object
  const { rawLlmText: _discard, ...rest } = body
  return {
    result: rest as unknown as ExtractionResult,
    rawLlmText,
  }
}
