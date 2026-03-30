"use client";

import { useState, use, useRef, useEffect as useEffectHook } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Video,
  Send,
  CheckCircle,
  Sparkles,
  Calendar,
  Languages,
  Target,
  Package,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ReactCountryFlag from "react-country-flag";
import { isBriefContentFilled, canPublishBrief } from "@/lib/brief-utils";
import {
  fetchCampaign,
  fillBriefAI,
  translateBrief,
  publishBrief,
} from "@/lib/brief-api";
import type { BriefForm, TranslatedFields } from "@/types/brief";
import type { CampaignWithRelations } from "@/types/campaign";
import { useEffect } from "react";
import { Field, Input } from "@base-ui/react";

type LangOption = { code: string; name: string; countryCode: string };

function LangDropdown({
  options,
  value,
  onChange,
  disabled,
}: {
  options: LangOption[];
  value: LangOption | null;
  onChange: (lang: LangOption | null) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffectHook(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          if (!disabled) setOpen((o) => !o);
        }}
        className={`flex min-w-36 items-center gap-2 rounded-[10px] border-[1.5px] border-border-ui bg-white px-3 py-1.5 text-sm outline-none focus:border-brand ${
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        }`}
      >
        {value ? (
          <>
            <ReactCountryFlag
              countryCode={value.countryCode}
              svg
              className="w-4! h-4! rounded-sm shrink-0"
            />
            <span className="flex-1 text-left">{value.name}</span>
          </>
        ) : (
          <span className="flex-1 text-left text-muted-text">
            -- เลือกภาษา --
          </span>
        )}
        <span className="text-muted-text">▾</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 min-w-full overflow-hidden rounded-[10px] border border-border-ui bg-white shadow-lg">
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            className="w-full px-3 py-2 text-left text-sm text-muted-text hover:bg-surface"
          >
            -- เลือกภาษา --
          </button>
          {options.map((lang) => (
            <button
              key={lang.countryCode}
              type="button"
              onClick={() => {
                onChange(lang);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface ${
                value?.countryCode === lang.countryCode
                  ? "bg-brand-light font-semibold"
                  : ""
              }`}
            >
              <ReactCountryFlag
                countryCode={lang.countryCode}
                svg
                className="w-4! h-4! rounded-sm shrink-0"
              />
              {lang.name}{" "}
              {lang.name.toLocaleLowerCase() === "english" &&
                (lang.countryCode.toLocaleLowerCase() === "us"
                  ? "(US)"
                  : "(UK)")}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CreateBriefPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [campaign, setCampaign] = useState<CampaignWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError] = useState<string | null>(null);

  const [form, setForm] = useState<BriefForm>({
    name: "",
    keys: "",
    dos: "",
    deliverables: "",
    disclosure: "",
    deadline: "",
  });
  const [translatedForm, setTranslatedForm] = useState<TranslatedFields>({
    keys: "",
    dos: "",
    deliverables: "",
    disclosure: "",
    name: "",
  });
  const [aiTranslated, setAiTranslated] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [targetLang, setTargetLang] = useState<{
    code: string;
    name: string;
    countryCode: string;
  } | null>(null);
  const [translateError, setTranslateError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiFilled, setAiFilled] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isOpenAIPrompt, setIsOpenAIPrompt] = useState(false);
  const [aiBriefPrompt, setAIBriefPrompt] = useState("");

  useEffect(() => {
    fetchCampaign(id)
      .then((data) => {
        setCampaign(data);
        setForm((f) => ({
          ...f,
          name: data.products?.[0]?.productName ?? "",
        }));
        setLoading(false);
      })
      .catch(() => {
        router.replace("/campaigns");
      });
  }, [id, router]);

  const product = campaign?.products?.[0] ?? null;
  const isService = product?.isService ?? false;
  const platforms = campaign?.package?.platforms ?? [];
  const campaignDeliverables = campaign?.package?.deliverables ?? [];
  const aiBriefPromptMax = 500;

  const availableLanguages = (() => {
    if (!campaign?.creators) return [];
    const langNames = new Intl.DisplayNames(["en"], { type: "language" });
    const seen = new Set<string>();
    const langs: { code: string; name: string; countryCode: string }[] = [];
    for (const cc of campaign.creators) {
      const creatorCountryCode = cc.creator.countryCode;
      if (!creatorCountryCode) continue;
      if (seen.has(creatorCountryCode)) continue;
      try {
        const languageCode = new Intl.Locale(
          `und-${creatorCountryCode}`,
        ).maximize().language;
        if (languageCode === "th") continue;
        const languageName = langNames.of(languageCode) ?? languageCode;
        seen.add(creatorCountryCode);
        langs.push({
          code: languageCode,
          name: languageName,
          countryCode: creatorCountryCode,
        });
      } catch {
        // skip creators with unresolvable country codes
      }
    }
    return langs;
  })();

  const isContentFilled = isBriefContentFilled(form);
  const isDeadlineFilled = !!form.deadline;
  const hasLanguageOptions = availableLanguages.length > 0;
  const needsTranslation = hasLanguageOptions;
  const canPublish = canPublishBrief(form, needsTranslation, aiTranslated);

  function openAIPromptModal() {
    if (!product || !campaign) return;
    setIsOpenAIPrompt(true);
  }
  
  function closeAIPromptModal() {
    setIsOpenAIPrompt(false);
  }

  async function fillAI() {
    if (!product || !campaign) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const data = await fillBriefAI(product, {
        countryName: campaign.country?.name,
        platforms,
        packageDeliverables: campaignDeliverables,
        userPrompt: aiBriefPrompt || undefined,
      });
      setForm((f) => ({
        ...f,
        keys: data.keys ?? f.keys,
        dos: data.dos ?? f.dos,
        deliverables: data.deliverables ?? f.deliverables,
        disclosure: data.disclosure ?? f.disclosure,
      }));
      setAiFilled(true);
    } catch {
      setAiError("AI fill ล้มเหลว กรุณาลองอีกครั้ง");
    }
    setAiLoading(false);
    setIsOpenAIPrompt(false);
  }

  async function handleTranslate() {
    if (!targetLang || aiTranslated) return;
    setTranslating(true);
    setTranslateError(null);
    try {
      const data = await translateBrief(form, targetLang);
      setTranslatedForm(data);
      setAiTranslated(true);
    } catch {
      setTranslateError("การแปลล้มเหลว กรุณาลองอีกครั้ง");
    }
    setTranslating(false);
  }

  async function handlePublish() {
    if (!canPublish) return;
    setPublishing(true);
    setPublishError(null);
    try {
      const ok = await publishBrief(
        id,
        {
          keys: form.keys,
          dos: form.dos,
          deliverables: form.deliverables,
          disclosure: form.disclosure,
          deadline: form.deadline,
          name: form.name,
        },
        needsTranslation ? translatedForm : undefined,
      );
      if (ok) {
        router.push(`/campaigns/${id}`);
      } else {
        setPublishError("การเผยแพร่ล้มเหลว กรุณาลองอีกครั้ง");
      }
    } catch {
      setPublishError("การเผยแพร่ล้มเหลว กรุณาลองอีกครั้ง");
    }
    setPublishing(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-muted-text">
        กำลังโหลด...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-red-500">
        {loadError}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border-ui bg-white px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-290">
          <button
            onClick={() => router.push(`/campaigns/${id}`)}
            className="mb-1.5 flex cursor-pointer items-center gap-1.5 border-none bg-transparent text-sm font-semibold text-muted-text"
          >
            <ArrowLeft size={16} />
            Back to Campaign
          </button>
          <h1 className="m-0 text-2xl font-bold text-dark">
            Create Campaign Brief{" "}
            {isService && (
              <span className="ml-2 rounded-lg bg-secondary-brand-light px-2.5 py-0.75 text-sm font-semibold text-secondary-brand">
                บริการ
              </span>
            )}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-290 px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div>
          {/* Top 2-col grid: Basic Info (left) + Product Context + Deadline stacked (right) */}
          <div className="mb-5 grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2">
            {/* Left: Basic Information */}
            <div className="rounded-2xl border-2 border-border-ui bg-white p-7">
              <div className="mb-5.5 flex items-center gap-2.5">
                <div className="flex size-10 items-center justify-center rounded-[10px] bg-secondary-brand-light">
                  <FileText size={20} className="text-secondary-brand" />
                </div>
                <h3 className="m-0 text-lg font-bold text-dark">
                  Basic Information
                </h3>
              </div>

              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-semibold text-dark">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Dried Mango x Vietnam"
                  className="w-full rounded-[10px] border-[1.5px] border-border-ui bg-white px-3.5 py-2.75 text-sm outline-none focus:border-brand"
                />
              </div>

              {product && (
                <>
                  <div className="mb-4">
                    <label className="mb-1.5 block text-sm font-semibold text-dark">
                      Brand Name
                    </label>
                    <input
                      type="text"
                      value={product.brandName}
                      readOnly
                      className="w-full rounded-[10px] border-[1.5px] border-border-ui bg-surface px-3.5 py-2.75 text-sm outline-none"
                    />
                  </div>
                  <div className="mb-0">
                    <label className="mb-1.5 block text-sm font-semibold text-dark">
                      {isService ? "Service" : "Product"}
                    </label>
                    <input
                      type="text"
                      value={product.productName}
                      readOnly
                      className="w-full rounded-[10px] border-[1.5px] border-border-ui bg-surface px-3.5 py-2.75 text-sm outline-none"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Right: Product Context + Deadline stacked */}
            <div className="flex flex-col gap-5 *:last:flex-1">
              {/* ข้อมูลสินค้าจากแบรนด์ */}
              {product &&
                (product.description ||
                  product.sellingPoints ||
                  product.category) && (
                  <div className="rounded-2xl border border-brand/20 bg-linear-to-br from-brand-light to-secondary-brand-light p-5">
                    <div className="mb-3.5 flex items-center gap-2">
                      {isService ? (
                        <Target size={17} className="text-brand" />
                      ) : (
                        <Package size={17} className="text-brand" />
                      )}
                      <span className="text-[15px] font-bold text-dark">
                        ข้อมูล{isService ? "บริการ" : "สินค้า"}จากแบรนด์
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      {product.category && (
                        <div className="rounded-[10px] border border-border-ui bg-white p-3">
                          <div className="mb-1 text-[11px] font-semibold text-muted-text">
                            หมวดหมู่
                          </div>
                          <div className="text-sm font-semibold text-secondary-brand">
                            {product.category}
                          </div>
                        </div>
                      )}
                      {product.description && (
                        <div className="rounded-[10px] border border-border-ui bg-white p-3">
                          <div className="mb-1 text-[11px] font-semibold text-muted-text">
                            รายละเอียด
                          </div>
                          <div className="text-[13px] leading-relaxed text-dark">
                            {product.description}
                          </div>
                        </div>
                      )}
                      {product.sellingPoints && (
                        <div className="col-span-2 rounded-[10px] border border-border-ui bg-white p-3">
                          <div className="mb-1 text-[11px] font-semibold text-muted-text">
                            จุดเด่น
                          </div>
                          <div className="text-[13px] font-semibold leading-relaxed text-accent-brand">
                            {product.sellingPoints}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Timeline & Deadline */}
              <div
                className={`rounded-2xl border-2 bg-white p-7 ${
                  isDeadlineFilled
                    ? "border-brand/60"
                    : isContentFilled
                      ? "border-amber-400"
                      : "border-border-ui"
                }`}
              >
                <div className="mb-4.5 flex items-center gap-2.5">
                  <div
                    className={`flex size-10 items-center justify-center rounded-[10px] ${
                      isDeadlineFilled
                        ? "bg-brand-light"
                        : isContentFilled
                          ? "bg-amber-50"
                          : "bg-[#f3f4f6]"
                    }`}
                  >
                    <Calendar
                      size={20}
                      className={
                        isDeadlineFilled
                          ? "text-brand"
                          : isContentFilled
                            ? "text-amber-500"
                            : "text-muted-text"
                      }
                    />
                  </div>
                  <div>
                    <h3 className="m-0 text-lg font-bold text-dark">
                      Timeline & Deadline
                    </h3>
                    {isContentFilled && !isDeadlineFilled && (
                      <div className="mt-0.5 text-[13px] font-semibold text-amber-500">
                        กรอกวันที่ก่อนดำเนินขั้นต่อไป
                      </div>
                    )}
                  </div>
                  {isDeadlineFilled && (
                    <div className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-green-600">
                      <CheckCircle size={14} />
                      ตั้งค่าแล้ว
                    </div>
                  )}
                </div>
                <label className="mb-2 block text-sm font-semibold text-dark">
                  Posting Deadline
                </label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) =>
                    setForm({ ...form, deadline: e.target.value })
                  }
                  className={`w-full rounded-[10px] border-[1.5px] px-3.5 py-2.75 text-sm outline-none ${
                    isDeadlineFilled
                      ? "border-brand/60"
                      : isContentFilled
                        ? "border-amber-400"
                        : "border-border-ui"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Platforms & Deliverables — full-width bar */}
          <div className="mb-5 flex items-center gap-4 rounded-xl border border-brand/25 bg-white px-5 py-3.5">
            <div className="flex shrink-0 gap-1.5">
              {platforms.map((p) => (
                <span
                  key={p}
                  className="rounded-md bg-surface px-2 py-0.5 text-[11px] font-semibold text-dark"
                >
                  {p}
                </span>
              ))}
            </div>
            <div>
              <div className="mb-1 text-[13px] font-bold text-dark">
                สิ่งที่ครีเอเตอร์ต้องโพสต์ (per creator)
              </div>
              <div className="flex flex-wrap gap-1.5">
                {campaignDeliverables.map((d, i) => (
                  <span
                    key={i}
                    className="rounded-md border border-brand/20 bg-brand-light px-2.5 py-0.75 text-[13px] text-dark"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Content Guidelines + Translation — 2-column grid */}
          <div
            className={`mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2 transition-opacity ${!isDeadlineFilled ? "pointer-events-none select-none opacity-40" : ""}`}
          >
            {/* Left: Content Guidelines */}
            <div className="rounded-2xl border-2 border-border-ui bg-white p-7">
              <div className="mb-5.5 flex items-center gap-2.5">
                <div className="flex size-10 items-center justify-center rounded-[10px] bg-accent-brand-light">
                  <Video size={20} className="text-accent-brand" />
                </div>
                <h3 className="m-0 text-lg font-bold text-dark">
                  Content Guidelines
                </h3>
                <div className="ml-auto flex items-center gap-2">
                  {isContentFilled && (
                    <div className="flex items-center gap-1.25 text-xs font-semibold text-green-600">
                      <CheckCircle size={13} />
                      ครบแล้ว
                    </div>
                  )}
                  <button
                    onClick={openAIPromptModal}
                    disabled={aiLoading || aiFilled || !product}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-lg border-none px-3 py-1.5 text-xs font-semibold transition-all ${
                      aiLoading
                        ? "cursor-wait bg-border-ui text-muted-text"
                        : aiFilled
                          ? "cursor-not-allowed bg-border-ui text-muted-text"
                          : "bg-linear-to-br from-accent-brand to-secondary-brand text-white"
                    }`}
                  >
                    {aiLoading ? (
                      <>
                        <span className="inline-block size-3 animate-spin rounded-full border-2 border-accent-brand border-t-accent-brand/30" />
                        กำลังวิเคราะห์…
                      </>
                    ) : aiFilled ? (
                      <>
                        <CheckCircle size={12} />
                        AI Filled
                      </>
                    ) : (
                      <>
                        <Sparkles size={12} />
                        ให้ AI ช่วยเขียน
                      </>
                    )}
                  </button>
                </div>
              </div>
              {aiError && (
                <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2 text-[13px] text-red-600">
                  {aiError}
                </div>
              )}

              {(
                [
                  {
                    label: "Key Messages",
                    key: "keys" as const,
                    placeholder: `สิ่งที่อยากให้ครีเอเตอร์เน้นเกี่ยวกับ${isService ? "บริการ" : "สินค้า"}?`,
                    rows: 3,
                  },
                  {
                    label: "Do's and Don'ts",
                    key: "dos" as const,
                    placeholder: "สิ่งที่ควรและไม่ควรทำ...",
                    rows: 5,
                  },
                  {
                    label: "Deliverables",
                    key: "deliverables" as const,
                    placeholder: "จำนวนและประเภทคอนเทนต์...",
                    rows: 4,
                  },
                  {
                    label: "Legal Disclosure",
                    key: "disclosure" as const,
                    placeholder: "#ad #sponsored #BrandName",
                    rows: 2,
                  },
                ] as const
              ).map((field) => (
                <div key={field.key} className="mb-4.5">
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-dark">
                    {field.label}
                    <Sparkles size={13} className="text-accent-brand" />
                    {form[field.key] && (
                      <CheckCircle
                        size={13}
                        className="ml-auto text-green-600"
                      />
                    )}
                  </label>
                  <textarea
                    value={form[field.key]}
                    onChange={(e) => {
                      setForm({ ...form, [field.key]: e.target.value });
                    }}
                    placeholder={field.placeholder}
                    rows={field.rows}
                    className={`w-full resize-y rounded-[10px] border px-3.5 py-2.75 text-sm outline-none ${
                      form[field.key] ? "border-brand/60" : "border-border-ui"
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Right: Translation */}
            <div
              className={`rounded-2xl border-2 bg-white p-7 ${
                aiTranslated
                  ? "border-brand/60"
                  : needsTranslation
                    ? "border-accent-brand/60"
                    : "border-border-ui"
              }`}
            >
              <div className="mb-4.5 flex flex-wrap items-start gap-2.5">
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-[10px] ${
                    aiTranslated ? "bg-brand-light" : "bg-accent-brand-light"
                  }`}
                >
                  <Languages
                    size={20}
                    className={
                      aiTranslated ? "text-brand" : "text-accent-brand"
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="m-0 text-lg font-bold text-dark">แปล Brief</h3>
                  {hasLanguageOptions ? (
                    <LangDropdown
                      options={availableLanguages}
                      value={targetLang}
                      onChange={(lang) => {
                        if (!aiTranslated) setTargetLang(lang);
                      }}
                      disabled={aiTranslated}
                    />
                  ) : (
                    <div className="mt-0.5 text-[13px] text-muted-text">
                      ครีเอเตอร์ทุกคนพูดภาษาไทย ไม่ต้องแปล
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {aiTranslated && (
                    <div className="flex items-center gap-1.25 text-xs font-semibold text-green-600">
                      <CheckCircle size={13} />
                      แปลสำเร็จ
                    </div>
                  )}
                  {hasLanguageOptions && (
                    <button
                      onClick={handleTranslate}
                      disabled={
                        aiTranslated ||
                        translating ||
                        !isContentFilled ||
                        !targetLang
                      }
                      className={`flex cursor-pointer items-center gap-1.5 rounded-lg border-none px-3 py-1.5 text-xs font-semibold transition-all ${
                        aiTranslated
                          ? "cursor-not-allowed bg-border-ui text-muted-text"
                          : translating || !isContentFilled || !targetLang
                            ? "cursor-not-allowed bg-[#e5e7eb] text-[#9ca3af]"
                            : "bg-linear-to-br from-accent-brand to-[#7c5cbf] text-white"
                      }`}
                    >
                      {translating ? (
                        <>
                          <span className="inline-block size-3 animate-spin rounded-full border-2 border-white border-t-white/30" />
                          กำลังแปล…
                        </>
                      ) : aiTranslated ? (
                        <>
                          <CheckCircle size={12} />
                          Translated
                        </>
                      ) : (
                        <>
                          <Languages size={12} />
                          แปล Brief
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {hasLanguageOptions && targetLang && (
                <>
                  {translateError && (
                    <div className="mb-3 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-600">
                      {translateError}
                    </div>
                  )}

                  {(
                    [
                      {
                        label: `Key Messages (${targetLang?.name})`,
                        key: "keys" as const,
                        rows: 3,
                      },
                      {
                        label: `Do's and Don'ts (${targetLang?.name})`,
                        key: "dos" as const,
                        rows: 5,
                      },
                      {
                        label: `Deliverables (${targetLang?.name})`,
                        key: "deliverables" as const,
                        rows: 4,
                      },
                      {
                        label: `Legal Disclosure (${targetLang?.name})`,
                        key: "disclosure" as const,
                        rows: 2,
                      },
                    ] as const
                  ).map((field) => (
                    <div key={field.key} className="mb-4.5">
                      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-dark">
                        {field.label}
                        {translatedForm[field.key] && (
                          <CheckCircle
                            size={13}
                            className="ml-auto text-green-600"
                          />
                        )}
                      </label>
                      <textarea
                        value={translatedForm[field.key]}
                        onChange={(e) =>
                          setTranslatedForm((f) => ({
                            ...f,
                            [field.key]: e.target.value,
                          }))
                        }
                        disabled={!aiTranslated && !translatedForm[field.key]}
                        placeholder={
                          translating
                            ? "กำลังแปล…"
                            : 'กด "แปล Brief" เพื่อสร้างเนื้อหา'
                        }
                        rows={field.rows}
                        className={`w-full resize-y rounded-[10px] border px-3.5 py-2.75 text-sm outline-none transition-colors ${
                          aiTranslated || translatedForm[field.key]
                            ? "border-brand/60 bg-white"
                            : "cursor-not-allowed border-border-ui bg-[#f7f8fa] text-muted-text"
                        }`}
                      />
                    </div>
                  ))}
                </>
              )}

              {!hasLanguageOptions && (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-text">
                  <CheckCircle size={32} className="mb-2 text-brand" />
                  <div className="text-sm font-semibold">ไม่ต้องแปล</div>
                  <div className="mt-1 text-xs">ครีเอเตอร์ทุกคนพูดภาษาไทย</div>
                </div>
              )}

              {hasLanguageOptions && !targetLang && (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-text">
                  <Languages size={32} className="mb-2 text-muted-text" />
                  <div className="text-sm font-semibold">
                    เลือกภาษาเป้าหมายด้านบน
                  </div>
                  <div className="mt-1 text-xs">
                    เพื่อแปล Brief ให้ครีเอเตอร์ต่างประเทศ
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Publish */}
          <div
            className={`rounded-2xl border-2 p-7 transition-opacity ${
              canPublish
                ? "border-brand bg-linear-to-br from-brand-light to-secondary-brand-light opacity-100"
                : "border-border-ui bg-white opacity-50"
            }`}
          >
            <div className="mb-4.5 flex items-center gap-2.5">
              <div
                className={`flex size-10 items-center justify-center rounded-[10px] ${
                  canPublish ? "bg-brand" : "bg-border-ui"
                }`}
              >
                <Send
                  size={20}
                  className={canPublish ? "text-white" : "text-muted-text"}
                />
              </div>
              <div>
                <h3
                  className={`m-0 text-xl font-bold ${
                    canPublish ? "text-dark" : "text-muted-text"
                  }`}
                >
                  เผยแพร่ Brief
                </h3>
                {!canPublish && (
                  <div className="mt-0.5 text-sm text-muted-text">
                    {!isContentFilled
                      ? "กรอก Brief ก่อน"
                      : !isDeadlineFilled
                        ? "ตั้ง Deadline ก่อน"
                        : !targetLang
                          ? "เลือกภาษาและแปล Brief ก่อน"
                          : "แปล Brief ก่อน"}
                  </div>
                )}
                {canPublish && (
                  <div className="mt-0.5 text-sm font-semibold text-brand">
                    พร้อมส่งให้ครีเอเตอร์แล้ว!
                  </div>
                )}
              </div>
            </div>
            {publishError && (
              <div className="mb-3 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-600">
                {publishError}
              </div>
            )}
            <button
              onClick={handlePublish}
              disabled={!canPublish || publishing}
              className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-none py-4 text-lg font-bold text-white transition-all ${
                canPublish && !publishing
                  ? "bg-linear-to-br from-brand to-secondary-brand"
                  : "cursor-not-allowed bg-gray-300 text-gray-400"
              }`}
            >
              {publishing ? (
                <>
                  <span className="inline-block size-4.5 animate-spin rounded-full border-2 border-white border-t-white/30" />
                  กำลังเผยแพร่…
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  เผยแพร่ Brief & ดำเนินต่อ
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      <Dialog open={isOpenAIPrompt}>
        <DialogContent className="sm:max-w-xl" onClose={closeAIPromptModal}>
          <form onSubmit={async (e) => { e.preventDefault(); closeAIPromptModal(); await fillAI(); }}>
            <DialogHeader>
              <DialogTitle>
                <div className="flex gap-2 text-xl items-center content-center">
                  <Sparkles size={28} className="text-brand" />
                  Fill brief with AI
                </div>
              </DialogTitle>
              <div className="w-full border border-border-ui my-2"></div>
              <DialogDescription className="text-black text-md mb-2">
                ใส่ Prompt สำหรับ AI เพื่อกำหนดทิศทางของ Key Messages, Do&apos;s &
                Don&apos;ts, Deliverables และ Disclosure ให้อัตโนมัติ
                <span className="ml-1 text-[11px] font-normal text-muted-text">
                  (ไม่บังคับ)
                </span>
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-1 mb-4">
              <textarea
                value={aiBriefPrompt}
                onChange={(e) => setAIBriefPrompt(e.target.value)}
                maxLength={aiBriefPromptMax}
                placeholder="เช่น: เน้นความเป็นธรรมชาติ ออร์แกนิค ไม่ใส่สารกันบูด กลุ่มเป้าหมายคือคน รักสุขภาพอายุ 25-35 ปี ต้องการสื่อสารภาษาสบายๆ ไม่เป็นทางการ..."
                className="w-full min-h-32 rounded-sm border-[1.5px] border-border-ui bg-surface/50 px-3.5 py-2.75 text-sm outline-none focus:border-brand"
              />
              <div className="w-full flex justify-end">
                <p className="text-xs">{aiBriefPrompt.length}/{aiBriefPromptMax}</p>
              </div>
            </div>  
            <DialogFooter>
              <DialogClose className={buttonVariants({ variant: "outline" }) + " py-5 px-6"} onClick={closeAIPromptModal}>
                ยกเลิก
              </DialogClose>
              <Button type="submit" className="bg-brand py-5 px-6">
                <Sparkles size={28} />
                สร้าง Brief
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
