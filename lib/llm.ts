/* ------------------------------------------------------------------ */
/*  Helmsman -- LLM extraction helpers                                */
/*  Reusable prompt-building and schema definitions for structured    */
/*  expert extraction from unstructured text.                         */
/* ------------------------------------------------------------------ */

import { z } from "zod"

/* ------------------------------------------------------------------ */
/*  Expert extraction Zod schema (used by AI SDK Output.object())     */
/* ------------------------------------------------------------------ */

export const extractedExpertSchema = z.object({
  name: z.string(),
  role: z.string(),
  original_role: z.string(),
  company: z.string(),
  expert_type: z.enum(["customer", "competitor", "target", "competitor_customer"]),
  former: z.boolean(),
  date_left: z.string(),
  price: z.number().nullable(),
  network: z.string(),
  industry_guess: z.string(),
  fte_estimate: z.string(),
  screener_vendors_evaluated: z.string().nullable(),
  screener_vendor_selection_driver: z.string().nullable(),
  screener_vendor_satisfaction: z.string().nullable(),
  screener_switch_trigger: z.string().nullable(),
  screener_competitive_landscape: z.string().nullable(),
  screener_losing_deals_to: z.string().nullable(),
  screener_pricing_comparison: z.string().nullable(),
  screener_rd_investment: z.string().nullable(),
  additional_info: z.string(),
})

export const extractionResultSchema = z.object({
  experts: z.array(extractedExpertSchema),
})

/* ------------------------------------------------------------------ */
/*  Expert extraction TypeScript interface                             */
/* ------------------------------------------------------------------ */

export interface ExtractedExpert {
  name: string
  role: string                     // anonymised title for client-safe sharing
  original_role: string            // actual title from source (internal only)
  company: string
  expert_type: "customer" | "competitor" | "target" | "competitor_customer"
  former: boolean                  // true if the role is a past position
  date_left: string                // ISO date or "N/A" if current
  price: number | null             // USD per hour, null if not specified
  network: string                  // e.g. AlphaSights, GLG, Third Bridge
  industry_guess: string           // LLM-estimated industry for the company
  fte_estimate: string             // LLM-estimated headcount band e.g. "500-1000"

  /* Customer screener answers (null for non-customer types) */
  screener_vendors_evaluated: string | null
  screener_vendor_selection_driver: string | null
  screener_vendor_satisfaction: string | null
  screener_switch_trigger: string | null

  /* Competitor screener answers (null for non-competitor types) */
  screener_competitive_landscape: string | null
  screener_losing_deals_to: string | null
  screener_pricing_comparison: string | null
  screener_rd_investment: string | null

  additional_info: string          // anything that doesn't fit the screeners
}

export interface ExtractionResult {
  experts: ExtractedExpert[]
}

/* ------------------------------------------------------------------ */
/*  System prompt                                                      */
/* ------------------------------------------------------------------ */

