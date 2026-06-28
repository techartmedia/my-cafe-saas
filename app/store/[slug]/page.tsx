"use client";

import React, { useEffect, useState, use } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function CustomerQRMenu({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const currentSlug = resolvedParams.slug;

  const [cafeDetails, setCafeDetails] = useState<any>(null);
  const [foodItems, setFoodItems] = useState<any[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [tableNumber, setTableNumber] = useState("Table 1");
  const [loading, setLoading] = useState(true);
  const [sendingOrder, setSendingOrder] = useState(false);

  useEffect(() => {
    async function loadCafeData() {
      const { data: cafe } = await supabase.from("system_tenants").select("*").eq("subdomain_slug", currentSlug).single();
      if (cafe) {
        setCafeDetails(cafe);
        const { data: items } = await supabase.from("tenant_menus").select("*").eq("tenant_id", cafe.id);
        if (items) setFoodItems(items);
      }
      setLoading(false);
    }
    loadCafeData();
  }, [currentSlug]);

  const changeQuantity = (id: string, amount: number) => {
    setCart(prev => {
      const copy = { ...prev, [id]: (prev[id] || 0) + amount };
      if (copy[id] <= 0) delete copy[id];
      return copy;
    });
  };

  const calculateTotal = () => Object.entries(cart).reduce((sum, [id, qty]) => sum + (foodItems.find(item => item.id === id)?.price || 0) * qty, 0);

  const placeOrder = async () => {
    if (Object.keys(cart).length === 0) return alert("Please pick at least one food item first.");
    setSendingOrder(true);

    const orderedItemsList = Object.entries(cart).map(([id, qty]) => {
      const item = foodItems.find(m => m.id === id)!;
      return { id, name: item.name, qty, price: item.price };
    });

    const { error } = await supabase.from("tenant_orders").insert([{
      tenant_id: cafeDetails.id,
      table_id: tableNumber,
      items: orderedItemsList,
      gross_total: calculateTotal()
    }]);

    if (error) alert("Something went wrong: " + error.message);
    else {
      alert("🎉 Done! Your order is sent to the kitchen.");
      setCart({});
    }
    setSendingOrder(false);
  };

  if (loading) return <div className="min-h-screen bg-[#070a13] flex items-center justify-center text-xs font-mono tracking-wider text-slate-500">Loading Food Menu...</div>;
  if (!cafeDetails) return <div className="min-h-screen bg-[#070a13] flex items-center justify-center text-red-400 font-bold">Cafe not found!</div>;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0f1d] to-[#070a14] text-slate-200 pb-12 antialiased">
      <div className="max-w-6xl mx-auto px-4 pt-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Food Menu List */}
        <div className="flex-1 space-y-6">
          <header className="bg-[#0d1527]/40 border border-slate-800/60 backdrop-blur-md p-6 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-xl">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-950/40 border border-cyan-800/50 px-2.5 py-1 rounded-md">
                Digital Order Menu
              </span>
              <h1 className="text-3xl font-black text-white uppercase mt-3 tracking-tight">{cafeDetails.business_name}</h1>
            </div>
            
            <div className="flex items-center gap-3 bg-[#070a14] border border-slate-800/80 p-2 rounded-xl">
              <span className="text-xs text-slate-400 font-semibold pl-2">Your Table:</span>
              <select value={tableNumber} onChange={e => setTableNumber(e.target.value)} className="bg-[#0d1527] border border-slate-700 text-xs font-bold text-emerald-400 px-3 py-2 rounded-lg outline-none cursor-pointer hover:border-slate-600 transition-all">
                <option value="Table 1">📍 Table 1</option>
                <option value="Table 2">📍 Table 2</option>
                <option value="Table 3">📍 Table 3</option>
              </select>
            </div>
          </header>

          <div className="space-y-4">
            {foodItems.map(item => (
              <div key={item.id} className="bg-[#0d1527]/30 border border-slate-800/50 hover:border-slate-700/80 p-5 rounded-2xl flex justify-between items-center transition-all duration-200 shadow-md hover:shadow-lg group">
                <div className="space-y-1.5 pr-4">
                  <span className="text-[9px] bg-[#070a14] text-slate-400 border border-slate-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{item.category}</span>
                  <h3 className="font-extrabold text-lg text-white group-hover:text-cyan-400 transition-colors">{item.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">{item.description || "Freshly made standard recipe."}</p>
                  <p className="text-emerald-400 font-extrabold text-base pt-0.5 font-mono">₹{item.price}</p>
                </div>
                <div className="shrink-0">
                  {cart[item.id] ? (
                    <div className="bg-[#070a14] border border-slate-700 p-1 rounded-xl flex items-center gap-3 text-sm font-bold shadow-inner">
                      <button onClick={() => changeQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center bg-[#0d1527] border border-slate-800 text-slate-300 rounded-lg font-black hover:bg-slate-800 transition-colors">-</button>
                      <span className="text-cyan-400 min-w-[16px] text-center font-mono">{cart[item.id]}</span>
                      <button onClick={() => changeQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center bg-[#0d1527] border border-slate-800 text-slate-300 rounded-lg font-black hover:bg-slate-800 transition-colors">+</button>
                    </div>
                  ) : (
                    <button onClick={() => changeQuantity(item.id, 1)} className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 hover:from-cyan-500 hover:to-emerald-500 hover:text-slate-950 px-6 py-2.5 text-xs font-black rounded-xl transition-all duration-200 uppercase tracking-wider shadow-sm hover:shadow-md cursor-pointer">
                      Add +
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Selected Food Basket */}
        <div className="w-full lg:w-88 bg-[#0d1527]/40 border border-slate-800/80 backdrop-blur-md p-6 rounded-2xl h-fit space-y-6 shadow-xl sticky top-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-3">Your Plate Basket</h2>
          
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {Object.keys(cart).length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <span className="text-2xl block opacity-40">🛒</span>
                <p className="text-xs text-slate-500 italic">Your basket is empty. Please choose some dishes.</p>
              </div>
            ) : (
              Object.entries(cart).map(([id, qty]) => (
                <div key={id} className="flex justify-between items-center text-xs bg-[#070a14]/60 border border-slate-800 p-3 rounded-xl shadow-sm">
                  <span className="text-slate-300 font-bold truncate max-w-[160px]">{foodItems.find(item => item.id === id)?.name} <span className="text-cyan-400 ml-1 font-mono">x{qty}</span></span>
                  <span className="text-emerald-400 font-bold font-mono">₹{(foodItems.find(item => item.id === id)?.price || 0) * qty}</span>
                </div>
              ))
            )}
          </div>
          
          <div className="flex justify-between items-baseline pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Bill Amount:</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">₹{calculateTotal()}</span>
          </div>
          
          <button onClick={placeOrder} disabled={sendingOrder} className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl hover:opacity-95 shadow-lg shadow-cyan-950/20 active:scale-[0.98] disabled:opacity-40 transition-all cursor-pointer">
            {sendingOrder ? "Sending Order..." : "🚀 Place Order to Kitchen"}
          </button>
        </div>

      </div>
    </main>
  );
}