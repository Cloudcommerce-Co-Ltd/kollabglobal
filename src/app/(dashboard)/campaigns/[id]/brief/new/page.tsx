'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import {
  getPackagePlatforms,
  getPackageDeliverables,
} from '@/lib/package-utils';
import { isBriefContentFilled, canPublishBrief } from '@/lib/brief-utils';
import {
  fetchCampaign,
  fillBriefAI,
  translateBrief,
  publishBrief,
} from '@/lib/brief-api';
import type { BriefForm, TranslatedFields } from '@/types/brief';
import type { CampaignWithRelations } from '@/types/campaign';
import { useEffect } from 'react';

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
    name: '',
    keys: '',
    dos: '',
    deliverables: '',
    disclosure: '',
    deadline: '',
  });
  const [translatedForm, setTranslatedForm] = useState<TranslatedFields>({
    keys: '',
    dos: '',
    deliverables: '',
    disclosure: '',
    name: '',
  });
  const [aiTranslated, setAiTranslated] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [targetLang, setTargetLang] = useState<{
    code: string;
    name: string;
    flag: string;
  } | null>(null);
  const [translateError, setTranslateError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiFilled, setAiFilled] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaign(id)
      .then(data => {
        setCampaign(data);
        setForm(f => ({
          ...f,
          name: data.product?.productName ?? '',
        }));
        const lang = data.country
          ? { code: data.country.languageCode, name: data.country.languageName, flag: data.country.flag }
          : { code: 'en', name: 'English', flag: '🇺🇸' };
        setTargetLang(lang);
        setLoading(false);
      })
      .catch(() => {
        router.replace('/campaigns');
      });
  }, [id, router]);

  const isService = campaign?.product?.isService ?? false;
  const platforms = getPackagePlatforms(campaign?.package);
  const campaignDeliverables = getPackageDeliverables(campaign?.package);

  const isContentFilled = isBriefContentFilled(form);
  const isDeadlineFilled = !!form.deadline;
  const needsTranslation = !!(targetLang && targetLang.code !== 'th');
  const canPublish = canPublishBrief(form, needsTranslation, aiTranslated);

  async function fillAI() {
    if (!campaign?.product) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const data = await fillBriefAI(campaign.product, {
        countryName: campaign.country?.name,
        platforms,
        packageDeliverables: campaignDeliverables,
      });
      setForm(f => ({
        ...f,
        keys: data.keys ?? f.keys,
        dos: data.dos ?? f.dos,
        deliverables: data.deliverables ?? f.deliverables,
        disclosure: data.disclosure ?? f.disclosure,
      }));
      setAiFilled(true);
    } catch {
      setAiError('AI fill ล้มเหลว กรุณาลองอีกครั้ง');
    }
    setAiLoading(false);
  }

  async function handleTranslate() {
    if (!targetLang) return;
    setTranslating(true);
    setTranslateError(null);
    try {
      const data = await translateBrief(form, targetLang);
      setTranslatedForm(data);
      setAiTranslated(true);
    } catch {
      setTranslateError('การแปลล้มเหลว กรุณาลองอีกครั้ง');
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
        setPublishError('การเผยแพร่ล้มเหลว กรุณาลองอีกครั้ง');
      }
    } catch {
      setPublishError('การเผยแพร่ล้มเหลว กรุณาลองอีกครั้ง');
    }
    setPublishing(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fa] text-[#8a90a3]">
        กำลังโหลด...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fa] text-red-500">
        {loadError}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-[#e8ecf0] bg-white px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-290">
          <button
            onClick={() => router.push(`/campaigns/${id}`)}
            className="mb-1.5 flex cursor-pointer items-center gap-1.5 border-none bg-transparent text-sm font-semibold text-[#8a90a3]"
          >
            <ArrowLeft size={16} />
            Back to Campaign
          </button>
          <h1 className="m-0 text-2xl font-bold text-[#4A4A4A]">
            Create Campaign Brief{' '}
            {isService && (
              <span className="ml-2 rounded-lg bg-[#e8f0fa] px-2.5 py-0.75 text-sm font-semibold text-[#4A90D9]">
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
            <div className="rounded-2xl border-2 border-[#e8ecf0] bg-white p-7">
              <div className="mb-5.5 flex items-center gap-2.5">
                <div className="flex size-10 items-center justify-center rounded-[10px] bg-[#e8f0fa]">
                  <FileText size={20} className="text-[#4A90D9]" />
                </div>
                <h3 className="m-0 text-lg font-bold text-[#4A4A4A]">
                  Basic Information
                </h3>
              </div>

              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-semibold text-[#4A4A4A]">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Dried Mango x Vietnam"
                  className="w-full rounded-[10px] border-[1.5px] border-[#e8ecf0] bg-white px-3.5 py-2.75 text-sm outline-none focus:border-[#4ECDC4]"
                />
              </div>

              {campaign?.product && (
                <>
                  <div className="mb-4">
                    <label className="mb-1.5 block text-sm font-semibold text-[#4A4A4A]">
                      Brand Name
                    </label>
                    <input
                      type="text"
                      value={campaign.product.brandName}
                      readOnly
                      className="w-full rounded-[10px] border-[1.5px] border-[#e8ecf0] bg-[#f5f7fa] px-3.5 py-2.75 text-sm outline-none"
                    />
                  </div>
                  <div className="mb-0">
                    <label className="mb-1.5 block text-sm font-semibold text-[#4A4A4A]">
                      {isService ? 'Service' : 'Product'}
                    </label>
                    <input
                      type="text"
                      value={campaign.product.productName}
                      readOnly
                      className="w-full rounded-[10px] border-[1.5px] border-[#e8ecf0] bg-[#f5f7fa] px-3.5 py-2.75 text-sm outline-none"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Right: Product Context + Deadline stacked */}
            <div className="flex flex-col gap-5 [&>:last-child]:flex-1">
              {/* ข้อมูลสินค้าจากแบรนด์ */}
              {campaign?.product &&
                (campaign.product.description ||
                  campaign.product.sellingPoints ||
                  campaign.product.category) && (
                  <div className="rounded-2xl border border-[#4ECDC4]/20 bg-gradient-to-br from-[#e8f8f7] to-[#e8f0fa] p-5">
                    <div className="mb-3.5 flex items-center gap-2">
                      {isService ? (
                        <Target size={17} className="text-[#4ECDC4]" />
                      ) : (
                        <Package size={17} className="text-[#4ECDC4]" />
                      )}
                      <span className="text-[15px] font-bold text-[#4A4A4A]">
                        ข้อมูล{isService ? 'บริการ' : 'สินค้า'}จากแบรนด์
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      {campaign.product.category && (
                        <div className="rounded-[10px] border border-[#e8ecf0] bg-white p-3">
                          <div className="mb-1 text-[11px] font-semibold text-[#8a90a3]">หมวดหมู่</div>
                          <div className="text-sm font-semibold text-[#4A90D9]">{campaign.product.category}</div>
                        </div>
                      )}
                      {campaign.product.description && (
                        <div className="rounded-[10px] border border-[#e8ecf0] bg-white p-3">
                          <div className="mb-1 text-[11px] font-semibold text-[#8a90a3]">รายละเอียด</div>
                          <div className="text-[13px] leading-relaxed text-[#4A4A4A]">{campaign.product.description}</div>
                        </div>
                      )}
                      {campaign.product.sellingPoints && (
                        <div className="col-span-2 rounded-[10px] border border-[#e8ecf0] bg-white p-3">
                          <div className="mb-1 text-[11px] font-semibold text-[#8a90a3]">จุดเด่น</div>
                          <div className="text-[13px] font-semibold leading-relaxed text-[#9B7ED8]">{campaign.product.sellingPoints}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Timeline & Deadline */}
              <div
                className={`rounded-2xl border-2 bg-white p-7 ${
                  isDeadlineFilled
                    ? 'border-[#4ECDC4]/60'
                    : isContentFilled
                      ? 'border-amber-400'
                      : 'border-[#e8ecf0]'
                }`}
              >
                <div className="mb-4.5 flex items-center gap-2.5">
                  <div
                    className={`flex size-10 items-center justify-center rounded-[10px] ${
                      isDeadlineFilled
                        ? 'bg-[#e8f8f7]'
                        : isContentFilled
                          ? 'bg-amber-50'
                          : 'bg-[#f3f4f6]'
                    }`}
                  >
                    <Calendar
                      size={20}
                      className={
                        isDeadlineFilled
                          ? 'text-[#4ECDC4]'
                          : isContentFilled
                            ? 'text-amber-500'
                            : 'text-[#8a90a3]'
                      }
                    />
                  </div>
                  <div>
                    <h3 className="m-0 text-lg font-bold text-[#4A4A4A]">
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
                <label className="mb-2 block text-sm font-semibold text-[#4A4A4A]">
                  Posting Deadline
                </label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={e => setForm({ ...form, deadline: e.target.value })}
                  className={`w-full rounded-[10px] border-[1.5px] px-3.5 py-2.75 text-sm outline-none ${
                    isDeadlineFilled
                      ? 'border-[#4ECDC4]/60'
                      : isContentFilled
                        ? 'border-amber-400'
                        : 'border-[#e8ecf0]'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Platforms & Deliverables — full-width bar */}
          <div className="mb-5 flex items-center gap-4 rounded-xl border border-[#4ECDC4]/25 bg-white px-5 py-3.5">
            <div className="flex shrink-0 gap-1.5">
              {platforms.map(p => (
                <span
                  key={p}
                  className="rounded-md bg-[#f5f7fa] px-2 py-0.5 text-[11px] font-semibold text-[#4A4A4A]"
                >
                  {p}
                </span>
              ))}
            </div>
            <div>
              <div className="mb-1 text-[13px] font-bold text-[#4A4A4A]">
                สิ่งที่ครีเอเตอร์ต้องโพสต์ (per creator)
              </div>
              <div className="flex flex-wrap gap-1.5">
                {campaignDeliverables.map((d, i) => (
                  <span
                    key={i}
                    className="rounded-md border border-[#4ECDC4]/20 bg-[#e8f8f7] px-2.5 py-0.75 text-[13px] text-[#4A4A4A]"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Content Guidelines + Translation — 2-column grid */}
          <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Left: Content Guidelines */}
            <div className="rounded-2xl border-2 border-[#e8ecf0] bg-white p-7">
              <div className="mb-5.5 flex items-center gap-2.5">
                <div className="flex size-10 items-center justify-center rounded-[10px] bg-[#f0ebf8]">
                  <Video size={20} className="text-[#9B7ED8]" />
                </div>
                <h3 className="m-0 text-lg font-bold text-[#4A4A4A]">
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
                    onClick={fillAI}
                    disabled={aiLoading || aiFilled || !campaign?.product}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-lg border-none px-3 py-1.5 text-xs font-semibold transition-all ${
                      aiLoading
                        ? 'cursor-wait bg-[#e8ecf0] text-[#8a90a3]'
                        : aiFilled
                          ? 'cursor-not-allowed bg-[#e8ecf0] text-[#8a90a3]'
                          : 'bg-linear-to-br from-[#9B7ED8] to-[#4A90D9] text-white'
                    }`}
                  >
                    {aiLoading ? (
                      <>
                        <span className="inline-block size-3 animate-spin rounded-full border-2 border-[#9B7ED8] border-t-[#9B7ED8]/30" />
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
                    label: 'Key Messages',
                    key: 'keys' as const,
                    placeholder: `สิ่งที่อยากให้ครีเอเตอร์เน้นเกี่ยวกับ${isService ? 'บริการ' : 'สินค้า'}?`,
                    rows: 3,
                  },
                  {
                    label: "Do's and Don'ts",
                    key: 'dos' as const,
                    placeholder: 'สิ่งที่ควรและไม่ควรทำ...',
                    rows: 5,
                  },
                  {
                    label: 'Deliverables',
                    key: 'deliverables' as const,
                    placeholder: 'จำนวนและประเภทคอนเทนต์...',
                    rows: 4,
                  },
                  {
                    label: 'Legal Disclosure',
                    key: 'disclosure' as const,
                    placeholder: '#ad #sponsored #BrandName',
                    rows: 2,
                  },
                ] as const
              ).map(field => (
                <div key={field.key} className="mb-4.5">
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-[#4A4A4A]">
                    {field.label}
                    <Sparkles size={13} className="text-[#9B7ED8]" />
                    {form[field.key] && (
                      <CheckCircle
                        size={13}
                        className="ml-auto text-green-600"
                      />
                    )}
                  </label>
                  <textarea
                    value={form[field.key]}
                    onChange={e => {
                      setForm({ ...form, [field.key]: e.target.value });
                    }}
                    placeholder={field.placeholder}
                    rows={field.rows}
                    className={`w-full resize-y rounded-[10px] border px-3.5 py-2.75 text-sm outline-none ${
                      form[field.key]
                        ? 'border-[#4ECDC4]/60'
                        : 'border-[#e8ecf0]'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Right: Translation */}
            <div
              className={`rounded-2xl border-2 bg-white p-7 ${
                aiTranslated
                  ? 'border-[#4ECDC4]/60'
                  : needsTranslation
                    ? 'border-[#9B7ED8]/60'
                    : 'border-[#e8ecf0]'
              }`}
            >
              <div className="mb-4.5 flex items-center gap-2.5">
                <div
                  className={`flex size-10 items-center justify-center rounded-[10px] ${
                    aiTranslated ? 'bg-[#e8f8f7]' : 'bg-[#f0ebf8]'
                  }`}
                >
                  <Languages
                    size={20}
                    className={
                      aiTranslated ? 'text-[#4ECDC4]' : 'text-[#9B7ED8]'
                    }
                  />
                </div>
                <div>
                  <h3 className="m-0 text-lg font-bold text-[#4A4A4A]">
                    {needsTranslation
                      ? `แปล Brief → ${targetLang?.name} ${targetLang?.flag}`
                      : 'Translation'}
                  </h3>
                  {!needsTranslation && (
                    <div className="mt-0.5 text-[13px] text-[#8a90a3]">
                      ครีเอเตอร์พูดภาษาไทย ไม่ต้องแปล
                    </div>
                  )}
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {aiTranslated && (
                    <div className="flex items-center gap-1.25 text-xs font-semibold text-green-600">
                      <CheckCircle size={13} />
                      แปลสำเร็จ
                    </div>
                  )}
                  {needsTranslation && (
                    <button
                      onClick={handleTranslate}
                      disabled={aiTranslated || translating || !isContentFilled}
                      className={`flex cursor-pointer items-center gap-1.5 rounded-lg border-none px-3 py-1.5 text-xs font-semibold transition-all ${
                        aiTranslated
                          ? 'cursor-not-allowed bg-[#e8ecf0] text-[#8a90a3]'
                          : translating || !isContentFilled
                            ? 'cursor-not-allowed bg-[#e5e7eb] text-[#9ca3af]'
                            : 'bg-linear-to-br from-[#9B7ED8] to-[#7c5cbf] text-white'
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

              {needsTranslation && (
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
                        key: 'keys' as const,
                        rows: 3,
                      },
                      {
                        label: `Do's and Don'ts (${targetLang?.name})`,
                        key: 'dos' as const,
                        rows: 5,
                      },
                      {
                        label: `Deliverables (${targetLang?.name})`,
                        key: 'deliverables' as const,
                        rows: 4,
                      },
                      {
                        label: `Legal Disclosure (${targetLang?.name})`,
                        key: 'disclosure' as const,
                        rows: 2,
                      },
                    ] as const
                  ).map(field => (
                    <div key={field.key} className="mb-4.5">
                      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-[#4A4A4A]">
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
                        onChange={e =>
                          setTranslatedForm(f => ({
                            ...f,
                            [field.key]: e.target.value,
                          }))
                        }
                        disabled={!aiTranslated && !translatedForm[field.key]}
                        placeholder={
                          translating
                            ? 'กำลังแปล…'
                            : 'กด "แปล Brief" เพื่อสร้างเนื้อหา'
                        }
                        rows={field.rows}
                        className={`w-full resize-y rounded-[10px] border px-3.5 py-2.75 text-sm outline-none transition-colors ${
                          aiTranslated || translatedForm[field.key]
                            ? 'border-[#4ECDC4]/60 bg-white'
                            : 'cursor-not-allowed border-[#e8ecf0] bg-[#f7f8fa] text-[#8a90a3]'
                        }`}
                      />
                    </div>
                  ))}
                </>
              )}

              {!needsTranslation && (
                <div className="flex flex-col items-center justify-center py-8 text-center text-[#8a90a3]">
                  <CheckCircle size={32} className="mb-2 text-[#4ECDC4]" />
                  <div className="text-sm font-semibold">ไม่ต้องแปล</div>
                  <div className="mt-1 text-xs">
                    ครีเอเตอร์ในประเทศนี้พูดภาษาไทย
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Publish */}
          <div
            className={`rounded-2xl border-2 p-7 transition-opacity ${
              canPublish
                ? 'border-[#4ECDC4] bg-linear-to-br from-[#e8f8f7] to-[#e8f0fa] opacity-100'
                : 'border-[#e8ecf0] bg-white opacity-50'
            }`}
          >
            <div className="mb-4.5 flex items-center gap-2.5">
              <div
                className={`flex size-10 items-center justify-center rounded-[10px] ${
                  canPublish ? 'bg-[#4ECDC4]' : 'bg-[#e8ecf0]'
                }`}
              >
                <Send
                  size={20}
                  className={canPublish ? 'text-white' : 'text-[#8a90a3]'}
                />
              </div>
              <div>
                <h3
                  className={`m-0 text-xl font-bold ${
                    canPublish ? 'text-[#4A4A4A]' : 'text-[#8a90a3]'
                  }`}
                >
                  เผยแพร่ Brief
                </h3>
                {!canPublish && (
                  <div className="mt-0.5 text-sm text-[#8a90a3]">
                    {!isContentFilled
                      ? 'กรอก Brief ก่อน'
                      : !isDeadlineFilled
                        ? 'ตั้ง Deadline ก่อน'
                        : 'แปลภาษาก่อน'}
                  </div>
                )}
                {canPublish && (
                  <div className="mt-0.5 text-sm font-semibold text-[#4ECDC4]">
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
                  ? 'bg-linear-to-br from-[#4ECDC4] to-[#4A90D9]'
                  : 'cursor-not-allowed bg-[#d1d5db] text-[#9ca3af]'
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
    </div>
  );
}
