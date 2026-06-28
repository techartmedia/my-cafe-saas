"use client";

import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function MasterAdmin() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState("Basic");
  const [loading, setLoading] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState<any>(null);

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const safeSlug = slug.toLowerCase().replace(/\s+/g, "-");

    const { data: tenant, error } = await supabase
      .from("system_tenants")
      .insert([{ business_name: name, subdomain_slug: safeSlug, contact_email: email, subscription_tier: tier }])
      .select()
      .single();

    if (error) {
      alert("Deployment failure: " + error.message);
    } else {
      await supabase.from("tenant_menus").insert([
        { tenant_id: tenant.id, name: "Margherita Pizza", category: "Pizza", price: 249, description: "Classic melted mozzarella over crust" },
        { tenant_id: tenant.id, name: "Cheese Masala Maggi", category: "Maggi", price: 99, description: "Street style spiced noodles with grated cheese" }
      ]);
      setActiveWorkspace(tenant);
      alert(`🚀 Successfully spun up infrastructure for ${name}!`);
    }
    setLoading(false);
  };

  return (
    <main className="max-w-4xl mx-auto p-8 space-y-8">
      <div>
        <span className="text-[10px] tracking-widest text-cyan-400 uppercase font-mono font-bold bg-cyan-950/50 border border-cyan-900 px-3 py-1 rounded-full">SaaS Provisioning Engine</span>
        <h1 className="text-3xl font-black mt-2">Onboard New Restaurant Clients</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form onSubmit={handleOnboard} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Business Name</label>
            <input type="text" required placeholder="e.g., Brew & Bites Cafe" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#070a13] border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500" />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">URL Extension Slug</label>
            <input type="text" required placeholder="e.g., brewbites" value={slug} onChange={e => setSlug(e.target.value)} className="w-full bg-[#070a13] border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 font-mono outline-none focus:border-cyan-500" />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Owner Email</label>
            <input type="email" required placeholder="owner@cafe.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#070a13] border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500" />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Billing Account Assignment</label>
            <select value={tier} onChange={e => setTier(e.target.value)} className="w-full bg-[#070a13] border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-cyan-400 outline-none">
              <option value="Basic">Basic Plan (Free Tier Limit: 15 Items)</option>
              <option value="Pro">Pro Plan (Paid Premium License)</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 disabled:opacity-50 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-widest">
            {loading ? "Allocating Infrastructure..." : "⚡ Build Digital Infrastructure"}
          </button>
        </form>

        <div className="bg-[#0f172a] border border-slate-850 p-6 rounded-2xl flex flex-col justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Live Client Workspace Links</h2>
          {activeWorkspace ? (
            <div className="space-y-3 font-mono text-xs text-slate-300">
              <div className="p-3 bg-emerald-950/30 border border-emerald-900 rounded-xl text-emerald-400 font-bold mb-2">✓ Deployment Container Active</div>
              <div>🛍️ Customer View: <span className="text-cyan-400">/store/{activeWorkspace.subdomain_slug}</span></div>
              <div>👨‍🍳 Kitchen KDS: <span className="text-amber-400">/store/{activeWorkspace.subdomain_slug}/kitchen</span></div>
              <div>🖥️ Counter Admin: <span className="text-blue-400">/store/{activeWorkspace.subdomain_slug}/admin</span></div>
            </div>
          ) : (
            <p className="text-slate-500 italic text-xs text-center py-16">Deploy a client system using the onboarding engine form on the left to review custom routing paths.</p>
          )}
        </div>
      </div>
    </main>
  );
}