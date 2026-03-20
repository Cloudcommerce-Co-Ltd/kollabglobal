import Link from 'next/link';
import { auth } from '@/auth';
import { BarChart3, ChevronRight, Globe, Plus } from 'lucide-react';

export default async function DashboardPage() {
  const session = await auth();
  const userName = session?.user?.name ?? 'คุณ';

  return (
    <div className="flex min-h-[calc(100vh-73px)] flex-col bg-white">
      {/* Center content */}
      <div className="animate-fade-up flex flex-1 flex-col items-center justify-center px-4 sm:px-8">
        {/* Globe icon */}
        <div className="bg-brand-gradient shadow-brand-glow mb-6 flex size-16 items-center justify-center rounded-[18px]">
          <Globe size={32} color="#fff" />
        </div>

        <h1 className="mb-2 text-center text-[22px] font-extrabold tracking-[-0.3px] text-[#4a4a4a] sm:text-[28px]">
          ยินดีต้อนรับ, {userName} 👋
        </h1>
        <p className="mb-12 text-center text-[15px] text-[#8a90a3]">
          เชื่อมแบรนด์คุณกับครีเอเตอร์ที่ใช่ — ในไทยและทั่วโลก
        </p>

        {/* Action cards */}
        <div className="grid w-full max-w-140 grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Create campaign */}
          <Link
            href="/campaigns/new/country"
            className="group flex flex-col gap-3.5 rounded-2xl border-2 border-[#e8ecf0] bg-white p-5 text-left shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-180 hover:-translate-y-0.5 hover:border-[#4ECDC4] hover:bg-[#e8f8f7] hover:shadow-[0_6px_24px_rgba(78,205,196,0.20)] sm:p-7"
          >
            <div className="flex size-11 items-center justify-center rounded-xl bg-[rgba(78,205,196,0.15)] transition-all duration-180 group-hover:bg-[#4ECDC4]">
              <Plus
                size={22}
                className="text-[#4ECDC4] transition-colors duration-180 group-hover:text-white"
              />
            </div>
            <div>
              <p className="mb-1 text-[16px] font-bold text-[#4a4a4a]">
                สร้างแคมเปญใหม่
              </p>
              <p className="text-[13px] leading-normal text-[#8a90a3]">
                โปรโมทสินค้าหรือบริการของคุณผ่านครีเอเตอร์ที่เหมาะสม
              </p>
            </div>
            <div className="flex items-center gap-1 text-[13px] font-semibold text-[#4ECDC4]">
              เริ่มเลย <ChevronRight size={15} />
            </div>
          </Link>

          {/* My campaigns */}
          <Link
            href="/campaigns"
            className="group flex flex-col gap-3.5 rounded-2xl border-2 border-[#e8ecf0] bg-white p-5 text-left shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-180 hover:-translate-y-0.5 hover:border-[#4A90D9] hover:bg-[#e8f0fa] hover:shadow-[0_6px_24px_rgba(74,144,217,0.20)] sm:p-7"
          >
            <div className="relative flex size-11 items-center justify-center rounded-xl bg-[rgba(74,144,217,0.15)] transition-all duration-180 group-hover:bg-[#4A90D9]">
              <BarChart3
                size={22}
                className="text-[#4A90D9] transition-colors duration-180 group-hover:text-white"
              />
            </div>
            <div>
              <p className="mb-1 text-[16px] font-bold text-[#4a4a4a]">
                แคมเปญของฉัน
              </p>
              <p className="text-[13px] leading-normal text-[#8a90a3]">
                ติดตามผลและจัดการแคมเปญที่กำลังดำเนินอยู่
              </p>
            </div>
            <div className="flex items-center gap-1 text-[13px] font-semibold text-[#4A90D9]">
              ดูทั้งหมด <ChevronRight size={15} />
            </div>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <p className="py-5 text-center text-[12px] text-[#8a90a3]">
        © 2026 KOLLAB Global • Powered by Connex
      </p>
    </div>
  );
}
