import { signIn } from '@/auth';
import { Globe } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,#e8f8f7_0%,#e8f0fa_40%,#f0ebf8_100%)] flex items-center justify-center p-4 sm:p-6">
      <div className="animate-fade-up w-full max-w-[420px]">
        {/* Logo + brand */}
        <div className="text-center mb-9">
          <div className="animate-float inline-flex mb-3">
            <div className="size-[52px] rounded-[14px] bg-[linear-gradient(135deg,#4ECDC4,#4A90D9)] flex items-center justify-center shadow-[0_8px_24px_rgba(78,205,196,0.4)]">
              <Globe size={28} color="#fff" />
            </div>
          </div>
          <h1 className="text-[24px] font-extrabold text-[#4a4a4a] mb-1 tracking-[-0.5px] sm:text-[32px]">
            KOLLAB <span className="text-[#4ECDC4]">Global</span>
          </h1>
          <p className="text-[15px] text-[#8a90a3] leading-[1.5]">
            แพลตฟอร์ม Influencer Marketing สำหรับทุกแบรนด์
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[20px] px-5 py-7 shadow-[0_12px_48px_rgba(0,0,0,0.08)] border border-[#e8ecf0] sm:px-8 sm:py-9">
          <h2 className="text-[20px] font-bold text-[#4a4a4a] mb-[6px] text-center">
            ยินดีต้อนรับ
          </h2>
          <p className="text-[14px] text-[#8a90a3] mb-7 text-center">
            เข้าสู่ระบบเพื่อจัดการแคมเปญของคุณ
          </p>

          <form
            action={async () => {
              'use server';
              await signIn('google', { redirectTo: '/' });
            }}
          >
            <button
              type="submit"
              className="w-full py-[14px] px-5 rounded-xl border-[1.5px] border-[#e8ecf0] bg-white cursor-pointer flex items-center justify-center gap-3 transition-all text-[15px] font-semibold text-[#4a4a4a] hover:border-[#4ECDC4] hover:bg-[rgba(78,205,196,0.06)] active:scale-[0.98]"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              เข้าสู่ระบบด้วย Google
            </button>
          </form>

          {/*<div className="mt-6 text-center">
            <span className="text-[13px] text-[#8a90a3]">ยังไม่มีบัญชี? </span>
            <span className="text-[13px] text-[#4ECDC4] font-semibold cursor-pointer">
              สมัครสมาชิก
            </span>
          </div>*/}
        </div>

        {/* Bottom footer */}
        <p className="text-center mt-6 text-[12px] text-[#8a90a3]">
          © 2026 KOLLAB Global • Powered by Connex
        </p>
      </div>
    </div>
  );
}
