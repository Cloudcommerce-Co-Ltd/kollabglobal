"use client";

import { use, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Target, Check, Video, Calendar, MessageCircle, CheckCircle, Loader2 } from "lucide-react";
import { fetchCampaign } from "@/lib/brief-api";
import type { CampaignWithRelations } from "@/types/campaign";

interface BriefContent {
  name?: string;
  keys?: string;
  dos?: string;
  deliverables?: string;
  disclosure?: string;
  deadline?: string;
}

function Section({
  icon,
  iconBg,
  title,
  children,
}: {
  icon: ReactNode;
  iconBg: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#e8ecf0] bg-white overflow-hidden mb-4">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-[#e8ecf0] bg-[#fafbfc]">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: iconBg }}
        >
          {icon}
        </div>
        <span className="font-bold text-[#4A4A4A]">{title}</span>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

export default function CampaignBriefPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [campaign, setCampaign] = useState<CampaignWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewLang, setViewLang] = useState<"th" | "tgt">("th");
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaign(id)
      .then(setCampaign)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f7fa]">
        <Loader2 size={24} className="animate-spin text-[#8a90a3]" />
      </div>
    );
  }

  if (!campaign?.brief) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f7fa]">
        <p className="text-[#8a90a3] text-sm">ยังไม่มี Brief</p>
      </div>
    );
  }

  const brief = campaign.brief;
  const isService = campaign.product?.isService ?? false;

  // content = target language version (or Thai if no translation needed)
  // contentTh = Thai version (only exists when translation was done)
  let thContent: BriefContent = {};
  let tgtContent: BriefContent = {};
  const needsTranslation = !!brief.contentTh;

  try {
    tgtContent = JSON.parse(brief.content) as BriefContent;
    thContent = brief.contentTh ? (JSON.parse(brief.contentTh) as BriefContent) : tgtContent;
  } catch {
    thContent = {};
    tgtContent = {};
  }

  const targetLang = {
    code: campaign.country?.languageCode ?? "en",
    name: campaign.country?.languageName ?? "English",
    flag: campaign.country?.flag ?? "🇺🇸",
  };

  const content = viewLang === "tgt" ? tgtContent : thContent;

  async function handleLangSwitch(lang: "th" | "tgt") {
    if (lang === "th") {
      setViewLang("th");
      return;
    }
    setViewLang("tgt");
    // Translation was already generated at brief creation time, no API call needed
    setTranslating(true);
    setTranslateError(null);
    await new Promise((r) => setTimeout(r, 300)); // small visual delay
    setTranslating(false);
  }

  const brandName = campaign.product?.brandName ?? "KOLLAB Global";
  const productName = campaign.product?.productName ?? "สินค้า/บริการ";

  const deadline = content.deadline
    ? new Date(content.deadline).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      {/* Sticky header */}
      <div className="bg-white border-b border-[#e8ecf0] sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => router.push(`/campaigns/${id}`)}
            className="flex items-center gap-1.5 text-sm text-[#8a90a3] hover:text-[#4A4A4A] mb-3 transition-colors"
          >
            <ArrowLeft size={16} />
            กลับไปรายละเอียดแคมเปญ
          </button>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: "#e8f8f7" }}
              >
                📋
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#4A4A4A]">Campaign Brief</h1>
                <div className="flex items-center gap-2 text-sm text-[#8a90a3]">
                  <span>{brandName}</span>
                  {isService && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#e8f0fa] text-[#4A90D9]">
                      บริการ
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {needsTranslation && (
                <div className="flex rounded-xl overflow-hidden border-2 border-[#9B7ED8]/30">
                  {(
                    [
                      ["🇹🇭 ภาษาไทย", "th"],
                      [`${targetLang.flag} ${targetLang.name}`, "tgt"],
                    ] as [string, "th" | "tgt"][]
                  ).map(([label, lang]) => (
                    <button
                      key={lang}
                      onClick={() => handleLangSwitch(lang)}
                      disabled={translating}
                      className="px-3 py-1.5 text-sm font-bold transition-colors disabled:cursor-wait"
                      style={
                        viewLang === lang
                          ? { background: "#9B7ED8", color: "#fff" }
                          : { background: "transparent", color: "#8a90a3" }
                      }
                    >
                      {lang === "tgt" && translating ? "กำลังแปล..." : label}
                    </button>
                  ))}
                </div>
              )}
              <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-[#e8f8f7] text-[#0d9488]">
                <CheckCircle size={13} />
                เผยแพร่แล้ว
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {translateError && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {translateError}
          </div>
        )}

        {translating ? (
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-white border border-[#e8ecf0]">
            <Loader2 size={18} className="animate-spin text-[#9B7ED8] shrink-0" />
            <span className="text-sm font-semibold text-[#9B7ED8]">
              กำลังแปล Brief เป็น {targetLang.name} {targetLang.flag}...
            </span>
          </div>
        ) : (
          <>
            <Section
              icon={<FileText size={17} color="#4A90D9" />}
              iconBg="#e8f0fa"
              title="ข้อมูลพื้นฐาน"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  ["ชื่อแคมเปญ", content.name ?? "-"],
                  ["แบรนด์", brandName],
                  [isService ? "บริการ" : "สินค้า", productName],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-[#8a90a3] font-semibold uppercase mb-1">{label}</p>
                    <p className="text-sm font-semibold text-[#4A4A4A]">{value}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section
              icon={<Target size={17} color="#9B7ED8" />}
              iconBg="#f0ebf8"
              title="Key Messages"
            >
              <p className="text-sm text-[#4A4A4A] leading-relaxed whitespace-pre-wrap">
                {content.keys ?? "ยังไม่มีข้อมูล Brief"}
              </p>
            </Section>

            <Section
              icon={<Check size={17} color="#16a34a" />}
              iconBg="#dcfce7"
              title="Do's & Don'ts"
            >
              <pre className="text-sm text-[#4A4A4A] leading-relaxed whitespace-pre-wrap font-sans">
                {content.dos ?? "ยังไม่มีข้อมูล"}
              </pre>
            </Section>

            <Section
              icon={<Video size={17} color="#4ECDC4" />}
              iconBg="#e8f8f7"
              title="Deliverables"
            >
              <pre className="text-sm text-[#4A4A4A] leading-relaxed whitespace-pre-wrap font-sans">
                {content.deliverables ?? "ยังไม่มีข้อมูล"}
              </pre>
            </Section>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Section
                icon={<Calendar size={17} color="#f59e0b" />}
                iconBg="#fef3c7"
                title="Deadline"
              >
                <p className="text-base font-bold text-[#d97706]">{deadline}</p>
              </Section>
              <Section
                icon={<MessageCircle size={17} color="#4A90D9" />}
                iconBg="#e8f0fa"
                title="Required Disclosure"
              >
                <p className="text-sm font-semibold text-[#4ECDC4] leading-relaxed">
                  {content.disclosure ?? "#ad #sponsored #KOLLABGlobal"}
                </p>
              </Section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
