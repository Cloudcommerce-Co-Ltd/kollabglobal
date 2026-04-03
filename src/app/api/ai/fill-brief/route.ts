import { NextRequest, NextResponse } from "next/server";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { getAIModel, isAIConfigured } from "@/lib/ai";
import { fillBriefSchema } from "@/lib/validations/fill-brief";

const DEFAULT_MOCK_DELIVERABLES =
  "• 1 วิดีโอ TikTok (30-60 วินาที) — รีวิวหรือแนะนำสินค้า โชว์การใช้งานจริง เน้นจุดเด่น\n• 3 Instagram Stories — ภาพนิ่งหรือสั้น ๆ โชว์สินค้า พร้อม Swipe-up link\n• 1 Instagram Reel — คลิปสั้นสนุก เน้น hook แรก 3 วินาที";

const DELIVERABLE_HINTS: Record<string, string> = {
  tiktok: "รีวิว/แนะนำสินค้าจริง โชว์การใช้งาน เน้น hook แรก 3 วินาที ใช้เสียงเทรนด์",
  "ig reel": "คลิปสั้นสนุก เน้น hook แรก 3 วินาที โชว์จุดเด่นสินค้า",
  "ig stories": "ภาพหรือวิดีโอสั้น โชว์สินค้า พร้อม Swipe-up link หรือ tag แบรนด์",
  instagram: "โพสต์ภาพคุณภาพสูง caption เล่าประสบการณ์ tag แบรนด์",
  facebook: "โพสต์รีวิวพร้อมภาพ/วิดีโอ บรรยายประสบการณ์การใช้งาน",
};

function enrichDeliverable(raw: string): string {
  const lower = raw.toLowerCase();
  for (const [key, hint] of Object.entries(DELIVERABLE_HINTS)) {
    if (lower.includes(key)) {
      return `• ${raw} — ${hint}`;
    }
  }
  return `• ${raw}`;
}

function buildMockDeliverables(packageDeliverables?: string[]): string {
  if (packageDeliverables?.length) {
    return packageDeliverables.map(enrichDeliverable).join("\n");
  }
  return DEFAULT_MOCK_DELIVERABLES;
}

export async function POST(req: NextRequest) {
  const raw = await req.json();
  const parsed = fillBriefSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const {
    brandName,
    productName,
    category,
    description,
    sellingPoints,
    isService,
    url,
    countryName,
    platforms,
    packageDeliverables,
    userPrompt,
  } = parsed.data;

  if (!isAIConfigured()) {
    return NextResponse.json({
      keys: "เน้นจุดเด่นของสินค้า — คุณภาพสูง รสชาติอร่อย เหมาะกับทุกโอกาส",
      dos: "DO: แสดงประสบการณ์จริงของคุณกับสินค้า/บริการ\nDO: โชว์จุดเด่นที่น่าสนใจและทำให้ดูน่าใช้\n\nDON'T: เปรียบเทียบกับคู่แข่งโดยตรง\nDON'T: อ้างสรรพคุณเกินจริงหรือสิ่งที่ไม่เป็นความจริง",
      deliverables: buildMockDeliverables(packageDeliverables),
      disclosure: `#ad #sponsored #KOLLABGlobal #${(brandName ?? "Brand").replaceAll(/\s/g, "")}`,
    });
  }

  const entityType = isService ? "บริการ" : "สินค้า";
  const productLines = [
    description ? `รายละเอียด: ${description}` : "",
    sellingPoints ? `จุดเด่น: ${sellingPoints}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const contextLines = [
    countryName ? `ตลาดเป้าหมาย: ${countryName}` : "",
    platforms?.length ? `แพลตฟอร์ม: ${platforms.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const prompt = `คุณคือผู้เชี่ยวชาญด้าน Influencer Marketing ช่วยเขียน Campaign Brief ภาษาไทยสำหรับ:
แบรนด์: ${brandName}
${entityType}: ${productName}
หมวดหมู่: ${category}${productLines ? `\n${productLines}` : ""}
${url ? `URL: ${url}` : ""}
${contextLines ? `\n${contextLines}` : ""}
${packageDeliverables?.length ? `\nข้อกำหนด Deliverables: ต้องครอบคลุมรายการเหล่านี้ [${packageDeliverables.join(", ")}] โดยเพิ่มไอเดียการนำเสนอเข้าไปด้วย` : ""}

${userPrompt ? `\nความต้องการเพิ่มเติมจากแบรนด์: ${userPrompt}\n` : ""}สำคัญมาก: ห้ามใช้ Markdown ทุกชนิด (**bold**, # heading, - bullet, 1. numbered list) ใช้ข้อความธรรมดาเท่านั้น deliverables แต่ละรายการต้องอยู่บรรทัดเดียว เริ่มต้นด้วย •`;

  const briefSchema = z.object({
    keys: z
      .string()
      .describe("ข้อความ Key Messages ที่อยากให้ครีเอเตอร์สื่อสาร ไม่ใช้ Markdown ใช้ข้อความธรรมดาเท่านั้น"),
    dos: z
      .string()
      .describe(
        "Do's และ Don'ts แต่ละข้อขึ้นต้นด้วย 'DO:' หรือ 'DON\\'T:' คั่นด้วย \\n ไม่ใช้ Markdown ไม่ใช้ ** หรือ -"
      ),
    deliverables: z
      .string()
      .describe(
        "แต่ละรายการขึ้นต้นด้วย • และตามด้วยรายละเอียดในบรรทัดเดียว เช่น '• TikTok 1 วิดีโอ (15-60 วิ) — ไอเดีย: รีวิว/แนะนำสินค้า โชว์การใช้งานจริง' คั่นด้วย \\n ไม่ใช้ Markdown ไม่ใช้ ** หรือ # หรือ - หรือเลขลำดับ"
      ),
    disclosure: z.string().describe("แฮชแท็กบังคับที่ต้องใส่ ไม่ใช้ Markdown"),
  });

  try {
    const { output } = await generateText({
      model: getAIModel(),
      output: Output.object({ schema: briefSchema }),
      prompt,
    });

    return NextResponse.json(output);
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      console.error("AI brief generation failed — model did not return valid object:", error.text);
      return NextResponse.json({ error: "Failed to generate brief" }, { status: 500 });
    }
    console.error("AI generation error:", error);
    return NextResponse.json({ error: "Failed to generate brief" }, { status: 500 });
  }
}
