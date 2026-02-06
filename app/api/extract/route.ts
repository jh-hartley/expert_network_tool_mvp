import { generateText, Output } from "ai"
import {
  SYSTEM_PROMPT,
  extractionResultSchema,
  type InputFormat,
  type ExtractionResult,
} from "@/lib/llm"

export async function POST(req: Request) {
  const body = await req.json()
  const { content, format } = body as { content: string; format: InputFormat }

  if (!content || typeof content !== "string") {
    return Response.json({ error: "Missing content" }, { status: 400 })
  }

  const userPreamble =
    format === "email"
      ? "The following is an email from an expert network containing expert recommendations. Extract all expert profiles:\n\n"
      : "The following is unstructured text containing expert recommendations. Extract all expert profiles:\n\n"

  try {
    const result = await generateText({
      model: "openai/gpt-4.1",
      output: Output.object({ schema: extractionResultSchema }),
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPreamble + content }],
    })

    /* ----- Try to get the structured object ----- */
    let parsed: ExtractionResult | null =
      (result.object as ExtractionResult | undefined) ?? null

    /* Fallback: if Output.object didn't populate result.object but the
       model DID return valid JSON as text, parse & validate it manually. */
    if (!parsed && result.text) {
      try {
        const raw = JSON.parse(result.text)
        parsed = extractionResultSchema.parse(raw)
      } catch (parseErr) {
        console.error(
          "[v0] Fallback JSON parse failed:",
          parseErr instanceof Error ? parseErr.message : parseErr,
        )
      }
    }

    if (!parsed) {
      return Response.json(
        {
          error: "LLM did not return a valid structured response.",
          debug: {
            textPreview: result.text?.slice(0, 1000) ?? null,
            finishReason: result.finishReason ?? null,
          },
        },
        { status: 502 },
      )
    }

    return Response.json(parsed)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    const stack = err instanceof Error ? err.stack : undefined
    console.error("[v0] Extract API error:", message, stack)
    return Response.json(
      {
        error: message,
        debug: { stack: stack?.slice(0, 1000) ?? null },
      },
      { status: 500 },
    )
  }
}
