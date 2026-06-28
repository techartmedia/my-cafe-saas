"use client";

import React, { useEffect, useState, use } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function KitchenMonitor({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const currentSlug = resolvedParams.slug;

  const [cafeDetails, setCafeDetails] = useState<any>(null);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);

  const loadPendingOrders = async (id: string) => {
    const { data } = await supabase.from("tenant_orders").select("*").eq("tenant_id", id).in("status", ["Pending", "Cooking"]).order("created_at", { ascending: true });
    if (data) setActiveOrders(data);
  };

  useEffect(() => {
    async function setupKitchenConnection() {
      const { data: cafe } = await supabase.from("system_tenants").select("*").eq("subdomain_slug", currentSlug).single();
      if (cafe) {
        setCafeDetails(cafe);
        loadPendingOrders(cafe.id);

        supabase.channel(`kitchen-${cafe.id}`).on("postgres_changes", { event: "*", schema: "public", table: "tenant_orders", filter: `tenant_id=eq.${cafe.id}` }, () => {
          loadPendingOrders(cafe.id);
        }).subscribe();
      }
    }
    setupKitchenConnection();
  }, [currentSlug]);

  const updateOrderStatus = async (orderId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Pending" ? "Cooking" : "Ready";
    await supabase.from("tenant_orders").update({ status: nextStatus }).eq("id", orderId);
    loadPendingOrders(cafeDetails.id);
  };

  if (!cafeDetails) return <div className="min-h-screen bg-[#070a13] flex items-center justify-center text-xs font-mono tracking-wider text-slate-500">Loading Incoming Orders...</div>;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0f1d] to-[#070a14] text-slate-200 p-6 space-y-6 antialiased">
      <header className="bg-[#0d1527]/40 border border-slate-800/60 backdrop-blur-md p-5 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-xl">
        <div>
          <h1 className="text-xl font-black text-white uppercase flex items-center gap-2 tracking-tight">
            <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-xs font-black tracking-normal">LIVE</span>
            Kitchen Cooking Display Panel
          </h1>
          <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-wider">Cafe Name: {cafeDetails.business_name}</p>
        </div>
        <span className="text-[10px] text-emerald-400 bg-emerald-950/30 border border-emerald-900/60 px-3 py-1.5 rounded-full font-bold uppercase tracking-widest font-mono w-fit">
          ● Auto Refresh Active
        </span>
      </header>

      {activeOrders.length === 0 ? (
        <div className="bg-[#0d1527]/30 border border-slate-800/80 p-16 rounded-2xl text-center max-w-sm mx-auto mt-16 shadow-xl backdrop-blur-sm">
          <div className="text-4xl mb-3">✅</div>
          <h3 className="font-extrabold text-white uppercase tracking-wide">No Active Orders</h3>
          <p className="text-xs text-slate-400 mt-1">All dishes have been served perfectly!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeOrders.map(order => (
            <div key={order.id} className={`border rounded-2xl p-5 flex flex-col justify-between shadow-xl transition-all duration-200 ${order.status === "Cooking" ? "border-blue-500/40 bg-blue-950/10 shadow-blue-950/5" : "border-amber-500/40 bg-amber-950/10 shadow-amber-950/5"}`}>
              <div>
                <div className="flex justify-between items-center text-xs font-bold border-b border-slate-800/60 pb-3 mb-4">
                  <span className="bg-[#070a14] text-cyan-400 px-3 py-1 rounded border border-slate-800/80 font-mono font-black">{order.table_id}</span>
                  <span className="text-slate-400 font-medium font-mono">{new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <div className="space-y-2.5 text-sm font-extrabold text-slate-200 pl-1">
                  {order.items.map((food: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center border-b border-slate-800/30 pb-1.5">
                      <span className="tracking-wide">• {food.name}</span>
                      <span className="text-cyan-400 font-mono text-xs bg-[#070a14] border border-slate-800 px-2 py-0.5 rounded font-black">x{food.qty}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <button onClick={() => updateOrderStatus(order.id, order.status)} className={`w-full py-3 text-xs font-black uppercase tracking-widest rounded-xl text-slate-950 mt-6 active:scale-[0.98] transition-all shadow-md cursor-pointer ${order.status === "Pending" ? "bg-amber-400 hover:bg-amber-300" : "bg-blue-400 hover:bg-blue-300"}`}>
                {order.status === "Pending" ? "👨‍🍳 Start Cooking" : "✅ Mark as Ready"}
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}