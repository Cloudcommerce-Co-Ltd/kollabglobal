"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCampaignStore } from "@/stores/campaign-store";
import type { Package, Creator } from "@/types/index";

const formatNumber = (n: number) => n.toLocaleString("th-TH");

function calcTotal(pkg: Package) {
  const base = pkg.numCreators * pkg.pricePerCreator * (1 - pkg.discountPct / 100);
  return base + base * 0.07 + base * 0.03;
}

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

  // Auto-fill + data loading + auto-charge creation
  useEffect(() => {
    async function load() {
      setIsLoading(true);

      let resolvedCountryId = countryId;
      let resolvedPackageId = packageId;
      let resolvedCreatorIds = selectedCreatorIds;
      let resolvedPromotionType = promotionType ?? "PRODUCT";
      let didAutoFill = false;

      if (!resolvedCountryId || !resolvedPackageId || resolvedCreatorIds.length === 0) {
        const [pkgsRes, creatorsRes, countriesRes] = await Promise.all([
          fetch("/api/packages"),
          fetch("/api/creators"),
          fetch("/api/countries"),
        ]);

        const pkgsData: Package[] = await pkgsRes.json();
        const creatorsData: Creator[] = await creatorsRes.json();
        const countriesData: { id: string }[] = await countriesRes.json();

        if (!resolvedCountryId && countriesData.length > 0) {
          const randomCountry = countriesData[Math.floor(Math.random() * countriesData.length)];
          resolvedCountryId = randomCountry.id;
          setCountry(randomCountry.id);
        }

        if (pkgsData.length > 0) {
          const randomPkg = pkgsData[Math.floor(Math.random() * pkgsData.length)];
          resolvedPackageId = randomPkg.id;
          setPackage(randomPkg.id);

          const shuffled = [...creatorsData].sort(() => Math.random() - 0.5);
          resolvedCreatorIds = shuffled.slice(0, randomPkg.numCreators).map((c) => c.id);
          setCreators(resolvedCreatorIds);
        }

        if (!promotionType) {
          setPromotionType("PRODUCT");
          resolvedPromotionType = "PRODUCT";
        }

        didAutoFill = true;
      }

      // Fetch display data
      let foundPkg: Package | null = null;
      if (resolvedPackageId) {
        const [pkgsRes, creatorsRes] = await Promise.all([
          fetch("/api/packages"),
          fetch("/api/creators"),
        ]);

        const pkgsData: Package[] = await pkgsRes.json();
        const creatorsData: Creator[] = await creatorsRes.json();

        foundPkg = pkgsData.find((p) => p.id === resolvedPackageId) ?? null;
        if (foundPkg) setPkg(foundPkg);

        setCreatorsState(creatorsData.filter((c) => resolvedCreatorIds.includes(c.id)));
      }

      if (didAutoFill) setAutoFilled(true);
      setIsLoading(false);

      // Auto-create charge immediately after data is ready
      if (foundPkg && resolvedCountryId && resolvedPackageId && resolvedPromotionType) {
        setIsCreatingCharge(true);
        const amountSatang = Math.round(calcTotal(foundPkg) * 100);
        try {
          const res = await fetch("/api/payments/create-charge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: amountSatang,
              countryId: resolvedCountryId,
              packageId: resolvedPackageId,
              promotionType: resolvedPromotionType,
              creatorIds: resolvedCreatorIds,
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
      }
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

  // Auto-redirect on success
  useEffect(() => {
    if (paymentStatus === "completed") {
      router.push("/campaigns");
    }
  }, [paymentStatus, router]);

  const basePriceTHB = pkg
    ? pkg.numCreators * pkg.pricePerCreator * (1 - pkg.discountPct / 100)
    : 0;
  const vat = basePriceTHB * 0.07;
  const serviceFee = basePriceTHB * 0.03;
  const totalTHB = basePriceTHB + vat + serviceFee;

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
                  <dd className="text-sm font-semibold text-[#4A4A4A]">{pkg.name}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-[#8a90a3]">ระยะเวลา</dt>
                  <dd className="text-sm font-semibold text-[#4A4A4A]">30 วัน</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-[#8a90a3]">จำนวนครีเอเตอร์</dt>
                  <dd className="text-sm font-semibold text-[#4A4A4A]">{pkg.numCreators} คน</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-[#8a90a3]">ประเภทแคมเปญ</dt>
                  <dd className="text-sm font-semibold text-[#4A4A4A]">
                    {(promotionType ?? "PRODUCT") === "PRODUCT" ? "สินค้า" : "บริการ"}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-[#8a90a3]">ไม่พบข้อมูลแพ็กเกจ</p>
            )}
          </div>

          {/* Creators Card — avatars only */}
          <div className="rounded-2xl border border-[#e8ecf0] bg-white p-6">
            <h2 className="mb-4 text-base font-bold text-[#4A4A4A]">
              ครีเอเตอร์ที่เลือก
            </h2>
            {creators.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {creators.map((c) => (
                  <div
                    key={c.id}
                    className="flex size-10 items-center justify-center rounded-full bg-[#e8f8f7] text-sm font-bold text-[#4ECDC4]"
                    title={c.name}
                  >
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                ))}
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
                <span className="font-medium text-[#4A4A4A]">{formatNumber(basePriceTHB)} THB</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#8a90a3]">VAT 7%</span>
                <span className="font-medium text-[#4A4A4A]">{formatNumber(vat)} THB</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#8a90a3]">ค่าบริการ 3%</span>
                <span className="font-medium text-[#4A4A4A]">{formatNumber(serviceFee)} THB</span>
              </div>
              <hr className="border-[#e8ecf0]" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#4A4A4A]">รวมทั้งหมด</span>
                <span className="text-2xl font-bold text-[#4ECDC4]">
                  {formatNumber(totalTHB)} THB
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: QR Payment */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-gradient-to-br from-[#4A4A4A] to-[#333] p-6 text-center text-white">
            <h2 className="mb-1 text-xl font-bold">สแกนเพื่อชำระเงิน</h2>
            <p className="mb-5 text-sm text-[#bbb]">ใช้แอปธนาคารสแกน QR Code</p>

            {/* QR area */}
            <div className="mx-auto mb-4 flex size-[180px] items-center justify-center rounded-xl bg-white">
              {isCreatingCharge ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="size-8 animate-spin rounded-full border-4 border-[#4ECDC4] border-t-transparent" />
                  <p className="text-xs text-[#8a90a3]">กำลังสร้าง QR Code...</p>
                </div>
              ) : qrCodeUrl ? (
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
                  <div className="size-8 animate-spin rounded-full border-4 border-[#4ECDC4] border-t-transparent" />
                  <p className="text-xs text-[#8a90a3]">กำลังโหลด...</p>
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

          {/* Status indicator */}
          {paymentStatus === "failed" ? (
            <button
              disabled
              className="w-full cursor-not-allowed rounded-xl bg-red-500 py-4 font-bold text-white opacity-80"
            >
              การชำระเงินล้มเหลว
            </button>
          ) : paymentStatus === "completed" ? (
            <div className="w-full rounded-xl bg-gradient-to-r from-[#4ECDC4] to-[#4A90D9] py-4 text-center font-bold text-white">
              ชำระเงินสำเร็จ ✓
            </div>
          ) : (
            <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4ECDC4] to-[#4A90D9] py-4 font-bold text-white opacity-70">
              <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              กำลังรอการชำระเงิน...
            </div>
          )}

          <p className="text-center text-xs text-[#8a90a3]">
            เมื่อกดยืนยัน ถือว่าคุณยอมรับเงื่อนไขการใช้บริการ
          </p>
        </div>
      </div>
    </div>
  );
}
