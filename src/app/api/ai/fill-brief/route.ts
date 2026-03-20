import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { getAIModel, isAIConfigured } from "@/lib/ai";

const MOCK_BRIEF = {
  keys: "เน้นจุดเด่นของสินค้า — คุณภาพสูง รสชาติอร่อย เหมาะกับทุกโอกาส",
  dos: "DO: แสดงประสบการณ์จริงของคุณกับสินค้า/บริการ\nDO: โชว์จุดเด่นที่น่าสนใจและทำให้ดูน่าใช้\n\nDON'T: เปรียบเทียบกับคู่แข่งโดยตรง\nDON'T: อ้างสรรพคุณเกินจริงหรือสิ่งที่ไม่เป็นความจริง",
  deliverables:
    "• 1 วิดีโอ TikTok (30-60 วินาที) รีวิวหรือแนะนำ\n• 3 Instagram Stories (มีลิงก์สวายป์อัพ)\n• 1 Instagram Reel",
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { brandName, productName, category, description, sellingPoints, isService, url } = body;

  if (!isAIConfigured()) {
    return NextResponse.json({
      ...MOCK_BRIEF,
      disclosure: `#ad #sponsored #KOLLABGlobal #${(brandName ?? "Brand").replace(/\s/g, "")}`,
    });
  }

  const entityType = isService ? "บริการ" : "สินค้า";
  const prompt = `คุณเป็น AI ผู้เชี่ยวชาญด้านการตลาดอินฟลูเอนเซอร์ ช่วยสร้าง Campaign Brief สำหรับแคมเปญนี้:

แบรนด์: ${brandName}
${entityType}: ${productName}
หมวดหมู่: ${category}
รายละเอียด: ${description}
จุดเด่น: ${sellingPoints}
${url ? `URL: ${url}` : ""}

สร้าง Brief เป็นภาษาไทย ในรูปแบบ JSON ที่มี 4 keys เท่านั้น ทุก value ต้องเป็น string ธรรมดา (ไม่ใช่ object หรือ array):
{
  "keys": "ข้อความ Key Messages เขียนติดกันเป็น paragraph หรือใช้ขึ้นบรรทัดใหม่แทน bullet",
  "dos": "Do's และ Don'ts เขียนเป็น string เดียว ใช้ขึ้นบรรทัดใหม่คั่นแต่ละข้อ เช่น DO: ... \\nDO: ... \\n\\nDON'T: ...",
  "deliverables": "รายการ deliverables เขียนเป็น string เดียว ใช้ • และขึ้นบรรทัดใหม่คั่น",
  "disclosure": "#hashtags #ที่ต้องใส่"
}

กฎสำคัญ: ห้ามใช้ nested object หรือ array ใน value ทุก value ต้องเป็น string เท่านั้น ตอบเป็น JSON เท่านั้น ไม่ต้องมีข้อความอื่น`;

  const { text } = await generateText({ model: getAIModel(), prompt });

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  const raw = JSON.parse(jsonMatch[0]) as Record<string, unknown>;

  // Normalize: flatten any nested objects/arrays to plain strings
  const result = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [
      k,
      typeof v === "string" ? v : JSON.stringify(v),
    ])
  );

  return NextResponse.json(result);
}
