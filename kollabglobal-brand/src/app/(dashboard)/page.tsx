import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/auth';
import { BarChart3, ChevronRight, Plus } from 'lucide-react';
import { Header } from '@/components/layout/header';
import logoImg from '../../../public/images/Logo.webp';

export default async function DashboardPage() {
  const session = await auth();
  const userName = session?.user?.name ?? 'คุณ';

  return (
    <>
      <Header user={session!.user!} />
      <div className="flex min-h-[calc(100vh-73px)] flex-col bg-white">
        {/* Center content */}
        <div className="animate-fade-up flex flex-1 flex-col items-center justify-center px-4 sm:px-8">
          {/* Globe icon */}
          <div className="˝inline-flex items-center gap-1.5 mb-3">
            <Image
              src={logoImg}
              alt="KOLLAB Global"
              className="w-40 h-auto"
              sizes="160px"
            />
          </div>

          <h1 className="mb-2 text-center text-[22px] font-extrabold tracking-[-0.3px] text-dark sm:text-[28px]">
            ยินดีต้อนรับ, {userName} 👋
          </h1>
          <p className="mb-12 text-center text-[15px] text-muted-text">
            เชื่อมแบรนด์คุณกับครีเอเตอร์ที่ใช่ — ในไทยและทั่วโลก
          </p>

          {/* Action cards */}
          <div className="grid w-full max-w-140 grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Create campaign */}
            <Link
              href="/campaigns/new/country?new=1"
              className="group flex flex-col gap-3.5 rounded-2xl border-2 border-border-ui bg-white p-5 text-left shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-180 hover:-translate-y-0.5 hover:border-brand hover:bg-brand-light hover:shadow-[0_6px_24px_rgba(78,205,196,0.20)] sm:p-7"
            >
              <div className="flex size-11 items-center justify-center rounded-xl bg-[rgba(78,205,196,0.15)] transition-all duration-180 group-hover:bg-brand">
                <Plus
                  size={22}
                  className="text-brand transition-colors duration-180 group-hover:text-white"
                />
              </div>
              <div>
                <p className="mb-1 text-[16px] font-bold text-dark">
                  สร้างแคมเปญใหม่
                </p>
                <p className="text-[13px] leading-normal text-muted-text">
                  โปรโมทสินค้าหรือบริการของคุณผ่านครีเอเตอร์ที่เหมาะสม
                </p>
              </div>
              <div className="flex items-center gap-1 text-[13px] font-semibold text-brand">
                เริ่มเลย <ChevronRight size={15} />
              </div>
            </Link>

            {/* My campaigns */}
            <Link
              href="/campaigns"
              className="group flex flex-col gap-3.5 rounded-2xl border-2 border-border-ui bg-white p-5 text-left shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-180 hover:-translate-y-0.5 hover:border-secondary-brand hover:bg-secondary-brand-light hover:shadow-[0_6px_24px_rgba(74,144,217,0.20)] sm:p-7"
            >
              <div className="relative flex size-11 items-center justify-center rounded-xl bg-[rgba(74,144,217,0.15)] transition-all duration-180 group-hover:bg-secondary-brand">
                <BarChart3
                  size={22}
                  className="text-secondary-brand transition-colors duration-180 group-hover:text-white"
                />
              </div>
              <div>
                <p className="mb-1 text-[16px] font-bold text-dark">
                  แคมเปญของฉัน
                </p>
                <p className="text-[13px] leading-normal text-muted-text">
                  ติดตามผลและจัดการแคมเปญที่กำลังดำเนินอยู่
                </p>
              </div>
              <div className="flex items-center gap-1 text-[13px] font-semibold text-secondary-brand">
                ดูทั้งหมด <ChevronRight size={15} />
              </div>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="py-5 text-center text-[12px] text-muted-text">
          © 2026 KOLLAB Global • Powered by Connex
        </p>
      </div>
    </>
  );
}
