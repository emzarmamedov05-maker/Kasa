
import React, { useState } from 'react';
import { Expense, PaymentMethod } from '../types';

interface Props {
  expenses: Expense[];
  onAddExpense: (description: string, amount: number, method: PaymentMethod) => void;
  onDeleteExpense: (id: string) => void;
}

const ExpenseManager: React.FC<Props> = ({ expenses, onAddExpense, onDeleteExpense }) => {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('NAKIT');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!desc || isNaN(val)) return;
    onAddExpense(desc, val, method);
    setDesc('');
    setAmount('');
  };

  const total = expenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-xl">
      <div className="p-4 bg-red-500/10 border-b border-slate-800">
        <h3 className="font-black text-base text-red-400 tracking-tighter italic uppercase">KASADAN HARCA</h3>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/20 text-center">
          <p className="text-[10px] text-red-400/70 uppercase font-black tracking-widest">Toplam Gider</p>
          <p className="text-2xl font-black text-red-500">{total.toFixed(2)} ₾</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input 
            type="text"
            placeholder="Gider açıklaması"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm outline-none focus:border-red-500"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <input 
            type="number"
            step="0.01"
            placeholder="Miktar"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm outline-none focus:border-red-500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={() => setMethod('NAKIT')}
              className={`flex-1 py-1.5 text-[9px] rounded-lg font-bold border transition-all flex items-center justify-center gap-1.5 ${method === 'NAKIT' ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-600'}`}
            >
              NAKİT
            </button>
            <button 
              type="button"
              onClick={() => setMethod('KART')}
              className={`flex-1 py-1.5 text-[9px] rounded-lg font-bold border transition-all flex items-center justify-center gap-1.5 ${method === 'KART' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-600'}`}
            >
              KART
            </button>
            <button 
              type="button"
              onClick={() => setMethod('TRANSFER')}
              className={`flex-1 py-1.5 text-[9px] rounded-lg font-bold border transition-all flex items-center justify-center gap-1.5 ${method === 'TRANSFER' ? 'bg-fuchsia-600 border-fuchsia-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-600'}`}
            >
              TRANSFER
            </button>
          </div>

          <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
            </svg>
            Kasadan Harca
          </button>
        </form>

        <div className="space-y-2 mt-4 max-h-[180px] overflow-y-auto custom-scrollbar">
          {expenses.length === 0 && <p className="text-slate-600 text-[10px] italic text-center py-2 uppercase font-bold tracking-widest">Harcama kaydı yok</p>}
          {[...expenses].reverse().map(e => (
            <div key={e.id} className="group flex justify-between items-center bg-slate-950/50 p-2.5 rounded-lg border border-slate-800 text-[11px]">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className={`w-1 h-1 rounded-full ${e.method === 'NAKIT' ? 'bg-emerald-500' : e.method === 'KART' ? 'bg-blue-500' : 'bg-fuchsia-400'}`}></span>
                  <span className="text-slate-200 font-bold uppercase tracking-tight">{e.description}</span>
                </div>
                <span className="text-[9px] text-slate-600 font-bold ml-2.5">{new Date(e.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-400 font-black">-{e.amount.toFixed(2)} ₾</span>
                <button 
                  onClick={() => onDeleteExpense(e.id)}
                  className="text-slate-700 hover:text-red-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

export default ExpenseManager;
