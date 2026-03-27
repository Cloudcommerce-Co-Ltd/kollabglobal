'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  CreditCard,
  Building2,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { useQrPayment } from '@/hooks/use-qr-payment';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCampaignStore } from '@/stores/campaign-store';
import { VAT_RATE, SERVICE_FEE_RATE } from '@/lib/package-utils';

type PaymentStatus = 'idle' | 'creating' | 'pending' | 'expired' | 'completed' | 'failed';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    packageData,
    selectedCreatorsData,
    productData,
    countryData,
    promotionType,
    chargeId: storedChargeId,
    campaignId: storedCampaignId,
    qrCodeUrl: storedQrCodeUrl,
    chargeCreatedAt: storedChargeCreatedAt,
    setCheckoutData,
    clearCheckoutData,
    reset,
  } = useCampaignStore();

  const [showAltPayment, setShowAltPayment] = useState(false);
  // Restore payment state from persisted store so refresh during QR polling doesn't restart
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    storedChargeId ? 'pending' : 'idle',
  );
  const [chargeId, setChargeId] = useState<string | null>(storedChargeId);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(storedQrCodeUrl);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [campaignId, setCampaignId] = useState<string | null>(storedCampaignId);
  const idempotencyKey = useRef(crypto.randomUUID());

  const onStatusChange = useCallback((status: 'pending' | 'expired' | 'completed' | 'failed') => {
    setPaymentStatus(status);
    if (status === 'failed') clearCheckoutData();
  }, [clearCheckoutData]);

  const onRecreate = useCallback(
    (data: { chargeId: string; qrCodeUrl: string; chargeCreatedAt: number }) => {
      setChargeId(data.chargeId);
      setQrCodeUrl(data.qrCodeUrl);
      if (storedCampaignId) {
        setCheckoutData(data.chargeId, storedCampaignId, data.qrCodeUrl);
      }
    },
    [storedCampaignId, setCheckoutData],
  );

  const { secondsRemaining, recreateQr, isRecreating } = useQrPayment({
    chargeId: paymentStatus === 'pending' || paymentStatus === 'expired' ? chargeId : null,
    campaignId: storedCampaignId,
    chargeCreatedAt: storedChargeCreatedAt,
    onStatusChange,
    onRecreate,
  });

  const packageName = packageData?.name ?? '—';
  const numCreators = packageData?.numCreators ?? 0;
  const basePrice = packageData?.price ?? 0;
  const vat = Math.round(basePrice * VAT_RATE);
  const serviceFee = Math.round(basePrice * SERVICE_FEE_RATE);
  const total = basePrice + vat + serviceFee;
  const formatCountdown = (secs: number) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const numPosts = packageData
    ? (packageData.deliverables.length ?? 1) * packageData.numCreators
    : 0;
  const campaignType = productData?.isService ? 'บริการ' : 'สินค้า';

  // Auto-create charge on mount — skipped if we already have a chargeId from persisted store
  useEffect(() => {
    // Already have a charge from a previous visit (e.g. page refresh). Resume polling.
    if (storedChargeId) return;

    if (
      !packageData ||
      !countryData ||
      !productData ||
      !promotionType ||
      selectedCreatorsData.length === 0
    ) {
      return;
    }

    const controller = new AbortController();

    async function createCharge() {
      setPaymentStatus('creating');
      try {
        const res = await fetch('/api/payments/create-charge', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKey.current,
          },
          signal: controller.signal,
          body: JSON.stringify({
            countryId: countryData!.id,
            packageId: packageData!.id,
            promotionType: promotionType!,
            creatorIds: selectedCreatorsData.map(c => c.id),
            productData: {
              brandName: productData!.brandName,
              productName: productData!.productName,
              category: productData!.category,
              description: productData!.description,
              sellingPoints: productData!.sellingPoints,
              url: productData!.url ?? undefined,
              imageUrl: productData!.imageUrl ?? undefined,
              isService: productData!.isService,
              weight: productData!.weight ?? undefined,
              length: productData!.length ?? undefined,
              width: productData!.width ?? undefined,
              height: productData!.height ?? undefined,
            },
          }),
        });

        if (!res.ok) {
          setPaymentStatus('failed');
          return;
        }

        const data = await res.json();
        setChargeId(data.chargeId);
        setQrCodeUrl(data.qrCodeUrl);
        setCampaignId(data.campaignId);
        // Persist to store so a page refresh can resume without re-creating the charge
        setCheckoutData(data.chargeId, data.campaignId, data.qrCodeUrl);
        setPaymentStatus('pending');
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setPaymentStatus('failed');
      }
    }

    createCharge();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-redirect on success
  useEffect(() => {
    if (paymentStatus !== 'completed') return;

    const timer = setTimeout(() => {
      // reset() clears sessionStorage before navigating.
      // window.location.href is used intentionally — router.push() races with
      // the campaigns/new layout step guard after reset() clears the store.
      reset();
      window.location.href = '/campaigns';
    }, 1500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentStatus]);

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="border-b border-border-ui bg-white px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-240">
          <Link href="/campaigns/new/creators">
            <button className="mb-2.5 flex cursor-pointer items-center gap-1.5 border-none bg-transparent text-sm font-semibold text-muted-text">
              <ArrowLeft size={16} />
              กลับไปเลือกครีเอเตอร์
            </button>
          </Link>
          <h1 className="m-0 text-[20px] font-bold text-dark sm:text-[26px]">
            สรุปรายการ & ชำระเงิน
          </h1>
          <p className="m-0 mt-0.5 text-sm text-muted-text">
            ตรวจสอบรายการแล้วชำระเงิน
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
                  ['แพ็กเกจ', packageName],
                  ['จำนวนโพสต์', `${numPosts} โพสต์`],
                  ['ประเภทแคมเปญ', campaignType],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-muted-text">{label}</span>
                    <span className="text-sm font-semibold text-dark">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2 — Selected Creators */}
            <div className="rounded-xl border-2 border-border-ui bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-base font-bold text-dark">
                  ครีเอเตอร์ที่เลือก
                </span>
                <span className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-bold text-brand">
                  {selectedCreatorsData?.length ?? numCreators} คน
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(selectedCreatorsData ?? []).map(cr => (
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
              <div className="mb-4 text-base font-bold text-dark">
                รายละเอียดราคา
              </div>
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
                  <span className="text-sm text-muted-text">
                    ค่าบริการ (3%)
                  </span>
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

          {/* Right column */}
          <div className="flex flex-col gap-5">
            {/* Card 4 — QR Payment */}
            <div className="rounded-2xl bg-linear-to-br from-dark to-[#333] p-7 text-white">
              {showAltPayment ? (
                <div>
                  <div className="mb-5 text-[18px] font-bold">
                    เลือกวิธีชำระเงิน
                  </div>
                  <div className="mb-3 flex cursor-pointer items-center gap-3 rounded-xl border border-white/20 bg-white/10 p-4 transition-all hover:bg-white/20">
                    <CreditCard size={22} />
                    <div>
                      <div className="text-sm font-semibold">
                        บัตรเครดิต / เดบิต
                      </div>
                      <div className="text-xs text-[#bbb]">
                        Visa, Mastercard, JCB
                      </div>
                    </div>
                  </div>
                  <div className="mb-5 flex cursor-pointer items-center gap-3 rounded-xl border border-white/20 bg-white/10 p-4 transition-all hover:bg-white/20">
                    <Building2 size={22} />
                    <div>
                      <div className="text-sm font-semibold">โอนผ่านธนาคาร</div>
                      <div className="text-xs text-[#bbb]">
                        Internet Banking
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAltPayment(false)}
                    className="cursor-pointer border-none bg-transparent text-sm text-secondary-brand"
                  >
                    ← กลับไปสแกน QR
                  </button>
                </div>
              ) : (
                <div>
                  <div className="mb-1 text-[22px] font-bold">
                    สแกนเพื่อชำระเงิน
                  </div>
                  <div className="mb-5 text-[14px] text-[#bbb]">
                    ใช้แอปธนาคารสแกน QR Code
                  </div>

                  {/* QR Code */}
                  <div
                    aria-label="QR Code"
                    className="mx-auto mb-4 flex w-64 items-center justify-center rounded-xl bg-white"
                  >
                    {paymentStatus === 'creating' && (
                      <Loader2 size={48} className="animate-spin text-dark" />
                    )}
                    {(paymentStatus === 'pending' ||
                      paymentStatus === 'completed') &&
                      qrCodeUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={qrCodeUrl}
                          alt="PromptPay QR Code"
                          className="size-full rounded-xl object-contain"
                        />
                      )}
                    {paymentStatus === 'expired' && (
                      <Clock size={48} className="text-[#bbb]" />
                    )}
                    {paymentStatus === 'failed' && (
                      <XCircle size={48} color="#ef4444" />
                    )}
                  </div>

                  <div className="mb-5 text-center text-[13px] text-[#bbb]">
                    {paymentStatus === 'creating' && 'กำลังสร้าง QR Code...'}
                    {paymentStatus === 'pending' && (
                      <span className="flex items-center justify-center gap-1.5">
                        <Loader2 size={13} className="animate-spin" />
                        รอการชำระเงิน — หมดอายุใน {formatCountdown(secondsRemaining)}
                      </span>
                    )}
                    {paymentStatus === 'expired' && (
                      <div className="flex flex-col items-center gap-2">
                        <span>QR Code หมดอายุแล้ว</span>
                        <button
                          onClick={recreateQr}
                          disabled={isRecreating}
                          className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-brand bg-transparent px-3 py-1.5 text-[13px] font-semibold text-brand disabled:opacity-50"
                        >
                          {isRecreating ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <RefreshCw size={13} />
                          )}
                          สร้าง QR ใหม่
                        </button>
                      </div>
                    )}
                    {paymentStatus === 'completed' && (
                      <span className="flex items-center justify-center gap-1.5 text-brand">
                        <CheckCircle2 size={13} />
                        ชำระเงินสำเร็จ — กำลังนำทาง...
                      </span>
                    )}
                    {paymentStatus === 'failed' && (
                      <span className="text-red-400">
                        การชำระเงินล้มเหลว กรุณาลองใหม่
                      </span>
                    )}
                  </div>

                  {/* Escrow notice */}
                  <div className="mb-5 rounded-xl bg-white/10 p-3 text-[13px]">
                    🔒 ระบบ Escrow — เงินจะโอนให้ครีเอเตอร์เมื่อแคมเปญเสร็จสิ้น
                  </div>

                  <button
                    onClick={() => setShowAltPayment(true)}
                    className="cursor-pointer border-none bg-transparent text-sm text-secondary-brand"
                  >
                    เปลี่ยนวิธีชำระเงิน
                  </button>
                </div>
              )}
            </div>

            {/* Terms */}
            <p className="m-0 text-center text-[12px] text-muted-text">
              เมื่อสแกนและชำระเงินสำเร็จ ถือว่าคุณยอมรับเงื่อนไขการใช้บริการ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
