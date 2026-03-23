'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bell, Globe, LogOut, Plus } from 'lucide-react';
import { signOut } from 'next-auth/react';
import type { User } from 'next-auth';

interface DashboardHeaderProps {
  user: User;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="border-b border-[#e8ecf0] bg-white px-4 py-3 sm:px-8 sm:py-5">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between">
        {/* Left: logo + divider + page title */}
        <div className="flex items-center gap-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-brand-gradient flex size-9 items-center justify-center rounded-[9px]">
              <Globe size={18} color="#fff" />
            </div>
            <span className="hidden text-[18px] font-extrabold text-[#4a4a4a] sm:inline">
              KOLLAB <span className="text-[#4ECDC4]">Global</span>
            </span>
          </Link>

          <div className="hidden h-6 w-px bg-[#e8ecf0] sm:block" />

          <div className="hidden sm:block">
            <h1 className="text-[20px] font-bold leading-tight text-[#4a4a4a]">
              แคมเปญของฉัน
            </h1>
            <p className="text-[13px] text-[#8a90a3]">
              จัดการและติดตามแคมเปญทั้งหมด
            </p>
          </div>
        </div>

        {/* Right: bell + new campaign + user pill */}
        <div className="flex items-center gap-2.5">
          <button
            className="relative cursor-pointer rounded-lg border-none bg-transparent p-2"
            aria-label="การแจ้งเตือน"
          >
            <Bell size={20} color="#4a4a4a" />
            <span className="absolute right-1 top-1 block size-2 rounded-full bg-[#e74c6c]" />
          </button>

          <Link
            href="/campaigns/new/country"
            className="hidden items-center gap-1.5 rounded-[10px] bg-[#4ECDC4] px-5 py-2.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 sm:flex"
          >
            <Plus size={16} />
            สร้างแคมเปญใหม่
          </Link>
          {/* Mobile: icon-only */}
          <Link
            href="/campaigns/new/country"
            className="flex size-9 items-center justify-center rounded-[10px] bg-[#4ECDC4] sm:hidden"
            aria-label="สร้างแคมเปญใหม่"
          >
            <Plus size={18} color="#fff" />
          </Link>

          <div className="ml-2 flex items-center gap-2 rounded-[10px] border border-[#e8ecf0] bg-[#f5f7fa] px-3 py-1.5">
            <div className="flex size-7.5 items-center justify-center overflow-hidden rounded-full bg-[#e8f8f7]">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name ?? 'User'}
                  width={30}
                  height={30}
                  className="rounded-full"
                />
              ) : (
                <span className="text-base">👤</span>
              )}
            </div>
            <span className="hidden text-[14px] font-semibold text-[#4a4a4a] sm:inline">
              {user.name}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex cursor-pointer items-center p-0.5"
              aria-label="ออกจากระบบ"
            >
              <LogOut size={15} color="#8a90a3" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
