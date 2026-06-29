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
      alert("🎉 Done! New cafe created.");
      setBusinessName("");
      setSlug("");
      setEmail("");
      loadAllClients();
    }
    setBuilding(false);
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <header className="border-b border-slate-700 pb-4">
          <h1 className="text-2xl font-bold text-white">Cafe Management Admin</h1>
          <p className="text-xs text-slate-400">Add new cafe shops to the system</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Input Box Form */}
          <form onSubmit={handleCreateClient} className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
            <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Create New Cafe Account</h2>
            
            <div className="space-y-1">
              <label className="text-xs text-slate-300 block">Business Name</label>
              <input type="text" required placeholder="example: Star Cafe" value={businessName} onChange={e => setBusinessName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500" />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 block">Link Extension Name (Slug)</label>
              <input type="text" required placeholder="example: starcafe" value={slug} onChange={e => setSlug(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500" />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 block">Owner Email Address</label>
              <input type="email" required placeholder="example: owner@email.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500" />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 block">Select Menu Plan Tier</label>
              <select value={tier} onChange={e => setTier(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-cyan-400 font-bold rounded-lg px-3 py-2 text-sm outline-none">
                <option value="Basic">Basic Plan (Limit: 15 Items)</option>
                <option value="Pro">Pro Plan (Unlimited Items)</option>
              </select>
            </div>

            <button type="submit" disabled={building} className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-lg transition-colors cursor-pointer disabled:opacity-50">
              {building ? "Creating System..." : "⚡ Save Cafe Infrastructure"}
            </button>
          </form>

          {/* Active Live Links Output */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Your Active Cafe Links</h2>
            
            {clients.length === 0 ? (
              <p className="text-xs text-slate-500 italic bg-slate-800/50 border border-slate-800 p-4 rounded-xl text-center">No active cafes. Use the form to add your first one.</p>
            ) : (
              <div className="space-y-3">
                {clients.map(client => (
                  <div key={client.id} className="bg-slate-800 border border-slate-700 p-4 rounded-xl space-y-3 shadow-md">
                    <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                      <h3 className="font-bold text-white text-sm">{client.business_name}</h3>
                      <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded font-mono font-bold">{client.subscription_tier}</span>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 text-xs">
                      <a href={`/store/${client.subdomain_slug}`} target="_blank" className="bg-slate-950 border border-slate-700 p-2 rounded text-slate-300 hover:text-cyan-400 transition-colors">📱 Open Customer Menu Panel</a>
                      <a href={`/store/${client.subdomain_slug}/kitchen`} target="_blank" className="bg-slate-950 border border-slate-700 p-2 rounded text-slate-300 hover:text-amber-400 transition-colors">👨‍🍳 Open Kitchen Monitor Display</a>
                      <a href={`/store/${client.subdomain_slug}/admin`} target="_blank" className="bg-slate-950 border border-slate-700 p-2 rounded text-slate-300 hover:text-emerald-400 transition-colors">💼 Open Owner Billing Desk</a>
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