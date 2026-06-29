"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function MasterAdminPanel() {
  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState("Basic");
  const [clients, setClients] = useState<any[]>([]);
  const [building, setBuilding] = useState(false);

  const loadAllClients = async () => {
    const { data } = await supabase.from("system_tenants").select("*").order("created_at", { ascending: false });
    if (data) setClients(data);
  };

  useEffect(() => {
    loadAllClients();
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !slug || !email) return;
    setBuilding(true);

    const { error } = await supabase.from("system_tenants").insert([
      { business_name: businessName, subdomain_slug: slug.toLowerCase().trim(), owner_email: email, subscription_tier: tier }
    ]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("🎉 Success! New cafe infrastructure is ready.");
      setBusinessName("");
      setSlug("");
      setEmail("");
      loadAllClients();
    }
    setBuilding(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0f1d] to-[#070a14] text-slate-200 p-6 sm:p-12 antialiased">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Top Header */}
        <header className="border-b border-slate-800/80 pb-6">
          <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-950/40 border border-cyan-800/50 px-3 py-1 rounded-md">
            SaaS Provisioning Engine
          </span>
          <h1 className="text-3xl font-black text-white uppercase mt-3 tracking-tight">Onboard New Restaurant Clients</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Input Form */}
          <form onSubmit={handleCreateClient} className="lg:col-span-5 bg-[#0d1527]/40 border border-slate-800/80 backdrop-blur-md p-6 rounded-2xl space-y-4 shadow-xl">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-2 mb-2">Client Details Form</h2>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Business Name</label>
              <input type="text" required placeholder="e.g., Cup & Cakes" value={businessName} onChange={e => setBusinessName(e.target.value)} className="w-full bg-[#070a14] border border-slate-700/80 rounded-xl px-3.5 py-3 text-xs text-white outline-none focus:border-cyan-500 transition-colors" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">URL Extension Slug</label>
              <input type="text" required placeholder="e.g., brewbites" value={slug} onChange={e => setSlug(e.target.value)} className="w-full bg-[#070a14] border border-slate-700/80 rounded-xl px-3.5 py-3 text-xs text-white outline-none focus:border-cyan-500 transition-colors font-mono" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Owner Email</label>
              <input type="email" required placeholder="owner@cafe.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#070a14] border border-slate-700/80 rounded-xl px-3.5 py-3 text-xs text-white outline-none focus:border-cyan-500 transition-colors" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Billing Account Assignment</label>
              <select value={tier} onChange={e => setTier(e.target.value)} className="w-full bg-[#070a14] border border-slate-700/80 rounded-xl px-3.5 py-3 text-xs font-black text-cyan-400 outline-none cursor-pointer">
                <option value="Basic">Basic Plan (Free Tier Limit: 15 Items)</option>
                <option value="Pro">Pro Plan (Premium Unlimited Tier)</option>
              </select>
            </div>

            <button type="submit" disabled={building} className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl hover:opacity-95 shadow-lg shadow-cyan-950/20 active:scale-[0.98] disabled:opacity-40 transition-all cursor-pointer">
              {building ? "Building System..." : "⚡ Build Digital Infrastructure"}
            </button>
          </form>

          {/* Right: Active Live Links */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 pl-1">Live Client Workspace Links</h2>
            
            {clients.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-8 bg-[#0d1527]/20 border border-slate-800/60 rounded-2xl text-center">Deploy a client system using the onboarding engine form on the left to review custom routing paths.</p>
            ) : (
              <div className="space-y-3">
                {clients.map(client => (
                  <div key={client.id} className="bg-[#0d1527]/30 border border-slate-800/60 p-5 rounded-xl space-y-3 shadow-md">
                    <div className="flex justify-between items-center border-b border-slate-800/40 pb-2">
                      <h3 className="font-extrabold text-white text-base uppercase">{client.business_name}</h3>
                      <span className="text-[9px] uppercase font-mono bg-cyan-950/40 text-cyan-400 border border-cyan-900 px-2 py-0.5 rounded font-bold">{client.subscription_tier}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      <a href={`/store/${client.subdomain_slug}`} target="_blank" className="bg-[#070a14] border border-slate-800 text-center text-[10px] font-black uppercase py-2 rounded-lg text-slate-300 hover:text-cyan-400 hover:border-slate-700 transition-colors">📱 Customer Menu</a>
                      <a href={`/store/${client.subdomain_slug}/kitchen`} target="_blank" className="bg-[#070a14] border border-slate-800 text-center text-[10px] font-black uppercase py-2 rounded-lg text-slate-300 hover:text-amber-400 hover:border-slate-700 transition-colors">👨‍🍳 Kitchen TV</a>
                      <a href={`/store/${client.subdomain_slug}/admin`} target="_blank" className="bg-[#070a14] border border-slate-800 text-center text-[10px] font-black uppercase py-2 rounded-lg text-slate-300 hover:text-emerald-400 hover:border-slate-700 transition-colors">💼 Cash Counter</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}