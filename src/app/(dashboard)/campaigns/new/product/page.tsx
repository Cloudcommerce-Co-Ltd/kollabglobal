import Link from "next/link";

export default function SelectProductPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <p className="mb-4">Step 2 — Add Product / Service</p>
      <Link
        href="/campaigns/new/checkout"
        className="inline-block rounded-xl bg-gradient-to-r from-[#4ECDC4] to-[#4A90D9] px-6 py-3 font-bold text-white transition-opacity hover:opacity-90"
      >
        ไปหน้าชำระเงิน →
      </Link>
    </div>
  );
}
