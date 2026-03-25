"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Link,
  Package,
  Target,
  Truck,
  Upload,
} from "lucide-react";
import { useCampaignStore } from "@/stores/campaign-store";
import { useImageUpload } from "@/hooks/use-image-upload";

function typeEmoji(cat: string, isService: boolean): string {
  if (!isService) {
    if (cat.includes("Food") || cat.includes("Snack")) return "🥭";
    if (cat.includes("Beauty") || cat.includes("Skincare")) return "✨";
    if (cat.includes("Health")) return "🌿";
    if (cat.includes("Fashion")) return "👕";
    if (cat.includes("Beverage")) return "🧋";
    if (cat.includes("Electronics")) return "📱";
    if (cat.includes("Home")) return "🏠";
    return "📦";
  } else {
    if (cat.includes("ร้านอาหาร") || cat.includes("คาเฟ่")) return "🍽️";
    if (cat.includes("ท่องเที่ยว") || cat.includes("โรงแรม")) return "✈️";
    if (cat.includes("ความงาม") || cat.includes("สปา")) return "💆";
    if (cat.includes("ฟิตเนส") || cat.includes("สุขภาพ")) return "💪";
    if (cat.includes("การศึกษา") || cat.includes("คอร์ส")) return "📚";
    if (cat.includes("แอป") || cat.includes("Software")) return "💻";
    if (cat.includes("อสังหา")) return "🏢";
    return "🔧";
  }
}

