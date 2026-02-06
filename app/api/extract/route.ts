import { generateText, Output } from "ai"
import {
  SYSTEM_PROMPT,
  extractionResultSchema,
  type InputFormat,
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

  let rawLlmText: string | null = null

  console.log("[v0] /api/extract called with format:", format, "content length:", content.length)

  try {
    const result = await generateText({
      model: "openai/gpt-4.1",
      output: Output.object({ schema: extractionResultSchema }),
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPreamble + content }],
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyResult = result as any

    // Capture raw text for debugging
    rawLlmText =
      typeof anyResult.text === "string" ? anyResult.text : null

    console.log("[v0] generateText finished. finishReason:", anyResult.finishReason)
    console.log("[v0] result.object type:", typeof anyResult.object, "is null:", anyResult.object === null)
    console.log("[v0] result.text type:", typeof anyResult.text, "length:", rawLlmText?.length ?? 0)
    console.log("[v0] result.text preview:", rawLlmText?.slice(0, 500) ?? "(none)")

    /* ----- Try to get the structured object ----- */
    let parsed = anyResult.object ?? null

    /* Fallback: if Output.object didn't populate result.object but the
       model DID return valid JSON as text, parse & validate it manually. */
    if (!parsed && anyResult.text) {
      console.log("[v0] object was null, trying manual JSON.parse fallback")
      try {
        const raw = JSON.parse(anyResult.text)
        parsed = extractionResultSchema.parse(raw)
        console.log("[v0] manual parse succeeded, experts count:", parsed?.experts?.length)
      } catch (parseErr) {
        console.log("[v0] manual parse failed:", parseErr instanceof Error ? parseErr.message : String(parseErr))
        // fallback parse failed -- will be caught by the null check below
      }
    }

    if (!parsed) {
      console.log("[v0] returning 502 -- no valid parsed result")
      return Response.json(
        {
          error: "LLM did not return a valid structured response.",
          rawLlmText,
          debug: {
            finishReason: anyResult.finishReason ?? null,
            objectKeys: anyResult.object ? Object.keys(anyResult.object) : null,
          },
        },
        { status: 502 },
      )
    }

    console.log("[v0] extraction succeeded, experts count:", parsed.experts?.length)
    return Response.json({ ...parsed, rawLlmText })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.log("[v0] /api/extract caught error:", message)
    console.log("[v0] rawLlmText at error time:", rawLlmText?.slice(0, 300) ?? "(none)")
    return Response.json(
      {
        error: message,
        rawLlmText,
        debug: {
          stack: err instanceof Error ? err.stack?.slice(0, 1000) : null,
        },
      },
      { status: 500 },
    )
  }
}
