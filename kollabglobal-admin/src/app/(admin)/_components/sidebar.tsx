"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { FileText, Users, Tag, Package } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
  { label: "Campaign", href: "/campaigns", icon: FileText },
  { label: "Influencer", href: "/creators", icon: Users },
  { label: "Brand", href: "/brands", icon: Tag },
  { label: "Package", href: "/packages", icon: Package },
];

function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r border-border-ui bg-white">
      {/* Header: K logo + KOLLAB + Admin badge */}
      <SidebarHeader className="h-14 flex-row items-center gap-2 px-3.5 py-0 border-b border-border-ui">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand text-white font-extrabold text-sm select-none">
          K
        </div>
        <span className="font-extrabold text-dark tracking-tight text-sm group-data-[collapsible=icon]:hidden whitespace-nowrap">
          KOLLAB
        </span>
        <span className="text-ghost bg-raised border border-border-ui rounded px-1.5 py-px text-[10px] leading-none group-data-[collapsible=icon]:hidden whitespace-nowrap">
          Admin
        </span>
      </SidebarHeader>

      {/* Nav items */}
      <SidebarContent className="px-2 py-2">
        <SidebarMenu>
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  render={<Link href={href} />}
                  isActive={isActive}
                  tooltip={label}
                  size="default"
                  className={
                    isActive
                      ? "bg-teal-bg text-teal font-bold hover:bg-teal-bg hover:text-teal"
                      : "text-muted-text hover:bg-hover hover:text-dark"
                  }
                >
                  <Icon className="shrink-0" />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer: green dot + role */}
      <SidebarFooter className="border-t border-border-ui px-3.5 py-3">
        <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center">
          <div className="flex items-center gap-1.5 group-data-[collapsible=icon]:hidden">
            <span className="h-1.5 w-1.5 rounded-full bg-good shrink-0" />
            <span className="text-xs text-ghost">Admin</span>
          </div>
          <SidebarTrigger className="text-ghost hover:text-dark" />
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

export function AdminSidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      {children}
    </SidebarProvider>
  );
}
