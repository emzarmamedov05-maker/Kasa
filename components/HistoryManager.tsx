
import React, { useState } from 'react';
import { DailyHistory } from '../types';

interface Props {
  history: DailyHistory[];
  onDeleteHistory: (id: string) => void;
}

const HistoryManager: React.FC<Props> = ({ history, onDeleteHistory }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (history.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-6 bg-slate-800/30 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h3 className="font-black text-xl text-white tracking-tighter italic uppercase flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            TARİHSEL ARŞİV
          </h3>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Kapatılan Günlerin Özetleri</p>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-400 hover:text-white transition-colors p-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
          {history.map(item => (
            <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 hover:border-amber-500/30 transition-all group">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                {/* Sol: Tarih ve Ana Metrikler */}
                <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-amber-500 text-xs font-black uppercase tracking-widest mb-1">
                      {new Date(item.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-[10px] text-slate-600 font-bold">{new Date(item.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  
                  <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                    <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Net Kazanç</p>
                    <p className="text-sm font-black text-amber-400">+{item.netProfit.toFixed(2)} ₾</p>
                  </div>

                  <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                    <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Ciro (Hizmet+Koz)</p>
                    <p className="text-sm font-black text-slate-200">{(item.totalServiceRevenue + item.totalCosmeticRevenue).toFixed(2)} ₾</p>
                  </div>

                  <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                    <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Masraflar</p>
                    <p className="text-sm font-black text-red-400">-{item.totalExpenses.toFixed(2)} ₾</p>
                  </div>
                </div>

                {/* Sağ: Sil Butonu */}
                <div className="flex items-center">
                  <button 
                    onClick={() => onDeleteHistory(item.id)}
                    className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    title="Bu kaydı sil"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Detay: Berber Ödemeleri (Küçük Liste) */}
              <div className="mt-6 pt-4 border-t border-slate-900 grid grid-cols-2 md:grid-cols-6 gap-3">
                {item.barberPayouts.map((b, idx) => (
                  <div key={idx} className="bg-slate-900/30 p-2 rounded-lg border border-slate-800/50">
                    <p className="text-[9px] text-slate-500 font-black uppercase truncate">{b.barberName}</p>
                    <p className="text-[11px] font-bold text-amber-500/80">{b.total.toFixed(2)} ₾</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryManager;
