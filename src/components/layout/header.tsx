'use client';

import Image from 'next/image';
import Link from 'next/link';
import logoNameImg from '../../../public/images/Logo-Name.webp';
import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import type { User } from 'next-auth';

interface HeaderProps {
  user: User;
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border-ui bg-white px-4 py-3 sm:px-6 sm:py-5 lg:px-8">
      <Link href="/" className="flex items-center gap-2.5">
        <Image
          src={logoNameImg}
          alt="KOLLAB Global"
          className="w-[90px] h-auto"
          sizes="90px"
        />
      </Link>

      <div className="flex items-center gap-2 rounded-[10px] border border-border-ui bg-surface px-3 py-1.5">
        <div className="flex size-6.5 items-center justify-center overflow-hidden rounded-full bg-brand-light">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ?? 'User'}
              width={26}
              height={26}
              className="rounded-full"
            />
          ) : (
            <span className="text-sm">👤</span>
          )}
        </div>
        <span className="hidden text-[13px] font-semibold text-dark sm:inline">
          {user.name}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex cursor-pointer items-center p-0.5"
          aria-label="ออกจากระบบ"
        >
          <LogOut size={14} className="text-muted-text" />
        </button>
      </div>
    </header>
  );
}
