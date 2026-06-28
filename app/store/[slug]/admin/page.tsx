"use client";

import React, { useState, useEffect, use } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function CounterAdminTerminal({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const currentSlug = resolvedParams.slug;

  const [cafeDetails, setCafeDetails] = useState<any>(null);
  const [menuList, setMenuList] = useState<any[]>([]);
  const [runningOrders, setRunningOrders] = useState<any[]>([]);
  const [selectedBill, setSelectedBill] = useState<any>(null);

  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState(0);
  const [itemCategory, setItemCategory] = useState("Pizza");
  const [showUpgradeBox, setShowUpgradeBox] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");

  const reloadCounterData = async (id: string) => {
    const { data: menu } = await supabase.from("tenant_menus").select("*").eq("tenant_id", id);
    if (menu) setMenuList(menu);
    const { data: bills } = await supabase.from("tenant_orders").select("*").eq("tenant_id", id).neq("status", "Settled").order("created_at", { ascending: false });
    if (bills) setRunningOrders(bills);
  };

  useEffect(() => {
    async function loadCounterSystem() {
      const { data: cafe } = await supabase.from("system_tenants").select("*").eq("subdomain_slug", currentSlug).single();
      if (cafe) {
        setCafeDetails(cafe);
        reloadCounterData(cafe.id);

        supabase.channel(`counter-${cafe.id}`).on("postgres_changes", { event: "*", schema: "public", table: "tenant_orders", filter: `tenant_id=eq.${cafe.id}` }, () => {
          reloadCounterData(cafe.id);
        }).subscribe();
      }
    }
    loadCounterSystem();
  }, [currentSlug]);

  const addNewFoodItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cafeDetails) return;

    if (cafeDetails.subscription_tier === "Basic" && menuList.length >= 15) {
      setShowUpgradeBox(true);
      return;
    }

    await supabase.from("tenant_menus").insert([{ tenant_id: cafeDetails.id, name: newItemName, price: newItemPrice, category: itemCategory }]);
    reloadCounterData(cafeDetails.id);
    setNewItemName("");
    setNewItemPrice(0);
  };

  const closeAndPrintBill = async () => {
    if (!selectedBill || !customerPhone) return alert("Please type the mobile number to send the digital receipt.");
    
    await supabase.from("tenant_orders").update({ status: "Settled" }).eq("id", selectedBill.id);
    window.print();

    const textMsg = `🧾 *Total Bill: ₹${selectedBill.gross_total}* at ${cafeDetails.business_name}. Thank you for visiting us!`;
    window.open(`https://wa.me/${customerPhone}?text=${encodeURIComponent(textMsg)}`, "_blank");

    setSelectedBill(null);
    setCustomerPhone("");
    reloadCounterData(cafeDetails.id);
  };

  if (!cafeDetails) return <div className="min-h-screen bg-[#070a13] flex items-center justify-center text-xs font-mono tracking-wider text-slate-500">Starting Owner Dashboard...</div>;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0f1d] to-[#070a14] text-slate-200 p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 print:block print:bg-white print:text-black print:p-0 antialiased">
      
      {/* 1. Left Side: Form to add dishes */}
      <div className="lg:col-span-4 space-y-4 print:hidden">
        <div className="bg-[#0d1527]/40 border border-slate-800/80 backdrop-blur-md p-6 rounded-2xl relative shadow-xl">
          <h2 className="text-sm font-black text-white uppercase tracking-wide mb-1">Add Food Items</h2>
          <div className="text-[10px] text-slate-400 mb-5 uppercase tracking-wider font-semibold">
            Plan Type: <span className="text-cyan-400 font-bold font-mono">{cafeDetails.subscription_tier}</span> ({menuList.length} / {cafeDetails.subscription_tier === "Basic" ? "15" : "Unlimited"} used)
          </div>

          <form onSubmit={addNewFoodItem} className="space-y-4">
            <input type="text" required placeholder="Enter Food Name" value={newItemName} onChange={e => setNewItemName(e.target.value)} className="w-full bg-[#070a14] border border-slate-700/80 rounded-xl px-3.5 py-3 text-xs text-white outline-none focus:border-cyan-500 transition-colors font-medium" />
            <input type="number" required placeholder="Enter Price (₹)" value={newItemPrice || ""} onChange={e => setNewItemPrice(Number(e.target.value))} className="w-full bg-[#070a14] border border-slate-700/80 rounded-xl px-3.5 py-3 text-xs font-mono text-white outline-none focus:border-cyan-500 transition-colors font-bold" />
            <select value={itemCategory} onChange={e => setItemCategory(e.target.value)} className="w-full bg-[#070a14] border border-slate-700/80 rounded-xl px-3.5 py-3 text-xs font-black text-cyan-400 outline-none cursor-pointer">
              <option value="Pizza">Pizza</option>
              <option value="Maggi">Maggi</option>
              <option value="Drinks">Drinks</option>
            </select>
            <button type="submit" className="w-full py-3 bg-cyan-500 text-slate-950 text-xs font-black uppercase rounded-xl tracking-widest hover:bg-cyan-400 transition-all shadow-md shadow-cyan-950/20 active:scale-[0.98] cursor-pointer">Save Item</button>
          </form>

          {showUpgradeBox && (
            <div className="absolute inset-0 bg-slate-950/95 border border-cyan-500/40 rounded-2xl flex flex-col items-center justify-center p-6 text-center z-50">
              <div className="text-2xl">💎</div>
              <h3 className="font-bold text-slate-100 text-sm mt-1 uppercase">Limit Reached</h3>
              <p className="text-[11px] text-slate-400 my-3 leading-relaxed max-w-[220px]">Free plan accounts can add only 15 items. Upgrade to the Pro plan to add unlimited food dishes.</p>
              <button onClick={() => setShowUpgradeBox(false)} className="text-[10px] text-slate-500 underline font-black uppercase tracking-wider cursor-pointer">Close</button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Middle Block: Table Orders list */}
      <div className="lg:col-span-4 space-y-4 print:hidden">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 pl-1">Live Counter Tables</h2>
        {runningOrders.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-8 bg-[#0d1527]/20 border border-slate-800/60 rounded-2xl text-center">No active tables right now.</p>
        ) : (
          <div className="space-y-3">
            {runningOrders.map(order => (
              <div key={order.id} className="bg-[#0d1527]/30 border border-slate-800/60 p-4 rounded-xl flex justify-between items-center shadow-md transition-colors hover:border-slate-700">
                <div className="space-y-2 pr-2">
                  <div className="flex gap-2 items-center text-xs font-bold">
                    <span className="text-cyan-400 bg-[#070a14] border border-slate-800 px-2.5 py-0.5 rounded font-mono font-black">{order.table_id}</span>
                    <span className="text-[9px] uppercase font-mono text-slate-400 px-1.5 border border-slate-700 rounded tracking-wider font-bold">{order.status}</span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-[180px] truncate font-medium">{order.items.map((f: any) => `${f.name} x${f.qty}`).join(", ")}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-emerald-400 font-extrabold text-sm font-mono">₹{order.gross_total}</span>
                  <button onClick={() => setSelectedBill(order)} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-black uppercase px-3 py-1.5 rounded-lg tracking-wide transition-colors cursor-pointer">Bill</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Right Side: Check and Print Counter */}
      <div className="lg:col-span-4 space-y-5 print:block print:w-full">
        {selectedBill && (
          <div className="bg-[#0d1527]/40 border border-slate-800/80 backdrop-blur-md p-5 rounded-2xl space-y-3.5 print:hidden shadow-xl">
            <h3 className="text-xs font-bold text-white uppercase border-b border-slate-800 pb-2 tracking-wider">Send Bill & Settle</h3>
            <input type="text" placeholder="Enter Customer WhatsApp No." value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-[#070a14] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs font-bold font-mono text-slate-200 outline-none focus:border-cyan-500 transition-colors" />
            <button onClick={closeAndPrintBill} className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-[0.98] shadow-md cursor-pointer">Print & Close Order</button>
          </div>
        )}

        {selectedBill && (
          <div className="bg-[#0d1527]/30 border border-slate-800/80 p-6 rounded-2xl text-slate-200 print:bg-white print:text-black print:border-none print:p-0 space-y-4 shadow-xl">
            <div className="text-center border-b border-slate-800/60 pb-4 print:border-slate-300">
              <h4 className="text-xs font-black text-cyan-400 print:text-black uppercase tracking-widest">📄 CASH RECEIPT INVOICE</h4>
            </div>
            <div className="text-[11px] font-mono space-y-0.5 text-slate-400 print:text-slate-700 font-medium">
              <div>Invoice ID: #ID-{selectedBill.id.slice(-5).toUpperCase()}</div>
              <div>Table Station: {selectedBill.table_id}</div>
            </div>
            <div className="border-t border-b border-slate-800/60 py-3.5 space-y-2.5 print:border-slate-300">
              {selectedBill.items.map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-xs font-extrabold text-slate-300 print:text-black">
                  <span>{item.name} <span className="text-slate-500 font-mono text-[10px] ml-1">x{item.qty}</span></span>
                  <span className="font-mono">₹{item.price * item.qty}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider print:text-slate-600">Total Bill Payable:</span>
              <span className="text-xl font-black text-emerald-400 font-mono print:text-black">₹{selectedBill.gross_total}</span>
            </div>
          </div>
        )}
      </div>

    </main>
  );
}