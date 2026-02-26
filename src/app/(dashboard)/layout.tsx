import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-[#080b12]">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-500/[0.03] blur-3xl" />
        <div className="absolute top-1/3 right-0 h-80 w-80 rounded-full bg-violet-500/[0.02] blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-500/[0.02] blur-3xl" />
      </div>

      <Sidebar />

      <div className="relative flex-1 ml-56 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6">{children}</main>
        <footer className="relative flex items-center justify-between border-t border-white/[0.06] px-6 py-4 text-xs">
          <span className="text-slate-600">
            2026&copy;{" "}
            <span className="text-slate-400 font-medium">Pulseframelabs</span>
          </span>
          <span className="flex items-center gap-1.5 cursor-pointer text-slate-600 hover:text-slate-400 transition-colors duration-200">
            <span>&#9432;</span> Support
          </span>
        </footer>
      </div>
    </div>
  );
}
