"use client";

import Image from "next/image";
import Link from "next/link";
import { Globe, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import type { User } from "next-auth";

interface HeaderProps {
  user: User;
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-[#e8ecf0] bg-white px-4 py-3 sm:px-6 sm:py-5 lg:px-8">
      <Link href="/" className="flex items-center gap-2.5">
        <div
          className="flex size-[34px] items-center justify-center rounded-[9px]"
          style={{ background: "linear-gradient(135deg, #4ECDC4, #4A90D9)" }}
        >
          <Globe size={17} color="#fff" />
        </div>
        <span className="text-[16px] font-extrabold text-[#4a4a4a] sm:text-[18px]">
          KOLLAB <span className="text-[#4ECDC4]">Global</span>
        </span>
      </Link>

      <div className="flex items-center gap-2 rounded-[10px] border border-[#e8ecf0] bg-[#f5f7fa] px-3 py-1.5">
        <div className="flex size-[26px] items-center justify-center overflow-hidden rounded-full bg-[#e8f8f7]">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ?? "User"}
              width={26}
              height={26}
              className="rounded-full"
            />
          ) : (
            <span className="text-sm">👤</span>
          )}
        </div>
        <span className="hidden text-[13px] font-semibold text-[#4a4a4a] sm:inline">
          {user.name}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex cursor-pointer items-center p-0.5"
          aria-label="ออกจากระบบ"
        >
          <LogOut size={14} color="#8a90a3" />
        </button>
      </div>
    </header>
  );
}
