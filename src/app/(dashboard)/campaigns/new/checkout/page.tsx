"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCampaignStore } from "@/stores/campaign-store";
import type { Package, Creator } from "@/types/index";

const formatNumber = (n: number) => n.toLocaleString("th-TH");

export default function CheckoutPage() {
  const router = useRouter();

  const {
    countryId,
    packageId,
    promotionType,
    selectedCreatorIds,
    setCountry,
    setPackage,
    setCreators,
    setPromotionType,
  } = useCampaignStore();

  const [pkg, setPkg] = useState<Package | null>(null);
  const [creators, setCreatorsState] = useState<Creator[]>([]);
  const [autoFilled, setAutoFilled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [chargeId, setChargeId] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "pending" | "completed" | "failed"
  >("idle");
  const [isCreatingCharge, setIsCreatingCharge] = useState(false);

  const refCode = useRef<string>(
    String(Math.floor(1000 + Math.random() * 9000))
  );

  // Price calculations
  const basePriceTHB = pkg
    ? pkg.numCreators * pkg.pricePerCreator * (1 - pkg.discountPct / 100)
    : 0;
  const vat = basePriceTHB * 0.07;
  const serviceFee = basePriceTHB * 0.03;
  const totalTHB = basePriceTHB + vat + serviceFee;

  // Auto-fill + data loading
  useEffect(() => {
    async function load() {
      setIsLoading(true);

      let resolvedPackageId = packageId;
      let resolvedCreatorIds = selectedCreatorIds;
      let didAutoFill = false;

      if (!countryId || !resolvedPackageId || resolvedCreatorIds.length === 0) {
        // Fetch packages, creators, and countries in parallel
        const [pkgsRes, creatorsRes, countriesRes] = await Promise.all([
          fetch("/api/packages"),
          fetch("/api/creators"),
          fetch("/api/countries"),
        ]);

        const pkgsData: Package[] = await pkgsRes.json();
        const creatorsData: Creator[] = await creatorsRes.json();
        const countriesData: { id: string }[] = await countriesRes.json();

        if (!countryId && countriesData.length > 0) {
          const randomCountry = countriesData[Math.floor(Math.random() * countriesData.length)];
          setCountry(randomCountry.id);
        }

        if (pkgsData.length > 0) {
          const randomPkg = pkgsData[Math.floor(Math.random() * pkgsData.length)];
          resolvedPackageId = randomPkg.id;
          setPackage(randomPkg.id);

          const shuffled = [...creatorsData].sort(() => Math.random() - 0.5);
          resolvedCreatorIds = shuffled
            .slice(0, randomPkg.numCreators)
            .map((c) => c.id);
          setCreators(resolvedCreatorIds);
        }

        if (!promotionType) {
          setPromotionType("PRODUCT");
        }

        didAutoFill = true;
      }

      // Fetch full data for display
      if (resolvedPackageId) {
        const [pkgsRes, creatorsRes] = await Promise.all([
          fetch("/api/packages"),
          fetch("/api/creators"),
        ]);

        const pkgsData: Package[] = await pkgsRes.json();
        const creatorsData: Creator[] = await creatorsRes.json();

        const foundPkg = pkgsData.find((p) => p.id === resolvedPackageId);
        if (foundPkg) setPkg(foundPkg);

        const selectedCreators = creatorsData.filter((c) =>
          resolvedCreatorIds.includes(c.id)
        );
        setCreatorsState(selectedCreators);
      }

      if (didAutoFill) {
        setAutoFilled(true);
      }

      setIsLoading(false);
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Polling when payment is pending
  useEffect(() => {
    if (paymentStatus !== "pending" || !chargeId) return;

    const interval = setInterval(async () => {
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
        // ignore poll errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [paymentStatus, chargeId]);

  const handleConfirmPayment = async () => {
    if (!pkg || !countryId || !packageId || !promotionType) return;
    setIsCreatingCharge(true);

    const amountSatang = Math.round(totalTHB * 100);

    try {
      const res = await fetch("/api/payments/create-charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountSatang,
          countryId,
          packageId,
          promotionType,
          creatorIds: selectedCreatorIds,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChargeId(data.chargeId);
        setQrCodeUrl(data.qrCodeUrl);
        setPaymentStatus("pending");
      } else {
        setPaymentStatus("failed");
      }
    } catch {
      setPaymentStatus("failed");
    }

    setIsCreatingCharge(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 animate-spin rounded-full border-4 border-[#4ECDC4] border-t-transparent" />
          <p className="text-sm text-[#8a90a3]">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* POC Banner */}
      {autoFilled && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <span className="font-semibold">POC Mode:</span> auto-filled missing
          data — package and creators were randomly selected for demonstration
        </div>
      )}

      {/* Page Title */}
      <div className="mb-6">
        <Link
          href="/campaigns/new/product"
          className="mb-3 inline-flex items-center gap-1 text-sm text-[#8a90a3] hover:text-[#4A4A4A]"
        >
          ← ย้อนกลับ
        </Link>
        <h1 className="text-2xl font-bold text-[#4A4A4A] sm:text-3xl">
          ชำระเงิน
        </h1>
        <p className="mt-1 text-sm text-[#8a90a3]">
          ตรวจสอบรายการและชำระเงินเพื่อเริ่มแคมเปญ
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: Order Summary */}
        <div className="space-y-4">
          {/* Package Card */}
          <div className="rounded-2xl bg-gradient-to-br from-[#e8f8f7] to-[#e8f0fa] p-6">
            <h2 className="mb-4 text-base font-bold text-[#4A4A4A]">
              รายละเอียดแพ็กเกจ
            </h2>
            {pkg ? (
              <dl className="space-y-3">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-[#8a90a3]">แพ็กเกจ</dt>
                  <dd className="text-sm font-semibold text-[#4A4A4A]">
                    {pkg.name}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-[#8a90a3]">ระยะเวลา</dt>
                  <dd className="text-sm font-semibold text-[#4A4A4A]">
                    30 วัน
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-[#8a90a3]">จำนวนครีเอเตอร์</dt>
                  <dd className="text-sm font-semibold text-[#4A4A4A]">
                    {pkg.numCreators} คน
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-[#8a90a3]">ประเภทแคมเปญ</dt>
                  <dd className="text-sm font-semibold text-[#4A4A4A]">
                    {(promotionType ?? "PRODUCT") === "PRODUCT"
                      ? "สินค้า"
                      : "บริการ"}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-[#8a90a3]">ไม่พบข้อมูลแพ็กเกจ</p>
            )}
          </div>

          {/* Creators Card */}
          <div className="rounded-2xl border border-[#e8ecf0] bg-white p-6">
            <h2 className="mb-4 text-base font-bold text-[#4A4A4A]">
              ครีเอเตอร์ที่เลือก
            </h2>
            {creators.length > 0 ? (
              <div className="space-y-2">
                {/* Avatar row */}
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {creators.slice(0, 8).map((c) => (
                    <div
                      key={c.id}
                      className="flex size-9 items-center justify-center rounded-full bg-[#e8f8f7] text-sm font-bold text-[#4ECDC4]"
                      title={c.name}
                    >
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {creators.length > 8 && (
                    <div className="flex size-9 items-center justify-center rounded-full bg-[#e8ecf0] text-xs font-bold text-[#8a90a3]">
                      +{creators.length - 8}
                    </div>
                  )}
                </div>
                {/* Creator list */}
                <ul className="space-y-1.5">
                  {creators.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center gap-2 text-sm text-[#4A4A4A]"
                    >
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#e8f8f7] text-xs font-bold text-[#4ECDC4]">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{c.name}</span>
                      <span className="text-xs text-[#8a90a3]">{c.niche}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-[#8a90a3]">ไม่พบครีเอเตอร์</p>
            )}
          </div>

          {/* Price Breakdown Card */}
          <div className="rounded-2xl border border-[#e8ecf0] bg-white p-6">
            <h2 className="mb-4 text-base font-bold text-[#4A4A4A]">
              สรุปค่าใช้จ่าย
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#8a90a3]">ค่าแพ็กเกจ</span>
                <span className="font-medium text-[#4A4A4A]">
                  {formatNumber(basePriceTHB)} THB
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#8a90a3]">VAT 7%</span>
                <span className="font-medium text-[#4A4A4A]">
                  {formatNumber(vat)} THB
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#8a90a3]">ค่าบริการ 3%</span>
                <span className="font-medium text-[#4A4A4A]">
                  {formatNumber(serviceFee)} THB
                </span>
              </div>
              <hr className="border-[#e8ecf0]" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#4A4A4A]">
                  รวมทั้งหมด
                </span>
                <span className="text-2xl font-bold text-[#4ECDC4]">
                  {formatNumber(totalTHB)} THB
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: QR Payment */}
        <div className="space-y-4">
          {/* QR Payment Card */}
          <div className="rounded-2xl bg-gradient-to-br from-[#4A4A4A] to-[#333] p-6 text-center text-white">
            <h2 className="mb-1 text-xl font-bold">สแกนเพื่อชำระเงิน</h2>
            <p className="mb-5 text-sm text-[#bbb]">
              ใช้แอปธนาคารสแกน QR Code
            </p>

            {/* QR area */}
            <div className="mx-auto mb-4 flex size-[180px] items-center justify-center rounded-xl bg-white">
              {qrCodeUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  width={180}
                  height={180}
                  className="mx-auto rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex size-12 items-center justify-center rounded-full bg-[#e8ecf0]">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-[#8a90a3]"
                    >
                      <rect
                        x="3"
                        y="3"
                        width="7"
                        height="7"
                        rx="1"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <rect
                        x="14"
                        y="3"
                        width="7"
                        height="7"
                        rx="1"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <rect
                        x="3"
                        y="14"
                        width="7"
                        height="7"
                        rx="1"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <rect
                        x="14"
                        y="14"
                        width="3"
                        height="3"
                        fill="currentColor"
                      />
                      <rect
                        x="18"
                        y="14"
                        width="3"
                        height="3"
                        fill="currentColor"
                      />
                      <rect
                        x="14"
                        y="18"
                        width="3"
                        height="3"
                        fill="currentColor"
                      />
                      <rect
                        x="18"
                        y="18"
                        width="3"
                        height="3"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <p className="text-xs text-[#8a90a3]">
                    QR Code จะปรากฏที่นี่
                  </p>
                </div>
              )}
            </div>

            {/* Reference code */}
            <p className="mb-4 text-sm text-[#bbb]">
              รหัส:{" "}
              <span className="font-mono font-semibold text-white">
                #KG-2026-{refCode.current}
              </span>
            </p>

            {/* Escrow notice */}
            <div className="rounded-xl bg-white/10 px-4 py-3 text-xs text-[#ddd]">
              ระบบ Escrow — เงินจะโอนให้ครีเอเตอร์เมื่อแคมเปญเสร็จสิ้น
            </div>
          </div>

          {/* Confirm / Status Button */}
          {paymentStatus === "failed" ? (
            <button
              disabled
              className="w-full cursor-not-allowed rounded-xl bg-red-500 py-4 font-bold text-white opacity-80"
            >
              การชำระเงินล้มเหลว
            </button>
          ) : paymentStatus === "completed" ? (
            <button
              onClick={() => router.push("/campaigns")}
              className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-[#4ECDC4] to-[#4A90D9] py-4 font-bold text-white transition-opacity hover:opacity-90"
            >
              ชำระเงินสำเร็จ ✓
            </button>
          ) : isCreatingCharge || paymentStatus === "pending" ? (
            <button
              disabled
              className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4ECDC4] to-[#4A90D9] py-4 font-bold text-white opacity-70"
            >
              <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              กำลังรอการชำระเงิน...
            </button>
          ) : (
            <button
              onClick={handleConfirmPayment}
              disabled={!pkg || !countryId || !packageId || !promotionType}
              className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-[#4ECDC4] to-[#4A90D9] py-4 font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ยืนยันการชำระเงิน
            </button>
          )}

          {/* Terms */}
          <p className="text-center text-xs text-[#8a90a3]">
            เมื่อกดยืนยัน ถือว่าคุณยอมรับเงื่อนไขการใช้บริการ
          </p>
        </div>
      </div>
    </div>
  );
}
