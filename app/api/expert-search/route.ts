import { streamText } from "ai"

/* ------------------------------------------------------------------ */
/*  POST /api/expert-search                                            */
/*                                                                     */
/*  Accepts a natural-language description of what the user is looking */
/*  for in an expert + the full expert profiles database, then asks    */
/*  OpenAI to recommend the best matches (or none if nobody fits).     */
/* ------------------------------------------------------------------ */

interface ExpertPayload {
  name: string
  role: string
  original_role: string
  company: string
  expert_type: string
  former: boolean
  date_left: string
  price: number | null
  network: string
  industry_guess: string
  fte_estimate: string
  additional_info: string
  screener_vendors_evaluated: string | null
  screener_vendor_selection_driver: string | null
  screener_vendor_satisfaction: string | null
  screener_switch_trigger: string | null
  screener_competitive_landscape: string | null
  screener_losing_deals_to: string | null
  screener_pricing_comparison: string | null
  screener_rd_investment: string | null
}

const EXPERT_TYPE_LABELS: Record<string, string> = {
  customer: "Customer (buys/uses the target company's products)",
  competitor: "Competitor (works or worked at a competing company)",
  target: "Target (works or worked at the due diligence target company)",
  competitor_customer: "Competitor's Customer",
}

function buildExpertContext(experts: ExpertPayload[]): string {
  if (experts.length === 0) return "No experts in the database."

  return experts
    .map((e, i) => {
      const typeLabel = EXPERT_TYPE_LABELS[e.expert_type] ?? e.expert_type
      const screenerLines: string[] = []

      // Include screener answers if they exist
      if (e.screener_vendors_evaluated && e.screener_vendors_evaluated !== "Not answered")
        screenerLines.push(`  Vendors Evaluated: ${e.screener_vendors_evaluated}`)
      if (e.screener_vendor_selection_driver && e.screener_vendor_selection_driver !== "Not answered")
        screenerLines.push(`  Vendor Selection Driver: ${e.screener_vendor_selection_driver}`)
      if (e.screener_vendor_satisfaction && e.screener_vendor_satisfaction !== "Not answered")
        screenerLines.push(`  Vendor Satisfaction: ${e.screener_vendor_satisfaction}`)
      if (e.screener_switch_trigger && e.screener_switch_trigger !== "Not answered")
        screenerLines.push(`  Switch Trigger: ${e.screener_switch_trigger}`)
      if (e.screener_competitive_landscape && e.screener_competitive_landscape !== "Not answered")
        screenerLines.push(`  Competitive Landscape: ${e.screener_competitive_landscape}`)
      if (e.screener_losing_deals_to && e.screener_losing_deals_to !== "Not answered")
        screenerLines.push(`  Losing Deals To: ${e.screener_losing_deals_to}`)
      if (e.screener_pricing_comparison && e.screener_pricing_comparison !== "Not answered")
        screenerLines.push(`  Pricing Comparison: ${e.screener_pricing_comparison}`)
      if (e.screener_rd_investment && e.screener_rd_investment !== "Not answered")
        screenerLines.push(`  R&D Investment: ${e.screener_rd_investment}`)

      const screener = screenerLines.length > 0 ? `\n  Screening Responses:\n${screenerLines.join("\n")}` : ""

      return `--- EXPERT ${i + 1} of ${experts.length} ---
Name: ${e.name}
Role: ${e.original_role}
Company: ${e.company}
Expert Type: ${typeLabel}
Former Employee: ${e.former ? `Yes (left ${e.date_left})` : "No (current)"}
Industry: ${e.industry_guess}
Est. Company Size: ${e.fte_estimate}
Network: ${e.network}
Rate: ${e.price != null ? `$${e.price}/hr` : "Not specified"}
Additional Info: ${e.additional_info}${screener}`
    })
    .join("\n\n")
}

const SYSTEM_PROMPT = `You are an expert network research analyst helping a private equity due diligence team find the right expert to speak with. You have access to a database of expert profiles, each with their background, screening responses, and metadata.

Your job is to evaluate the user's natural language description of what they are looking for and recommend the best matching expert(s) from the database. Follow these rules:

1. RANK your recommendations from best to worst fit. For each recommendation, explain specifically WHY this expert matches what the user is looking for, referencing their actual background, screening answers, and experience.

2. If NO expert in the database is a good fit for what the user is looking for, say so clearly. Do not force-fit a recommendation. Explain what type of expert they should look for instead.

3. Consider all dimensions of fit: industry experience, seniority, specific domain knowledge, screening responses, and relevance to the stated need.

4. For each recommended expert, include:
   - Their name and role
   - Their company and expert type
   - Their rate and network
   - A clear explanation of why they are a good match
   - Any caveats or limitations (e.g. "has not been screened yet", "former employee so perspective may be dated")

5. Use clear formatting with headings and bullet points for readability.

6. If the user's query is ambiguous, address multiple interpretations and recommend accordingly.

7. Never fabricate information about an expert. Only reference what is in their profile data.`

export async function POST(req: Request) {
  const body = await req.json()
  const { query, experts } = body as {
    query: string
    experts: ExpertPayload[]
  }

  if (!query || typeof query !== "string") {
    return Response.json({ error: "Missing query" }, { status: 400 })
  }

  if (!Array.isArray(experts) || experts.length === 0) {
    return Response.json(
      { error: "No experts provided" },
      { status: 400 },
    )
  }

  const expertContext = buildExpertContext(experts)

  const result = streamText({
    model: "openai/gpt-4.1",
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Here is the expert database:\n\n${expertContext}\n\n---\n\nWhat I'm looking for: ${query}`,
      },
    ],
  })

  return result.toTextStreamResponse()
}
