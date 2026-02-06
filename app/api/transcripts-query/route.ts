import { streamText } from "ai"

/* ------------------------------------------------------------------ */
/*  POST /api/transcripts-query                                        */
/*                                                                     */
/*  Accepts a user question + an array of transcript objects, builds   */
/*  a rich prompt with metadata (speaker identity, expert type, etc.)  */
/*  and streams the LLM response back.                                 */
/* ------------------------------------------------------------------ */

interface TranscriptPayload {
  engagement_id: string
  expert_name: string
  expert_company: string
  expert_type: string
  engagement_type: string
  text: string
  uploaded_at: string
}

const EXPERT_TYPE_LABELS: Record<string, string> = {
  customer: "Customer (buys from / uses the target company's products)",
  competitor: "Competitor (works or worked at a competing company)",
  target: "Target (works or worked at the due diligence target company)",
  competitor_customer:
    "Competitor's Customer (customer of a competing company)",
}

function buildTranscriptContext(transcripts: TranscriptPayload[]): string {
  if (transcripts.length === 0) return "No transcripts provided."

  const sections = transcripts.map((t, i) => {
    const typeLabel = EXPERT_TYPE_LABELS[t.expert_type] ?? t.expert_type
    return `--- TRANSCRIPT ${i + 1} of ${transcripts.length} ---
Expert Name: ${t.expert_name}
Company: ${t.expert_company}
Expert Type: ${typeLabel}
Engagement Type: ${t.engagement_type}
Date: ${t.uploaded_at}

${t.text}
--- END TRANSCRIPT ${i + 1} ---`
  })

  return sections.join("\n\n")
}

const SYSTEM_PROMPT = `You are an expert network research analyst assisting a private equity due diligence team. You have been given a set of call transcripts from expert interviews. Each transcript is clearly labelled with the expert's name, company, expert type (customer, competitor, target, or competitor's customer), and the date of the call.

Your job is to answer the user's question based ONLY on the information contained in these transcripts. Follow these rules:

1. ALWAYS cite which expert said what. Use their name, company, and expert type when referencing insights (e.g. "Raj Patel (Customer, Solaris Packaging) noted that...").
2. When quoting, use the expert's exact words in quotation marks and attribute the quote.
3. If multiple transcripts discuss the same topic, synthesise across them and note where experts agree or disagree.
4. If the transcripts do not contain information relevant to the question, say so clearly rather than speculating.
5. Structure your response with clear headings and bullet points for readability when appropriate.
6. Pay attention to each expert's type -- a customer's perspective on a product differs from a competitor's view of the market. Call out these distinctions.
7. If the user asks for quotes, provide them verbatim from the transcript text.`

export async function POST(req: Request) {
  const body = await req.json()
  const { query, transcripts } = body as {
    query: string
    transcripts: TranscriptPayload[]
  }

  if (!query || typeof query !== "string") {
    return Response.json({ error: "Missing query" }, { status: 400 })
  }

  if (!Array.isArray(transcripts) || transcripts.length === 0) {
    return Response.json(
      { error: "No transcripts provided" },
      { status: 400 },
    )
  }

  const transcriptContext = buildTranscriptContext(transcripts)

  const result = streamText({
    model: "openai/gpt-4.1",
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Here are the transcripts to analyse:\n\n${transcriptContext}\n\n---\n\nMy question: ${query}`,
      },
    ],
  })

  return result.toTextStreamResponse()
}
