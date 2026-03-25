'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Target, Check, Video, Calendar, MessageCircle, CheckCircle, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import type { BriefContent } from '@/lib/brief-utils';

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
    <div className="rounded-2xl border border-border-ui bg-white overflow-hidden mb-4">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-border-ui bg-[#fafbfc]">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          {icon}
        </div>
        <span className="font-bold text-dark">{title}</span>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

interface BriefViewProps {
  campaignId: string;
  brandName: string;
  productName: string;
  isService: boolean;
  isPublished: boolean;
  briefContent: string;
  briefContentTh: string | null;
  targetLang: { code: string; name: string; flag: string };
}

export function BriefView({
  campaignId,
  brandName,
  productName,
  isService,
  isPublished,
  briefContent,
  briefContentTh,
  targetLang,
}: BriefViewProps) {
  const [viewLang, setViewLang] = useState<'th' | 'tgt'>('th');
  const [translating, setTranslating] = useState(false);

  const needsTranslation = !!briefContentTh;

  let thContent: Partial<BriefContent> = {};
  let tgtContent: Partial<BriefContent> = {};
  try {
    tgtContent = JSON.parse(briefContent) as Partial<BriefContent>;
    thContent = briefContentTh ? (JSON.parse(briefContentTh) as Partial<BriefContent>) : tgtContent;
  } catch {
    thContent = {};
    tgtContent = {};
  }

  const content = viewLang === 'tgt' ? tgtContent : thContent;

  async function handleLangSwitch(lang: 'th' | 'tgt') {
    setViewLang(lang);
    if (lang === 'tgt') {
      setTranslating(true);
      await new Promise(r => setTimeout(r, 300));
      setTranslating(false);
    }
  }

  const deadline = content.deadline
    ? new Date(content.deadline).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '-';

  return (
    <div className="min-h-screen bg-surface">
      {/* Sticky header */}
      <div className="bg-white border-b border-border-ui sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <Link
            href={`/campaigns/${campaignId}`}
            className="flex items-center gap-1.5 text-sm text-muted-text hover:text-dark mb-3 transition-colors"
          >
            <ArrowLeft size={16} />
            กลับไปรายละเอียดแคมเปญ
          </Link>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-brand-light">
                <FileText size={24} className="text-brand" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-dark">Campaign Brief</h1>
                <div className="flex items-center gap-2 text-sm text-muted-text">
                  <span>{brandName}</span>
                  {isService && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary-brand-light text-secondary-brand">
                      บริการ
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {needsTranslation && (
                <div className="flex rounded-xl overflow-hidden border-2 border-accent-brand/30">
                  {(
                    [
                      ['🇹🇭 ภาษาไทย', 'th'],
                      [`${targetLang.flag} ${targetLang.name}`, 'tgt'],
                    ] as [string, 'th' | 'tgt'][]
                  ).map(([label, lang]) => (
                    <button
                      key={lang}
                      onClick={() => handleLangSwitch(lang)}
                      disabled={translating}
                      className={`px-3 py-1.5 text-sm font-bold transition-colors disabled:cursor-wait ${
                        viewLang === lang ? 'bg-accent-brand text-white' : 'bg-transparent text-muted-text'
                      }`}
                    >
                      {lang === 'tgt' && translating ? 'กำลังแปล...' : label}
                    </button>
                  ))}
                </div>
              )}
              {isPublished && (
                <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-brand-light text-teal-700">
                  <CheckCircle size={13} />
                  เผยแพร่แล้ว
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {translating ? (
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-white border border-border-ui">
            <Loader2 size={18} className="animate-spin text-accent-brand shrink-0" />
            <span className="text-sm font-semibold text-accent-brand">
              กำลังแปล Brief เป็น {targetLang.name} {targetLang.flag}...
            </span>
          </div>
        ) : (
          <>
            <Section icon={<FileText size={17} className="text-secondary-brand" />} iconBg="bg-secondary-brand-light" title="ข้อมูลพื้นฐาน">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  ['ชื่อแคมเปญ', content.name ?? '-'],
                  ['แบรนด์', brandName],
                  [isService ? 'บริการ' : 'สินค้า', productName],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-muted-text font-semibold uppercase mb-1">{label}</p>
                    <p className="text-sm font-semibold text-dark">{value}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section icon={<Target size={17} className="text-accent-brand" />} iconBg="bg-accent-brand-light" title="Key Messages">
              <p className="text-sm text-dark leading-relaxed whitespace-pre-wrap">
                {content.keys ?? 'ยังไม่มีข้อมูล Brief'}
              </p>
            </Section>

            <Section icon={<Check size={17} color="#16a34a" />} iconBg="bg-green-100" title="Do's & Don'ts">
              <pre className="text-sm text-dark leading-relaxed whitespace-pre-wrap font-sans">
                {content.dos ?? 'ยังไม่มีข้อมูล'}
              </pre>
            </Section>

            <Section icon={<Video size={17} className="text-brand" />} iconBg="bg-brand-light" title="Deliverables">
              <pre className="text-sm text-dark leading-relaxed whitespace-pre-wrap font-sans">
                {content.deliverables ?? 'ยังไม่มีข้อมูล'}
              </pre>
            </Section>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Section icon={<Calendar size={17} color="#f59e0b" />} iconBg="bg-warning-bg" title="Deadline">
                <p className="text-base font-bold text-warning-text">{deadline}</p>
              </Section>
              <Section icon={<MessageCircle size={17} className="text-secondary-brand" />} iconBg="bg-secondary-brand-light" title="Required Disclosure">
                <p className="text-sm font-semibold text-brand leading-relaxed">
                  {content.disclosure ?? '#ad #sponsored #KOLLABGlobal'}
                </p>
              </Section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
