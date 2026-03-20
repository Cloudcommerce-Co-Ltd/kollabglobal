import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "KOLLAB Global",
  description: "Collaborative workspace for global teams",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body className="antialiased">
        <SessionProvider session={session}>{children}</SessionProvider>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
