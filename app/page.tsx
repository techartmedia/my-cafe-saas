import Link from "next/link";

export default function MarketingLandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#070a13] text-center px-4">
      <div className="space-y-4 max-w-2xl">
        <span className="text-[10px] uppercase font-mono font-black tracking-widest text-cyan-400 bg-cyan-950/50 border border-cyan-900 px-3 py-1 rounded-full">
          B2B Restaurant Ecosystem
        </span>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none uppercase">
          Empower Cafes With <br />
          <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Smart QR Systems
          </span>
        </h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          The ultimate multi-tenant management interface. Spin up digital menus, live backroom kitchen feeds, and invoicing pipelines for restaurants instantly.
        </p>
        <div className="pt-4">
          <Link 
            href="/master-admin" 
            className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-widest px-8 py-4 rounded-xl shadow-lg shadow-cyan-500/10 hover:opacity-90 transition-opacity"
          >
            Open Onboarding Terminal →
          </Link>
        </div>
      </div>
    </main>
  );
}