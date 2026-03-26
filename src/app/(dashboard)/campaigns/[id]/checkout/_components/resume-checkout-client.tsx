'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { VAT_RATE, SERVICE_FEE_RATE } from '@/lib/package-utils';

type PaymentStatus = 'loading' | 'pending' | 'completed' | 'failed';

interface Creator {
  id: string;
  name: string;
  avatar: string | null;
}

interface PackageData {
  name: string;
  numCreators: number;
  price: number;
  deliverables: string[];
}

interface ProductData {
  brandName: string;
  productName: string;
  isService: boolean;
  category: string;
}

interface Props {
  campaignId: string;
  packageData: PackageData;
  productData: ProductData;
  creators: Creator[];
}

export function ResumeCheckoutClient({
  campaignId,
  packageData,
  productData,
  creators,
}: Props) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('loading');
  const [chargeId, setChargeId] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const basePrice = packageData.price;
  const vat = Math.round(basePrice * VAT_RATE);
  const serviceFee = Math.round(basePrice * SERVICE_FEE_RATE);
  const total = basePrice + vat + serviceFee;
  const numPosts = (packageData.deliverables.length ?? 1) * packageData.numCreators;
  const campaignType = productData.isService ? 'บริการ' : 'สินค้า';

  // Fetch/refresh QR code on mount via resume API
  useEffect(() => {
    const controller = new AbortController();

    async function resumePayment() {
      try {
        const res = await fetch(`/api/payments/resume/${campaignId}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          setError('ไม่สามารถโหลดข้อมูลการชำระเงินได้');
          setPaymentStatus('failed');
          return;
        }
        const data = await res.json();
        setChargeId(data.chargeId);
        setQrCodeUrl(data.qrCodeUrl);
        setPaymentStatus('pending');
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
        setPaymentStatus('failed');
      }
    }

    resumePayment();
    return () => controller.abort();
  }, [campaignId]);

  // Poll status when pending
  useEffect(() => {
    if (paymentStatus !== 'pending' || !chargeId) return;

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/${chargeId}/status`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === 'successful') {
          setPaymentStatus('completed');
        } else if (data.status === 'failed' || data.status === 'expired') {
          setPaymentStatus('failed');
        }
      } catch {
        // continue polling on network errors
      }
    }, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [paymentStatus, chargeId]);

  // Auto-redirect on success
  useEffect(() => {
    if (paymentStatus !== 'completed') return;
    if (pollingRef.current) clearInterval(pollingRef.current);

    const timer = setTimeout(() => {
      window.location.href = '/campaigns';
    }, 1500);

    return () => clearTimeout(timer);
  }, [paymentStatus]);

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="border-b border-border-ui bg-white px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-240">
          <Link
            href={`/campaigns/${campaignId}`}
            className="mb-2.5 flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-muted-text hover:text-dark transition-colors"
          >
            <ArrowLeft size={16} />
            กลับไปแคมเปญ
          </Link>
          <h1 className="m-0 text-[20px] font-bold text-dark sm:text-[26px]">
            สรุปรายการ & ชำระเงิน
          </h1>
          <p className="m-0 mt-0.5 text-sm text-muted-text">
            สแกน QR Code เพื่อดำเนินการชำระเงินให้เสร็จสิ้น
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-240 px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left column */}
          <div className="flex flex-col gap-5">
            {/* Card 1 — Package Details */}
            <div className="rounded-xl border border-brand/12 bg-linear-to-r from-brand-light to-secondary-brand-light p-5">
              <div className="mb-4 text-base font-bold text-dark">
                รายละเอียดแพ็กเกจ
              </div>
              <div className="flex flex-col gap-2.5">
                {[
                  ['แพ็กเกจ', packageData.name],
                  ['ระยะเวลา', '30 วัน'],
                  ['จำนวนโพสต์', `${numPosts} โพสต์`],
                  ['ประเภทแคมเปญ', campaignType],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-muted-text">{label}</span>
                    <span className="text-sm font-semibold text-dark">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2 — Selected Creators */}
            <div className="rounded-xl border-2 border-border-ui bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-base font-bold text-dark">ครีเอเตอร์ที่เลือก</span>
                <span className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-bold text-brand">
                  {creators.length} คน
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {creators.map(cr => (
                  <div
                    key={cr.id}
                    title={cr.name}
                    className="relative flex size-10 items-center justify-center overflow-hidden rounded-full border-2 border-brand/25 bg-brand-light"
                  >
                    <span className="text-sm font-bold text-brand">
                      {cr.name.charAt(0)}
                    </span>
                    {cr.avatar && (
                      <Image
                        src={cr.avatar}
                        alt={cr.name}
                        fill
                        className="object-cover"
                        onError={e => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                        unoptimized
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3 — Price Breakdown */}
            <div className="rounded-xl border-2 border-border-ui bg-white p-5">
              <div className="mb-4 text-base font-bold text-dark">รายละเอียดราคา</div>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-text">ค่าแพ็กเกจ</span>
                  <span className="text-sm font-semibold text-dark">
                    ฿{basePrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-text">VAT (7%)</span>
                  <span className="text-sm font-semibold text-dark">
                    ฿{vat.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-text">ค่าบริการ (3%)</span>
                  <span className="text-sm font-semibold text-dark">
                    ฿{serviceFee.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="my-4 h-0.5 bg-border-ui" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-dark">รวมทั้งหมด</span>
                <span className="text-[26px] font-extrabold text-brand">
                  ฿{total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Right column — QR Payment */}
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl bg-linear-to-br from-dark to-[#333] p-7 text-white">
              <div className="mb-1 text-[22px] font-bold">สแกนเพื่อชำระเงิน</div>
              <div className="mb-5 text-[14px] text-[#bbb]">
                ใช้แอปธนาคารสแกน QR Code
              </div>

              {/* QR Code */}
              <div
                aria-label="QR Code"
                className="mx-auto mb-4 flex h-64 w-64 items-center justify-center rounded-xl bg-white"
              >
                {paymentStatus === 'loading' && (
                  <Loader2 size={48} className="animate-spin text-dark" />
                )}
                {paymentStatus === 'pending' && qrCodeUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrCodeUrl}
                    alt="PromptPay QR Code"
                    className="size-full rounded-xl object-contain"
                  />
                )}
                {paymentStatus === 'completed' && qrCodeUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrCodeUrl}
                    alt="PromptPay QR Code"
                    className="size-full rounded-xl object-contain opacity-50"
                  />
                )}
                {paymentStatus === 'failed' && (
                  <XCircle size={48} className="text-red-500" />
                )}
              </div>

              <div className="mb-5 text-center text-[13px] text-[#bbb]">
                {paymentStatus === 'loading' && 'กำลังโหลด QR Code...'}
                {paymentStatus === 'pending' && (
                  <span className="flex items-center justify-center gap-1.5">
                    <Loader2 size={13} className="animate-spin" />
                    รอการชำระเงิน
                  </span>
                )}
                {paymentStatus === 'completed' && (
                  <span className="flex items-center justify-center gap-1.5 text-brand">
                    <CheckCircle2 size={13} />
                    ชำระเงินสำเร็จ — กำลังนำทาง...
                  </span>
                )}
                {paymentStatus === 'failed' && (
                  <span className="text-red-400">
                    {error ?? 'การชำระเงินล้มเหลว กรุณาลองใหม่'}
                  </span>
                )}
              </div>

              {/* Escrow notice */}
              <div className="rounded-xl bg-white/10 p-3 text-[13px]">
                🔒 ระบบ Escrow — เงินจะโอนให้ครีเอเตอร์เมื่อแคมเปญเสร็จสิ้น
              </div>
            </div>

            <p className="m-0 text-center text-[12px] text-muted-text">
              เมื่อสแกนและชำระเงินสำเร็จ ถือว่าคุณยอมรับเงื่อนไขการใช้บริการ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
