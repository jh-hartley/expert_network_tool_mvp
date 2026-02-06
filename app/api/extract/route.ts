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

  const result = await generateText({
    model: "openai/gpt-4o",
    output: Output.object({ schema: extractionResultSchema }),
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPreamble + content }],
  })

  if (!result.object) {
    return Response.json(
      { error: "LLM did not return a valid structured response." },
      { status: 502 },
    )
  }

  return Response.json(result.object)
}