export const SYSTEM_PROMPT = `You are a structured data extraction assistant for an expert network management tool used by private equity deal teams.

Your task: read through the provided raw text (which may be an email body, pasted notes, or any unstructured content from an expert network) and extract a list of expert profiles in a unified JSON schema.

For EACH expert found, return a JSON object with the following fields:

REQUIRED FIELDS
- "name" (string): The expert's full name as written in the source.
- "role" (string): An ANONYMISED version of their job title. Change it enough that a reader cannot search the exact title + company and identify the person, but keep it semantically accurate. For example "VP of Plant Engineering" -> "Senior Engineering Leader", "Former COO" -> "Former Chief Operations Executive".
- "original_role" (string): The exact job title as written in the source (kept for internal reference only).
- "company" (string): The company the expert is (or was) associated with.
- "expert_type" (string): One of "customer", "competitor", "target", or "competitor_customer". Classify based on the context:
    - "customer" = someone who buys from or uses the target company's products/services
    - "competitor" = someone who works (or worked) at a competing company
    - "target" = someone who works (or worked) at the DD target company itself
    - "competitor_customer" = a customer of a competitor (rare, use only if explicitly stated)
- "former" (boolean): true if the expert's relevant role is a past position (look for words like "former", "ex-", "departed", "left", past-tense descriptions).
- "date_left" (string): If "former" is true, provide the departure date in "YYYY-MM" format if available, or "Unknown" if the date is not specified. If "former" is false, return "N/A".
- "price" (number or null): The hourly rate in USD. Parse from the text (look for "Rate:", "Hourly rate:", "$X/hr", "$X per hour", etc.). Return null if not specified.
- "network" (string): The expert network that sourced this expert (e.g. "AlphaSights", "GLG", "Third Bridge", "Guidepoint"). Infer from the document context or explicit mentions.
- "industry_guess" (string): Your best estimate of the industry sector for the expert's company. Use categories like "Industrial Automation", "Food & Beverage Manufacturing", "Specialty Metals", "Chemicals", "Paper & Packaging", "Automotive Components", etc.
- "fte_estimate" (string): Your best estimate of the number of full-time employees at the expert's company. Use ranges like "<100", "100-500", "500-1,000", "1,000-5,000", "5,000-10,000", "10,000-50,000", "50,000+". Base this on any revenue, plant count, or scale clues in the text.

SCREENER QUESTIONS -- CUSTOMER TYPE
Only populate these if expert_type is "customer". Set to null for other types.
- "screener_vendors_evaluated" (string|null): Answer to "Which vendors have you evaluated in the last 24 months?"
- "screener_vendor_selection_driver" (string|null): Answer to "What drove your most recent vendor selection?"
- "screener_vendor_satisfaction" (string|null): Answer to "How would you rate your satisfaction with your current vendor (1-10)?"
- "screener_switch_trigger" (string|null): Answer to "What would trigger you to switch providers?"

SCREENER QUESTIONS -- COMPETITOR TYPE
Only populate these if expert_type is "competitor" or "target". Set to null for other types.
- "screener_competitive_landscape" (string|null): Answer to "How do you view the competitive landscape in industrial controls?"
- "screener_losing_deals_to" (string|null): Answer to "Which competitors are you losing deals to most often?"
- "screener_pricing_comparison" (string|null): Answer to "How does your pricing compare to mid-market players?"
- "screener_rd_investment" (string|null): Answer to "Where are you investing in R&D over the next 2 years?"

CATCH-ALL
- "additional_info" (string): Any relevant information from the profile that does not fit into the screener columns above. Include compliance notes, geographic info, background highlights, or anything else useful. If nothing extra, return an empty string.

RULES
1. Extract ALL experts mentioned in the text. Do not skip any.
2. If a screener question was asked but the expert did not answer, put "Not answered" for that field.
3. If a screener question was not asked for that expert type, put null.
4. Preserve the exact wording of screener answers (including quotes) where possible.
5. For the anonymised role, ensure it cannot be reverse-searched but retains the seniority level and functional area.
6. Return ONLY a JSON object with a single key "experts" containing an array of expert objects. No markdown, no extra text.
7. If you cannot find any experts, return {"experts": []}.`

/* ------------------------------------------------------------------ */
/*  Payload builder                                                    */
/* ------------------------------------------------------------------ */

export type InputFormat = "csv" | "email" | "raw-text"

export interface LlmPayload {
  model: string
  messages: Array<{ role: string; content: string }>
  response_format: { type: string }
}

/**
 * Build the LLM API payload for expert extraction.
 * The content should be the raw text / email body to parse.
 */
export function buildExtractionPayload(
  content: string,
  format: InputFormat,
): LlmPayload {
  const userPreamble =
    format === "email"
      ? "The following is an email from an expert network containing expert recommendations. Extract all expert profiles:\n\n"
      : "The following is unstructured text containing expert recommendations. Extract all expert profiles:\n\n"

  return {
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPreamble + content },
    ],
    response_format: { type: "json_object" },
  }
}

/**
 * Validate that a parsed JSON object conforms to the ExtractionResult shape.
 * Returns the typed result or null if invalid.
 */
export function validateExtractionResult(
  data: unknown,
): ExtractionResult | null {
  if (!data || typeof data !== "object") return null
  const obj = data as Record<string, unknown>
  if (!Array.isArray(obj.experts)) return null
  // Basic shape check on first item
  if (obj.experts.length > 0) {
    const first = obj.experts[0] as Record<string, unknown>
    if (typeof first.name !== "string" || typeof first.company !== "string") {
      return null
    }
  }
  return data as ExtractionResult
}