export default function AddProductPage() {
  const router = useRouter();
  const {
    promotionType,
    productData,
    setPromotionType,
    setProduct,
  } = useCampaignStore();

  const [type, setType] = useState<"product" | "service" | null>(
    promotionType === "PRODUCT"
      ? "product"
      : promotionType === "SERVICE"
        ? "service"
        : null,
  );
  const [brandName, setBrandName] = useState(productData?.brandName ?? "");
  const [name, setName] = useState(productData?.productName ?? "");
  const [category, setCategory] = useState(productData?.category ?? "");
  const [description, setDescription] = useState(
    productData?.description ?? "",
  );
  const [sellingPoints, setSellingPoints] = useState(
    productData?.sellingPoints ?? "",
  );
  const [url, setUrl] = useState(productData?.url ?? "");
  const [weight, setWeight] = useState(productData?.weight?.toString() ?? "");
  const [length, setLength] = useState(productData?.length?.toString() ?? "");
  const [width, setWidth] = useState(productData?.width?.toString() ?? "");
  const [height, setHeight] = useState(productData?.height?.toString() ?? "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productCats, setProductCats] = useState<string[]>([]);
  const [serviceCats, setServiceCats] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/categories?type=product').then(r => r.json()).then((d: { name: string }[]) => setProductCats(d.map(c => c.name)));
    fetch('/api/categories?type=service').then(r => r.json()).then((d: { name: string }[]) => setServiceCats(d.map(c => c.name)));
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { imageUrl, uploading, handleFileSelect, upload } = useImageUpload(productData?.imageUrl ?? undefined);

  const isService = type === "service";
  const categories = isService ? serviceCats : productCats;
  const isValid = !!(type && brandName.trim() && name.trim() && category);

  function handleTypeChange(t: "product" | "service") {
    setType(t);
    setCategory("");
  }

  async function handleSubmit() {
    if (!isValid || !type || isSubmitting) return;
    setIsSubmitting(true);
    try {
    const storedImageUrl = await upload();
    setPromotionType(type === "product" ? "PRODUCT" : "SERVICE");
    setProduct({
      brandName: brandName.trim(),
      productName: name.trim(),
      category,
      description: description.trim(),
      sellingPoints: sellingPoints.trim(),
      url: url.trim(),
      imageUrl: storedImageUrl ?? "",
      isService,
      weight: weight ? parseFloat(weight) : undefined,
      length: length ? parseFloat(length) : undefined,
      width: width ? parseFloat(width) : undefined,
      height: height ? parseFloat(height) : undefined,
    });
    router.push("/campaigns/new/package");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* page header */}
      <div className="border-b border-border-ui bg-white px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-275">
          <button
            onClick={() => router.push("/campaigns/new/country")}
            className="mb-2.5 flex cursor-pointer items-center gap-1.5 border-none bg-transparent text-sm font-semibold text-muted-text"
          >
            <ArrowLeft size={16} />
            กลับไปเลือกตลาด
          </button>
          <h1 className="m-0 text-[20px] font-bold text-dark sm:text-[26px]">
            เพิ่มสินค้าหรือบริการที่จะโปรโมท
          </h1>
          <p className="m-0 mt-0.5 text-sm text-muted-text">
            กรอกข้อมูลให้ครีเอเตอร์เข้าใจสิ่งที่ต้องโปรโมท
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-265 px-4 py-7 sm:px-6 lg:px-8">
        {/* Promotion type selector */}
        <div className="mb-5 rounded-2xl border-2 border-border-ui bg-white p-5.5">
          <div className="mb-3.5 text-[15px] font-bold text-dark">
            คุณต้องการโปรโมทอะไร? <span className="text-red-500">*</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              {
                id: "product" as const,
                label: "สินค้า",
                desc: "โปรโมทสินค้าที่จับต้องได้ และจัดส่งให้ครีเอเตอร์รีวิว",
                icon: "📦",
              },
              {
                id: "service" as const,
                label: "บริการ",
                desc: "โปรโมทบริการ ร้านค้า แอป หรือประสบการณ์ต่างๆ",
                icon: "🎯",
              },
            ].map((t) => {
              const active = type === t.id;
              const isProduct = t.id === "product";
              return (
                <button
                  key={t.id}
                  onClick={() => handleTypeChange(t.id)}
                  className={`flex cursor-pointer items-start gap-3.5 rounded-xl border-2 p-4 text-left transition-all ${
                    active
                      ? isProduct
                        ? "border-brand bg-brand-light"
                        : "border-secondary-brand bg-secondary-brand-light"
                      : "border-border-ui bg-white"
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-[22px] transition-all ${
                      active
                        ? isProduct
                          ? "bg-brand"
                          : "bg-secondary-brand"
                        : isProduct
                          ? "bg-brand/10"
                          : "bg-secondary-brand/10"
                    }`}
                  >
                    {t.icon}
                  </div>
                  <div className="flex-1">
                    <div
                      className={`mb-1 text-[15px] font-bold ${
                        active
                          ? isProduct
                            ? "text-brand"
                            : "text-secondary-brand"
                          : "text-dark"
                      }`}
                    >
                      {t.label}
                    </div>
                    <div className="text-[13px] leading-relaxed text-muted-text">
                      {t.desc}
                    </div>
                  </div>
                  <div
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                      active
                        ? isProduct
                          ? "border-brand bg-brand"
                          : "border-secondary-brand bg-secondary-brand"
                        : "border-[#ccc] bg-transparent"
                    }`}
                  >
                    {active && (
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <polyline
                          points="20 6 9 17 4 12"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form grid (shown after type selected) */}
        {type && (
          <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Left column */}
            <div className="flex flex-col gap-5">
              {/* Image upload card */}
              <div className="rounded-2xl border-2 border-border-ui bg-white p-5.5">
                <div className="mb-3.5 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-light">
                    <Upload size={16} className="text-brand" />
                  </div>
                  <span className="text-[15px] font-bold text-dark">
                    รูป{isService ? "บริการ" : "สินค้า"}
                  </span>
                  <span className="text-xs text-muted-text">(ไม่บังคับ)</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative h-46 w-full cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-all ${
                    imageUrl
                      ? "border-brand"
                      : "border-border-ui bg-[#fafbfc]"
                  } ${!imageUrl ? "flex flex-col items-center justify-center gap-1.5" : ""}`}
                >
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt="preview"
                      className="absolute inset-0 h-full w-full object-contain"
                    />
                  ) : uploading ? (
                    <span className="text-sm text-muted-text">
                      กำลังอัปโหลด...
                    </span>
                  ) : (
                    <>
                      <Upload size={20} className="text-muted-text" />
                      <span className="text-[13px] text-muted-text">
                        คลิกเพื่ออัปโหลดรูป
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Product / Service info card */}
              <div className="rounded-2xl border-2 border-border-ui bg-white p-5.5">
                <div className="mb-4 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-brand-light">
                    {isService ? (
                      <Target size={16} className="text-secondary-brand" />
                    ) : (
                      <Package size={16} className="text-secondary-brand" />
                    )}
                  </div>
                  <span className="text-[15px] font-bold text-dark">
                    ข้อมูล{isService ? "บริการ" : "สินค้า"}
                  </span>
                  <span className="text-xs text-red-500">*</span>
                </div>

                <div className="mb-3.5">
                  <label className="mb-1.5 block text-[13px] font-semibold text-dark">
                    ชื่อแบรนด์ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="เช่น KOLLAB, FitLife, The Table"
                    className={`w-full rounded-[10px] border-[1.5px] px-3.5 py-2.75 text-sm outline-none transition-colors ${
                      brandName ? "border-brand/60" : "border-border-ui"
                    }`}
                  />
                </div>

                <div className="mb-3.5">
                  <label className="mb-1.5 block text-[13px] font-semibold text-dark">
                    ชื่อ{isService ? "บริการ" : "สินค้า"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={
                      isService
                        ? "เช่น คอร์สเรียนโยคะออนไลน์, ร้านอาหารไทย The Table"
                        : "เช่น มะม่วงอบแห้ง Premium"
                    }
                    className={`w-full rounded-[10px] border-[1.5px] px-3.5 py-2.75 text-sm outline-none transition-colors ${
                      name ? "border-brand/60" : "border-border-ui"
                    }`}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-dark">
                    หมวดหมู่ <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((cat) => {
                      const active = category === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setCategory(cat)}
                          className={`flex cursor-pointer items-center gap-1 rounded-lg border px-3 py-1.75 text-xs font-semibold transition-all ${
                            active
                              ? "border-brand bg-brand-light text-brand"
                              : "border-border-ui bg-white text-dark"
                          }`}
                        >
                          <span className="text-sm">
                            {typeEmoji(cat, isService)}
                          </span>
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-5">
              {/* Creator details card */}
              <div className="rounded-2xl border-2 border-border-ui bg-white p-5.5">
                <div className="mb-4 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0f4ff]">
                    <FileText size={16} color="#7c6ef7" />
                  </div>
                  <span className="text-[15px] font-bold text-dark">
                    รายละเอียดสำหรับครีเอเตอร์
                  </span>
                </div>

                <div className="mb-3.5">
                  <label className="mb-1.5 block text-[13px] font-semibold text-dark">
                    URL {isService ? "บริการ" : "สินค้า"}{" "}
                    <span className="text-[11px] font-normal text-muted-text">
                      (ไม่บังคับ)
                    </span>
                  </label>
                  <div className="relative">
                    <Link
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text"
                    />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder={
                        isService
                          ? "https://www.yourservice.com"
                          : "https://www.yourshop.com/product"
                      }
                      className={`w-full rounded-[10px] border-[1.5px] py-2.5 pl-8 pr-3.5 text-sm outline-none transition-colors ${
                        url ? "border-brand/60" : "border-border-ui"
                      }`}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-muted-text">
                    ใส่ลิงก์เพื่อให้ AI ดึงข้อมูลมาช่วยสร้าง Brief ได้อัตโนมัติ
                  </p>
                </div>

                <div className="mb-3.5">
                  <label className="mb-1.5 block text-[13px] font-semibold text-dark">
                    รายละเอียด{" "}
                    <span className="text-[11px] font-normal text-muted-text">
                      สั้นๆ
                    </span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={
                      isService
                        ? "เช่น คอร์สโยคะสำหรับผู้เริ่มต้น เรียนออนไลน์ได้ทุกที่ทุกเวลา"
                        : "เช่น ผลไม้อบแห้งจากสวนจันทบุรี ไม่ใส่สารกันบูด"
                    }
                    rows={3}
                    className="w-full min-h-18 resize-y rounded-[10px] border-[1.5px] border-border-ui px-3.5 py-2.75 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-dark">
                    จุดเด่น / Selling Points
                  </label>
                  <textarea
                    value={sellingPoints}
                    onChange={(e) => setSellingPoints(e.target.value)}
                    placeholder={
                      isService
                        ? "เช่น มีใบประกาศนียบัตร, ครูผู้สอนระดับสากล"
                        : "เช่น ได้รับรางวัล OTOP 5 ดาว"
                    }
                    rows={2}
                    className="w-full min-h-14 resize-y rounded-[10px] border-[1.5px] border-border-ui px-3.5 py-2.75 text-sm outline-none"
                  />
                </div>
              </div>

              {/* Shipping card (product only) */}
              {!isService && (
                <div className="rounded-2xl border-2 border-border-ui bg-white p-5.5">
                  <div className="mb-1 flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                      <Truck size={16} className="text-warning-text" />
                    </div>
                    <span className="text-[15px] font-bold text-dark">
                      ข้อมูลจัดส่ง
                    </span>
                    <span className="text-xs text-muted-text">(ไม่บังคับ)</span>
                  </div>
                  <p className="mb-3.5 ml-10.5 text-xs text-muted-text">
                    กรอกเพื่อประเมินค่าจัดส่งสินค้าให้ครีเอเตอร์
                  </p>

                  <div className="mb-3">
                    <label className="mb-1.5 block text-[13px] font-semibold text-dark">
                      น้ำหนัก (กรัม)
                    </label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="เช่น 250"
                      className="w-full rounded-[10px] border-[1.5px] border-border-ui px-3.5 py-2.5 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-dark">
                      ขนาด (ซม.)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          [length, setLength, "กว้าง"],
                          [width, setWidth, "ยาว"],
                          [height, setHeight, "สูง"],
                        ] as [string, (v: string) => void, string][]
                      ).map(([val, setter, placeholder]) => (
                        <input
                          key={placeholder}
                          type="number"
                          value={val}
                          onChange={(e) => setter(e.target.value)}
                          placeholder={placeholder}
                          className="w-full rounded-[10px] border-[1.5px] border-border-ui px-3 py-2.5 text-sm outline-none"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* No-shipping banner (service only) */}
              {isService && (
                <div className="flex items-center gap-2.5 rounded-xl border border-secondary-brand/20 bg-secondary-brand-light px-4.5 py-3.5">
                  <span className="shrink-0 text-xl">✅</span>
                  <div>
                    <div className="mb-0.5 text-[13px] font-semibold text-secondary-brand">
                      ไม่ต้องจัดส่งสินค้า
                    </div>
                    <div className="text-xs leading-relaxed text-muted-text">
                      แคมเปญบริการไม่มีขั้นตอนส่งของ — ครีเอเตอร์จะรับ Brief
                      และเริ่มสร้างคอนเทนต์ได้เลย
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="flex justify-center pb-10">
          <button
            disabled={!isValid || isSubmitting}
            onClick={handleSubmit}
            className={`w-full rounded-xl border-none px-8 py-3.5 text-[15px] font-semibold text-white transition-all sm:w-auto ${
              isValid && !isSubmitting
                ? "cursor-pointer bg-brand"
                : "cursor-not-allowed bg-[#ccc]"
            }`}
          >
            ยืนยัน — ถัดไป
          </button>
        </div>
      </div>
    </div>
  );
}
