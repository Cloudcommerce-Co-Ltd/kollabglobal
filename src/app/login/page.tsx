import { signIn } from "@/auth";
import { Globe } from "lucide-react";

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(160deg, #e8f8f7 0%, #e8f0fa 40%, #f0ebf8 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .login-card { animation: fadeUp .6s ease; }
        .logo-icon  { animation: float 4s ease-in-out infinite; }
        .google-btn {
          width: 100%;
          padding: 14px 20px;
          border-radius: 12px;
          border: 1.5px solid #e8ecf0;
          background: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all .2s;
          font-size: 15px;
          font-weight: 600;
          color: #4a4a4a;
        }
        .google-btn:hover {
          border-color: #4ECDC4;
          background: rgba(78,205,196,.06);
        }
        .google-btn:active { transform: scale(.98); }
      `}</style>

      <div className="login-card" style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo + brand */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div
            className="logo-icon"
            style={{ display: "inline-flex", marginBottom: 12 }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: "linear-gradient(135deg, #4ECDC4, #4A90D9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px rgba(78,205,196,.4)",
              }}
            >
              <Globe size={28} color="#fff" />
            </div>
          </div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: "#4a4a4a",
              margin: "0 0 4px",
              letterSpacing: "-0.5px",
            }}
          >
            KOLLAB{" "}
            <span style={{ color: "#4ECDC4" }}>Global</span>
          </h1>
          <p style={{ fontSize: 15, color: "#8a90a3", margin: 0, lineHeight: 1.5 }}>
            แพลตฟอร์ม Influencer Marketing สำหรับทุกแบรนด์
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: "36px 32px",
            boxShadow: "0 12px 48px rgba(0,0,0,.08)",
            border: "1px solid #e8ecf0",
          }}
        >
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#4a4a4a",
              margin: "0 0 6px",
              textAlign: "center",
            }}
          >
            ยินดีต้อนรับ
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "#8a90a3",
              margin: "0 0 28px",
              textAlign: "center",
            }}
          >
            เข้าสู่ระบบเพื่อจัดการแคมเปญของคุณ
          </p>

          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
          >
            <button type="submit" className="google-btn">
              <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
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

          <div style={{ marginTop: 24, textAlign: "center" }}>
            <span style={{ fontSize: 13, color: "#8a90a3" }}>ยังไม่มีบัญชี? </span>
            <span style={{ fontSize: 13, color: "#4ECDC4", fontWeight: 600, cursor: "pointer" }}>
              สมัครสมาชิก
            </span>
          </div>
        </div>

        {/* Bottom footer */}
        <p style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "#8a90a3" }}>
          © 2026 KOLLAB Global • Powered by Connex
        </p>
      </div>
    </div>
  );
}
