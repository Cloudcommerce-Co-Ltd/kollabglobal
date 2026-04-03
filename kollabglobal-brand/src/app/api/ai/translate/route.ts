import { NextRequest, NextResponse } from "next/server";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { getAIModel, isAIConfigured } from "@/lib/ai";
import { translateSchema } from "@/lib/validations/translate";

export async function POST(req: NextRequest) {
  const raw = await req.json();
  const parsed = translateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const { fields, targetLang, targetLangName } = parsed.data;

  if (!isAIConfigured()) {
    return NextResponse.json(fields);
  }

  const fieldsJson = JSON.stringify(fields, null, 2);
  const prompt = `แปลข้อความต่อไปนี้จากภาษาไทยเป็น${targetLangName} (${targetLang}) โดยใช้ key เดิม แต่เปลี่ยนค่าเป็น${targetLangName}:

${fieldsJson}`;

  const fieldKeys = Object.keys(fields);
  const translateOutputSchema = z.object(
    Object.fromEntries(fieldKeys.map((k) => [k, z.string()])) as Record<string, z.ZodString>
  );

  try {
    const { output } = await generateText({
      model: getAIModel(),
      output: Output.object({ schema: translateOutputSchema }),
      prompt,
    });

    return NextResponse.json(output);
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      console.error("AI translation failed — model did not return valid object:", error.text);
      return NextResponse.json({ error: "Failed to translate brief" }, { status: 500 });
    }
    console.error("AI translation error:", error);
    return NextResponse.json({ error: "Failed to translate brief" }, { status: 500 });
  }
}
