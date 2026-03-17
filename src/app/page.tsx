import Image from "next/image";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { user } = session;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#4ECDC4]/10 to-[#4A90D9]/10">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#4A90D9]">
            KOLLAB Global
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Welcome back</p>
        </div>

        {/* User info */}
        <div className="flex flex-col items-center gap-4">
          {user.image && (
            <Image
              src={user.image}
              alt={user.name ?? "User avatar"}
              width={72}
              height={72}
              className="rounded-full ring-2 ring-[#4ECDC4]"
            />
          )}
          <div className="text-center">
            <p className="text-lg font-semibold text-zinc-800">{user.name}</p>
            <p className="text-sm text-zinc-500">{user.email}</p>
          </div>
        </div>

        <div className="my-8 h-px bg-zinc-100" />

        {/* Sign out */}
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-xl bg-[#4A90D9] px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#3a7bc8] active:scale-[0.98]"
          >
            ออกจากระบบ (Sign Out)
          </button>
        </form>
      </div>
    </div>
  );
}
