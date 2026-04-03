'use client';

import Image from 'next/image';
import Link from 'next/link';
import logoNameImg from '../../../public/images/Logo-Name.webp';
import { LogOut, Plus } from 'lucide-react';
import { signOut } from 'next-auth/react';
import type { User } from 'next-auth';

interface DashboardHeaderProps {
  user: User;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="border-b border-border-ui bg-white px-4 py-3 sm:px-8 sm:py-5">
      <div className="mx-auto flex max-w-275 items-center justify-between">
        {/* Left: logo + divider + page title */}
        <div className="flex items-center gap-3.5">
          <Link href="/" className="flex items-center gap-1.5">
            <Image
              src={logoNameImg}
              alt="KOLLAB Global"
              className="w-25 h-auto"
              sizes="100px"
            />
          </Link>

          <div className="hidden h-6 w-px bg-border-ui sm:block" />

          <div className="hidden sm:block">
            <h1 className="text-[20px] font-bold leading-tight text-dark">
              แคมเปญของฉัน
            </h1>
            <p className="text-[13px] text-muted-text">
              จัดการและติดตามแคมเปญทั้งหมด
            </p>
          </div>
        </div>

        {/* Right: bell + new campaign + user pill */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/campaigns/new/country?new=1"
            className="hidden items-center gap-1.5 rounded-[10px] bg-brand px-5 py-2.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 sm:flex"
          >
            <Plus size={16} />
            สร้างแคมเปญใหม่
          </Link>
          {/* Mobile: icon-only */}
          <Link
            href="/campaigns/new/country?new=1"
            className="flex size-9 items-center justify-center rounded-[10px] bg-brand sm:hidden"
            aria-label="สร้างแคมเปญใหม่"
          >
            <Plus size={18} color="#fff" />
          </Link>

          <div className="ml-2 flex items-center gap-2 rounded-[10px] border border-border-ui bg-surface px-3 py-1.5">
            <div className="flex size-7.5 items-center justify-center overflow-hidden rounded-full bg-brand-light">
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
            <span className="hidden text-[14px] font-semibold text-dark sm:inline">
              {user.name}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex cursor-pointer items-center p-0.5"
              aria-label="ออกจากระบบ"
            >
              <LogOut size={15} className="text-muted-text" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
