import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="animate-fade-up w-full max-w-sm">
        {/* Logo + brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-lg font-extrabold text-white">
              K
            </div>
            <span className="text-lg font-extrabold tracking-tight">KOLLAB</span>
            <span className="rounded border border-border-ui bg-raised px-1.5 py-0.5 text-xs text-ghost">
              Admin
            </span>
          </div>
          <p className="text-sm text-muted-text">เข้าสู่ระบบผู้ดูแลระบบ</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl px-6 py-8 shadow-sm border border-border-ui">
          <h2 className="text-lg font-bold text-dark mb-1 text-center">ยินดีต้อนรับ</h2>
          <p className="text-sm text-muted-text mb-6 text-center">เข้าสู่ระบบเพื่อจัดการแพลตฟอร์ม</p>

          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
          >
            <Button
              type="submit"
              variant="outline"
              className="w-full gap-3 border-border-ui hover:border-brand hover:bg-brand/5"
            >
              <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              เข้าสู่ระบบด้วย Google
            </Button>
          </form>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-5 py-4">
            <p className="mb-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-amber-600">
              Dev Only
            </p>
            <a
              href="/api/dev/login"
              className="block w-full rounded-xl border border-amber-300 bg-white py-3 text-center text-[14px] font-semibold text-amber-700 transition-colors hover:bg-amber-50"
            >
              Login as Dev Admin
            </a>
            <p className="mt-2 text-center text-[11px] text-amber-500">
              dev-admin-1 • admin@kollab.co
            </p>
          </div>
        )}

        <p className="text-center mt-6 text-[11px] text-ghost">
          © 2026 KOLLAB Global • Admin Panel
        </p>
      </div>
    </div>
  );
}
