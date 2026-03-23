'use client';

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, CreditCard, Building2, Loader2, CheckCircle2, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCampaignStore } from "@/stores/campaign-store";
import { calculatePackageTotal, VAT_RATE, SERVICE_FEE_RATE } from "@/lib/package-utils";

type PaymentStatus = "idle" | "creating" | "pending" | "completed" | "failed";

export default function CheckoutPage() {
  const router = useRouter();
  const { packageData, selectedCreatorsData, productData, countryData, promotionType } =
    useCampaignStore();

  const [showAltPayment, setShowAltPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const [chargeId, setChargeId] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const packageName = packageData?.name ?? '—';
  const numCreators = packageData?.numCreators ?? 0;
  const basePrice = packageData ? calculatePackageTotal(packageData) : 0;
  const vat = Math.round(basePrice * VAT_RATE);
  const serviceFee = Math.round(basePrice * SERVICE_FEE_RATE);
  const total = basePrice + vat + serviceFee;
  const numPosts = packageData
    ? (packageData.deliverables.length ?? 1) * packageData.numCreators
    : 0;
  const campaignType = productData?.isService ? 'บริการ' : 'สินค้า';
  const duration = '30 วัน';

  // Auto-create charge on mount
  useEffect(() => {
    if (!packageData || !countryData || !productData || !promotionType || selectedCreatorsData.length === 0) {
      return;
    }

    const controller = new AbortController();

    async function createCharge() {
      setPaymentStatus("creating");
      try {
        const res = await fetch("/api/payments/create-charge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            countryId: countryData!.id,
            packageId: packageData!.id,
            promotionType: promotionType!,
            creatorIds: selectedCreatorsData.map((c) => c.id),
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
          setPaymentStatus("failed");
          return;
        }

        const data = await res.json();
        setChargeId(data.chargeId);
        setQrCodeUrl(data.qrCodeUrl);
        setCampaignId(data.campaignId);
        setPaymentStatus("pending");
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setPaymentStatus("failed");
      }
    }

    createCharge();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll status when pending
  useEffect(() => {
    if (paymentStatus !== "pending" || !chargeId) return;

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/${chargeId}/status`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === "successful") {
          setPaymentStatus("completed");
        } else if (data.status === "failed" || data.status === "expired") {
          setPaymentStatus("failed");
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
    if (paymentStatus !== "completed") return;
    if (pollingRef.current) clearInterval(pollingRef.current);

    const timer = setTimeout(() => {
      router.push("/campaigns");
    }, 1500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentStatus]);

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      {/* Header */}
      <div className="border-b border-[#e8ecf0] bg-white px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-240">
          <Link href="/campaigns/new/creators">
            <button className="mb-2.5 flex cursor-pointer items-center gap-1.5 border-none bg-transparent text-sm font-semibold text-[#8a90a3]">
              <ArrowLeft size={16} />
              กลับไปเลือกครีเอเตอร์
            </button>
          </Link>
          <h1 className="m-0 text-[20px] font-bold text-[#4A4A4A] sm:text-[26px]">
            สรุปรายการ & ชำระเงิน
          </h1>
          <p className="m-0 mt-0.5 text-sm text-[#8a90a3]">
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
            <div className="rounded-xl border border-[#4ECDC420] bg-linear-to-r from-[#e8f8f7] to-[#e8f0fa] p-5">
              <div className="mb-4 text-base font-bold text-[#4A4A4A]">
                รายละเอียดแพ็กเกจ
              </div>
              <div className="flex flex-col gap-2.5">
                {[
                  ['แพ็กเกจ', packageName],
                  ['ระยะเวลา', duration],
                  ['จำนวนโพสต์', `${numPosts} โพสต์`],
                  ['ประเภทแคมเปญ', campaignType],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-[#8a90a3]">{label}</span>
                    <span className="text-sm font-semibold text-[#4A4A4A]">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2 — Selected Creators */}
            <div className="rounded-xl border-2 border-[#e8ecf0] bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-base font-bold text-[#4A4A4A]">
                  ครีเอเตอร์ที่เลือก
                </span>
                <span className="rounded-full bg-[#e8f8f7] px-2.5 py-0.5 text-xs font-bold text-[#4ECDC4]">
                  {selectedCreatorsData?.length ?? numCreators} คน
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(selectedCreatorsData ?? []).map(cr => (
                  <div
                    key={cr.id}
                    title={cr.name}
                    className="relative flex size-10 items-center justify-center overflow-hidden rounded-full border-2 border-[#4ECDC440] bg-[#e8f8f7]"
                  >
                    <span className="text-sm font-bold text-[#4ECDC4]">
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
            <div className="rounded-xl border-2 border-[#e8ecf0] bg-white p-5">
              <div className="mb-4 text-base font-bold text-[#4A4A4A]">
                รายละเอียดราคา
              </div>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#8a90a3]">ค่าแพ็กเกจ</span>
                  <span className="text-sm font-semibold text-[#4A4A4A]">
                    ฿{basePrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#8a90a3]">VAT (7%)</span>
                  <span className="text-sm font-semibold text-[#4A4A4A]">
                    ฿{vat.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#8a90a3]">ค่าบริการ (3%)</span>
                  <span className="text-sm font-semibold text-[#4A4A4A]">
                    ฿{serviceFee.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="my-4 h-0.5 bg-[#e8ecf0]" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#4A4A4A]">
                  รวมทั้งหมด
                </span>
                <span
                  className="font-extrabold text-[#4ECDC4]"
                  style={{ fontSize: '26px' }}
                >
                  ฿{total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">
            {/* Card 4 — QR Payment */}
            <div className="rounded-2xl bg-linear-to-br from-[#4A4A4A] to-[#333] p-7 text-white">
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
                    className="cursor-pointer border-none bg-transparent text-sm text-[#4A90D9]"
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
                    {paymentStatus === "creating" && (
                      <Loader2 size={48} color="#4A4A4A" className="animate-spin" />
                    )}
                    {(paymentStatus === "pending" || paymentStatus === "completed") && qrCodeUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrCodeUrl}
                        alt="PromptPay QR Code"
                        className="size-full rounded-xl object-contain"
                      />
                    )}
                    {paymentStatus === "failed" && (
                      <XCircle size={48} color="#ef4444" />
                    )}
                  </div>

                  <div className="mb-5 text-center text-[13px] text-[#bbb]">
                    {paymentStatus === "creating" && "กำลังสร้าง QR Code..."}
                    {paymentStatus === "pending" && (
                      <span className="flex items-center justify-center gap-1.5">
                        <Loader2 size={13} className="animate-spin" />
                        รอการชำระเงิน
                      </span>
                    )}
                    {paymentStatus === "completed" && (
                      <span className="flex items-center justify-center gap-1.5 text-[#4ECDC4]">
                        <CheckCircle2 size={13} />
                        ชำระเงินสำเร็จ — กำลังนำทาง...
                      </span>
                    )}
                    {paymentStatus === "failed" && (
                      <span className="text-red-400">การชำระเงินล้มเหลว กรุณาลองใหม่</span>
                    )}
                  </div>

                  {/* Escrow notice */}
                  <div className="mb-5 rounded-xl bg-white/10 p-3 text-[13px]">
                    🔒 ระบบ Escrow — เงินจะโอนให้ครีเอเตอร์เมื่อแคมเปญเสร็จสิ้น
                  </div>

                  <button
                    onClick={() => setShowAltPayment(true)}
                    className="cursor-pointer border-none bg-transparent text-sm text-[#4A90D9]"
                  >
                    เปลี่ยนวิธีชำระเงิน
                  </button>
                </div>
              )}
            </div>

            {/* Terms */}
            <p className="m-0 text-center text-[12px] text-[#8a90a3]">
              เมื่อสแกนและชำระเงินสำเร็จ ถือว่าคุณยอมรับเงื่อนไขการใช้บริการ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
