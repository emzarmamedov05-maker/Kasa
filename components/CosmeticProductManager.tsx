
import React, { useState } from 'react';
import { CosmeticTransaction, PaymentMethod } from '../types.ts';

interface Props {
  cosmetics: CosmeticTransaction[];
  onAddCosmetic: (description: string, amount: number, method: PaymentMethod) => void;
  onDeleteCosmetic: (id: string) => void;
}

const CosmeticProductManager: React.FC<Props> = ({ cosmetics, onAddCosmetic, onDeleteCosmetic }) => {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('NAKIT');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!desc || isNaN(val)) return;
    onAddCosmetic(desc, val, method);
    setDesc('');
    setAmount('');
  };

  const total = cosmetics.reduce((acc, c) => acc + c.amount, 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
      <div className="p-5 bg-pink-500/10 border-b border-slate-800 flex justify-between items-center">
        <h3 className="font-black text-xl text-pink-400 tracking-tighter italic uppercase flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          KOZMETİK ÜRÜNÜ ÖDEMESİ
        </h3>
        <div className="bg-pink-500/20 px-4 py-1.5 rounded-full border border-pink-500/30">
          <span className="text-pink-400 text-sm font-black tracking-widest">{total.toFixed(2)} ₾</span>
        </div>
      </div>
      
      <div className="p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="text-[10px] text-slate-500 uppercase font-black mb-2 block tracking-widest">Ürün Açıklaması</label>
            <input 
              type="text"
              placeholder="Örn: Saç Waxı, Sakal Yağı..."
              className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl p-3.5 text-white text-sm outline-none focus:border-pink-500 transition-all shadow-inner"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 uppercase font-black mb-2 block tracking-widest">Tutar</label>
            <input 
              type="number"
              step="0.01"
              placeholder="0.00"
              className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl p-3.5 text-white text-sm outline-none focus:border-pink-500 transition-all shadow-inner"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setMethod('NAKIT')}
                className={`flex-1 py-3.5 text-[10px] rounded-xl font-black border-2 transition-all flex items-center justify-center gap-2 ${method === 'NAKIT' ? 'bg-pink-600 border-pink-500 text-white shadow-lg shadow-pink-900/20' : 'bg-slate-950 border-slate-800 text-slate-600 hover:border-pink-500/50'}`}
              >
                NAKİT
              </button>
              <button 
                type="button"
                onClick={() => setMethod('KART')}
                className={`flex-1 py-3.5 text-[10px] rounded-xl font-black border-2 transition-all flex items-center justify-center gap-2 ${method === 'KART' ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' : 'bg-slate-950 border-slate-800 text-slate-600 hover:border-blue-500/50'}`}
              >
                KART
              </button>
            </div>
            <button className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3.5 rounded-xl font-black transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] shadow-xl shadow-pink-900/20 active:scale-95">
              Satışı Onayla
            </button>
          </div>
        </form>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
          {cosmetics.length === 0 && (
            <div className="col-span-full py-12 text-center bg-slate-950/50 rounded-2xl border-2 border-dashed border-slate-800">
               <p className="text-slate-700 text-xs italic uppercase font-bold tracking-widest">Henüz kozmetik satışı yapılmadı</p>
            </div>
          )}
          {[...cosmetics].reverse().map(c => (
            <div key={c.id} className="group flex justify-between items-center bg-slate-950/80 p-4 rounded-xl border border-slate-800 hover:border-pink-500/40 transition-all">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${c.method === 'NAKIT' ? 'bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'}`}></span>
                  <span className="text-slate-200 font-black uppercase text-[11px] tracking-tight">{c.description}</span>
                </div>
                <span className="text-[9px] text-slate-600 font-bold">{new Date(c.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-pink-400 font-black text-sm">+{c.amount.toFixed(2)} ₾</span>
                <button 
                  onClick={() => onDeleteCosmetic(c.id)}
                  className="text-slate-800 hover:text-red-500 transition-colors p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CosmeticProductManager;

