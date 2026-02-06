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

  try {
    const result = await generateText({
      model: "openai/gpt-4.1",
      output: Output.object({ schema: extractionResultSchema }),
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPreamble + content }],
    })

    console.log("[v0] generateText finished. Has object:", !!result.object)
    console.log("[v0] Raw text response:", result.text?.slice(0, 500))

    if (!result.object) {
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

    return Response.json(result.object)
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
