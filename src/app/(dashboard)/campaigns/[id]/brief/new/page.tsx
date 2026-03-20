'use client';

import { useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  Video,
  Send,
  CheckCircle,
  Eye,
  Sparkles,
  Calendar,
  Languages,
  Link,
  Target,
  Package,
} from 'lucide-react';
import { CREATOR_LANG_BY_COUNTRY } from '@/lib/constants';
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
import { useScrollToRef } from '@/hooks/use-scroll-to-ref';
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

  const deadlineRef = useRef<HTMLDivElement>(null);
  const translateRef = useRef<HTMLDivElement>(null);
  const publishRef = useRef<HTMLDivElement>(null);

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
  const [translated, setTranslated] = useState<TranslatedFields | null>(null);
  const [translating, setTranslating] = useState(false);
  const [targetLang, setTargetLang] = useState<{
    code: string;
    name: string;
    flag: string;
  } | null>(null);
  const [translateError, setTranslateError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
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
        const lang = CREATOR_LANG_BY_COUNTRY[data.countryId] ?? {
          code: 'en',
          name: 'English',
          flag: '🇺🇸',
        };
        setTargetLang(lang);
        setLoading(false);
      })
      .catch(() => {
        router.replace('/campaigns');
      });
  }, [id, router]);

  const isService = campaign?.product?.isService ?? false;
  const platforms = getPackagePlatforms(campaign?.packageId);
  const campaignDeliverables = getPackageDeliverables(campaign?.packageId);

  const isContentFilled = isBriefContentFilled(form);
  const isDeadlineFilled = !!form.deadline;
  const needsTranslation = !!(targetLang && targetLang.code !== 'th');
  const canPublish = canPublishBrief(form, needsTranslation, !!translated);

  // Scroll to deadline section once content is filled
  useScrollToRef(deadlineRef, isContentFilled);

  // Scroll to translate section once deadline is filled (and translation needed)
  useScrollToRef(
    translateRef,
    isContentFilled && isDeadlineFilled && needsTranslation && !translated,
    false,
  );

  // Scroll to publish section once translated
  useScrollToRef(publishRef, !!translated, false);

  async function fillAI() {
    if (!campaign?.product) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const data = await fillBriefAI(campaign.product);
      setForm(f => ({
        ...f,
        keys: data.keys ?? f.keys,
        dos: data.dos ?? f.dos,
        deliverables: data.deliverables ?? f.deliverables,
        disclosure: data.disclosure ?? f.disclosure,
      }));
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
      setTranslated(data);
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
        translated ?? undefined,
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

  const previewPv = (key: keyof BriefForm) => form[key] ?? '';

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
        <div className="mx-auto flex max-w-290 items-center justify-between gap-4">
          <div>
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
          <button
            onClick={fillAI}
            disabled={aiLoading || !campaign?.product}
            className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-[10px] border-none px-5 py-2.75 text-sm font-semibold transition-all ${
              aiLoading
                ? 'cursor-wait bg-[#e8ecf0] text-[#8a90a3]'
                : 'bg-linear-to-br from-[#9B7ED8] to-[#4A90D9] text-white'
            }`}
          >
            {aiLoading ? (
              <>
                <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-[#9B7ED8] border-t-[#9B7ED8]/30" />
                กำลังวิเคราะห์…
              </>
            ) : (
              <>
                <Sparkles size={15} />
                Fill with AI
              </>
            )}
          </button>
        </div>
        {aiError && (
          <div className="mx-auto mt-2 max-w-290 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2 text-[13px] text-red-600">
            {aiError}
          </div>
        )}
      </div>

      <div className="mx-auto grid max-w-290 grid-cols-1 items-start gap-7 px-4 pb-20 pt-8 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        {/* Left column — forms */}
        <div>
          {/* Basic Info */}
          <div className="mb-5 rounded-2xl border-2 border-[#e8ecf0] bg-white p-7">
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
                className="w-full rounded-[10px] border border-[#e8ecf0] bg-white px-3.5 py-2.75 text-sm outline-none focus:border-[#4ECDC4]"
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
                    className="w-full rounded-[10px] border border-[#e8ecf0] bg-[#f5f7fa] px-3.5 py-2.75 text-sm outline-none"
                  />
                </div>
                <div className="mb-4">
                  <label className="mb-1.5 block text-sm font-semibold text-[#4A4A4A]">
                    {isService ? 'Service' : 'Product'}
                  </label>
                  <input
                    type="text"
                    value={campaign.product.productName}
                    readOnly
                    className="w-full rounded-[10px] border border-[#e8ecf0] bg-[#f5f7fa] px-3.5 py-2.75 text-sm outline-none"
                  />
                </div>
                {campaign.product.url && (
                  <div className="flex items-center gap-2 rounded-[10px] border border-[#4ECDC4]/20 bg-[#e8f8f7] px-3.5 py-2.5">
                    <Link size={14} className="shrink-0 text-[#4ECDC4]" />
                    <span className="text-xs font-medium text-[#4ECDC4]">
                      URL:{' '}
                    </span>
                    <span className="break-all text-xs text-[#8a90a3]">
                      {campaign.product.url}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Product context card */}
          {campaign?.product &&
            (campaign.product.description ||
              campaign.product.sellingPoints ||
              campaign.product.category) && (
              <div className="mb-5 rounded-xl border border-[#4ECDC4]/20 bg-linear-to-br from-[#e8f8f7] to-[#e8f0fa] px-5.5 py-4.5">
                <div className="mb-3.5 flex items-center gap-2">
                  {isService ? (
                    <Target size={17} className="text-[#4ECDC4]" />
                  ) : (
                    <Package size={17} className="text-[#4ECDC4]" />
                  )}
                  <span className="text-sm font-bold text-[#4A4A4A]">
                    ข้อมูล{isService ? 'บริการ' : 'สินค้า'}จากแบรนด์
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {campaign.product.category && (
                    <div className="rounded-[10px] border border-[#e8ecf0] bg-white px-3.5 py-2.5">
                      <div className="mb-0.75 text-[11px] font-semibold text-[#8a90a3]">
                        หมวดหมู่
                      </div>
                      <div className="text-sm font-semibold text-[#4A90D9]">
                        {campaign.product.category}
                      </div>
                    </div>
                  )}
                  {campaign.product.description && (
                    <div className="rounded-[10px] border border-[#e8ecf0] bg-white px-3.5 py-2.5">
                      <div className="mb-0.75 text-[11px] font-semibold text-[#8a90a3]">
                        รายละเอียด
                      </div>
                      <div className="text-[13px] leading-relaxed text-[#4A4A4A]">
                        {campaign.product.description}
                      </div>
                    </div>
                  )}
                  {campaign.product.sellingPoints && (
                    <div className="col-span-full rounded-[10px] border border-[#e8ecf0] bg-white px-3.5 py-2.5">
                      <div className="mb-0.75 text-[11px] font-semibold text-[#8a90a3]">
                        จุดเด่น
                      </div>
                      <div className="text-[13px] font-semibold leading-relaxed text-[#9B7ED8]">
                        {campaign.product.sellingPoints}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Platforms & deliverables bar */}
          <div className="mb-5 flex items-center gap-3.5 rounded-xl border border-[#4ECDC4]/25 bg-white px-5 py-3.5">
            <div className="flex items-center gap-1.5">
              {platforms.map(p => (
                <span
                  key={p}
                  className="rounded-lg bg-[#f5f7fa] px-2 py-1 text-xs font-semibold text-[#4A4A4A]"
                >
                  {p}
                </span>
              ))}
            </div>
            <div>
              <div className="mb-1.25 text-[13px] font-bold text-[#4A4A4A]">
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

          {/* Content Guidelines */}
          <div className="mb-5 rounded-2xl border-2 border-[#e8ecf0] bg-white p-7">
            <div className="mb-5.5 flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-[10px] bg-[#f0ebf8]">
                <Video size={20} className="text-[#9B7ED8]" />
              </div>
              <h3 className="m-0 text-lg font-bold text-[#4A4A4A]">
                Content Guidelines
              </h3>
              {isContentFilled && (
                <div className="ml-auto flex items-center gap-1.25 text-xs font-semibold text-green-600">
                  <CheckCircle size={14} />
                  ครบแล้ว
                </div>
              )}
            </div>

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
                    <CheckCircle size={13} className="ml-auto text-green-600" />
                  )}
                </label>
                <textarea
                  value={form[field.key]}
                  onChange={e => {
                    setForm({ ...form, [field.key]: e.target.value });
                    setTranslated(null);
                  }}
                  placeholder={field.placeholder}
                  rows={field.rows}
                  className={`w-full resize-y rounded-[10px] border px-3.5 py-2.75 text-sm outline-none ${
                    form[field.key] ? 'border-[#4ECDC4]/60' : 'border-[#e8ecf0]'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Deadline */}
          <div
            ref={deadlineRef}
            className={`mb-5 rounded-2xl border-2 bg-white p-7 ${
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
                    ⬅ กรอกวันที่ก่อนดำเนินขั้นต่อไป
                  </div>
                )}
              </div>
              {isDeadlineFilled && (
                <div className="ml-auto flex items-center gap-1.25 text-xs font-semibold text-green-600">
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
              disabled={!isContentFilled}
              className={`w-full rounded-[10px] border px-3.5 py-2.75 text-sm outline-none transition-opacity ${
                isDeadlineFilled
                  ? 'border-[#4ECDC4]/60'
                  : isContentFilled
                    ? 'border-amber-400'
                    : 'border-[#e8ecf0]'
              } ${isContentFilled ? 'opacity-100' : 'cursor-not-allowed opacity-50'}`}
            />
          </div>

          {/* Translation */}
          {needsTranslation && (
            <div
              ref={translateRef}
              className={`mb-5 rounded-2xl border-2 bg-white p-7 transition-opacity ${
                translated
                  ? 'border-[#4ECDC4]/60'
                  : isDeadlineFilled
                    ? 'border-[#9B7ED8]'
                    : 'border-[#e8ecf0]'
              } ${isDeadlineFilled ? 'opacity-100' : 'opacity-50'}`}
            >
              <div className="mb-4.5 flex items-center gap-2.5">
                <div
                  className={`flex size-10 items-center justify-center rounded-[10px] ${
                    translated
                      ? 'bg-[#e8f8f7]'
                      : isDeadlineFilled
                        ? 'bg-[#f0ebf8]'
                        : 'bg-[#f3f4f6]'
                  }`}
                >
                  <Languages
                    size={20}
                    className={
                      translated
                        ? 'text-[#4ECDC4]'
                        : isDeadlineFilled
                          ? 'text-[#9B7ED8]'
                          : 'text-[#8a90a3]'
                    }
                  />
                </div>
                <div>
                  <h3 className="m-0 text-lg font-bold text-[#4A4A4A]">
                    แปล Brief → {targetLang?.name} {targetLang?.flag}
                  </h3>
                  {isDeadlineFilled && !translated && (
                    <div className="mt-0.5 text-[13px] font-semibold text-[#9B7ED8]">
                      ครีเอเตอร์พูด {targetLang?.name} — แปลให้ครบก่อนส่ง
                    </div>
                  )}
                </div>
                {translated && (
                  <div className="ml-auto flex items-center gap-1.25 text-xs font-semibold text-green-600">
                    <CheckCircle size={14} />
                    แปลสำเร็จแล้ว
                  </div>
                )}
              </div>

              {translateError && (
                <div className="mb-3 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-600">
                  {translateError}
                </div>
              )}

              {!translated ? (
                <button
                  onClick={handleTranslate}
                  disabled={!isDeadlineFilled || translating}
                  className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-none py-3.25 text-sm font-bold transition-all ${
                    !isDeadlineFilled || translating
                      ? 'cursor-not-allowed bg-[#e5e7eb] text-[#9ca3af]'
                      : 'bg-linear-to-br from-[#9B7ED8] to-[#7c5cbf] text-white'
                  }`}
                >
                  {translating ? (
                    <>
                      <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-white border-t-white/30" />
                      กำลังแปล…
                    </>
                  ) : (
                    <>
                      <Languages size={16} />
                      แปล Brief เป็น {targetLang?.name} {targetLang?.flag}
                    </>
                  )}
                </button>
              ) : (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4.5 py-3.5">
                  <div className="mb-2.5 flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-sm font-bold text-green-700">
                      แปลสำเร็จ! Brief พร้อมส่งเป็น {targetLang?.name}{' '}
                      {targetLang?.flag}
                    </span>
                  </div>
                  {[
                    ['Key Messages', translated.keys],
                    ['Guidelines', translated.dos],
                  ]
                    .filter(([, v]) => v)
                    .map(([label, val]) => (
                      <div
                        key={label}
                        className="mb-1.5 rounded-lg border border-green-200 bg-white px-3 py-2.5"
                      >
                        <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-green-600">
                          {label}
                        </div>
                        <div className="text-[13px] leading-relaxed text-[#4A4A4A]">
                          {val.length > 120 ? val.slice(0, 120) + '…' : val}
                        </div>
                      </div>
                    ))}
                  <button
                    onClick={() => {
                      setTranslated(null);
                      setTranslateError(null);
                    }}
                    className="mt-2.5 cursor-pointer rounded-lg border border-[#e8ecf0] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#8a90a3]"
                  >
                    แปลใหม่อีกครั้ง
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Publish */}
          <div
            ref={publishRef}
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

        {/* Right column — preview (sticky) */}
        <div className="top-22 lg:sticky">
          <div className="overflow-hidden rounded-2xl border border-[#e8ecf0] bg-white">
            <div className="flex items-center gap-2 border-b border-[#e8ecf0] bg-[#fafbfc] px-4.5 py-3.5">
              <div className="flex size-7 items-center justify-center rounded-[7px] bg-[#e8f8f7]">
                <Eye size={14} className="text-[#4ECDC4]" />
              </div>
              <span className="text-sm font-bold text-[#4A4A4A]">
                Brief Preview
              </span>
              {canPublish && (
                <span className="ml-auto rounded-md bg-[#e8f8f7] px-1.75 py-0.5 text-[11px] font-bold text-[#0d9488]">
                  ✓ พร้อมแล้ว
                </span>
              )}
            </div>
            <div className="flex flex-col gap-3 px-4.5 py-3.5">
              <div>
                <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[#8a90a3]">
                  Campaign
                </div>
                <div className="text-[15px] font-bold text-[#4A4A4A]">
                  {previewPv('name') || (
                    <span className="text-[#e8ecf0]">ยังไม่ได้กรอก…</span>
                  )}
                </div>
              </div>
              <div>
                <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[#8a90a3]">
                  Platforms
                </div>
                <div className="flex gap-1.5">
                  {platforms.map(p => (
                    <span
                      key={p}
                      className="rounded-md bg-[#f5f7fa] px-2 py-0.75 text-xs font-semibold text-[#4A4A4A]"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              {(
                [
                  ['Key Messages', 'keys'],
                  ["Do's & Don'ts", 'dos'],
                  ['Deliverables', 'deliverables'],
                ] as const
              ).map(([label, key]) => (
                <div key={key}>
                  <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[#8a90a3]">
                    {label}
                  </div>
                  <div
                    className={`whitespace-pre-wrap text-[13px] leading-relaxed ${
                      previewPv(key) ? 'text-[#4A4A4A]' : 'text-[#e8ecf0]'
                    }`}
                  >
                    {previewPv(key)
                      ? previewPv(key).length > 120
                        ? previewPv(key).slice(0, 120) + '…'
                        : previewPv(key)
                      : 'ยังไม่ได้กรอก…'}
                  </div>
                </div>
              ))}
              <div>
                <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[#8a90a3]">
                  Deadline
                </div>
                <div
                  className={`text-[13px] ${
                    form.deadline
                      ? 'font-bold text-amber-600'
                      : 'text-[#e8ecf0]'
                  }`}
                >
                  {form.deadline
                    ? new Date(form.deadline).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'ยังไม่ได้ตั้ง…'}
                </div>
              </div>
              {needsTranslation && (
                <div
                  className={`rounded-lg px-3 py-2 ${
                    translated
                      ? 'border border-green-200 bg-green-50'
                      : 'border border-[#e8ecf0] bg-[#f5f7fa]'
                  }`}
                >
                  <div className="mb-0.75 text-[11px] font-bold uppercase tracking-wide text-[#8a90a3]">
                    Translation
                  </div>
                  <div
                    className={`flex items-center gap-1.25 text-[13px] ${
                      translated
                        ? 'font-semibold text-green-600'
                        : 'text-[#8a90a3]'
                    }`}
                  >
                    {translated ? (
                      <>
                        <CheckCircle size={12} />
                        แปลเป็น {targetLang?.name} {targetLang?.flag} แล้ว
                      </>
                    ) : (
                      `ยังไม่ได้แปล → ${targetLang?.name} ${targetLang?.flag}`
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
