import { AdminSidebarProvider } from "./_components/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminSidebarProvider>
      <main className="flex-1 overflow-y-auto bg-surface">{children}</main>
    </AdminSidebarProvider>
  );
}
