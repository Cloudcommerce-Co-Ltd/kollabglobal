import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { getAIModel, isAIConfigured } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { fields, targetLang, targetLangName } = body;

  if (!isAIConfigured()) {
    return NextResponse.json(fields);
  }

  const fieldsJson = JSON.stringify(fields, null, 2);
  const prompt = `แปลข้อความต่อไปนี้จากภาษาไทยเป็น${targetLangName} (${targetLang}):

${fieldsJson}

ตอบเป็น JSON โดยใช้ key เดิม แต่เปลี่ยนค่าเป็น${targetLangName} เท่านั้น ไม่ต้องมีข้อความอื่น`;

  const { text } = await generateText({ model: getAIModel(), prompt });

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  const result = JSON.parse(jsonMatch[0]);
  return NextResponse.json(result);
}
