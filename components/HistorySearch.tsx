
import React, { useState } from 'react';
import { DailyHistory } from '../types.ts';

interface Props {
  history: DailyHistory[];
}

const HistorySearch: React.FC<Props> = ({ history }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  const foundRecord = history.find(item => {
    const d = new Date(item.date);
    const dateStr = d.toISOString().split('T')[0];
    return dateStr === selectedDate;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-xl">
      <div className="p-4 bg-amber-500/10 border-b border-slate-800">
        <h3 className="font-black text-base text-amber-500 tracking-tighter italic uppercase flex items-center gap-2">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
           ARŞİV SORGULA
        </h3>
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <label className="text-[9px] text-slate-500 font-black uppercase mb-2 block tracking-widest">Tarih Seçin</label>
          <input 
            type="date"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm outline-none focus:border-amber-500 appearance-none"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {selectedDate && !foundRecord && (
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center">
            <p className="text-[10px] text-slate-600 font-bold uppercase italic">Bu tarihte kapatılan bir gün bulunamadı.</p>
          </div>
        )}

        {foundRecord && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/20">
              <p className="text-[8px] text-amber-500/70 uppercase font-black tracking-widest mb-1">Seçili Günün Karı</p>
              <p className="text-xl font-black text-amber-500">+{foundRecord.netProfit.toFixed(2)} ₾</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <p className="text-[7px] text-slate-500 uppercase font-black">Ciro</p>
                <p className="text-xs font-bold text-slate-200">{(foundRecord.totalServiceRevenue + foundRecord.totalCosmeticRevenue).toFixed(2)} ₾</p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <p className="text-[7px] text-slate-500 uppercase font-black">Gider</p>
                <p className="text-xs font-bold text-red-400">-{foundRecord.totalExpenses.toFixed(2)} ₾</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
               <p className="text-[7px] text-slate-600 font-black uppercase mb-2 tracking-widest">Berber Hakedişleri</p>
               <div className="space-y-1">
                 {foundRecord.barberPayouts.map((b, i) => (
                   <div key={i} className="flex justify-between text-[9px] bg-slate-950/50 p-1.5 rounded border border-slate-900">
                     <span className="text-slate-400 font-bold uppercase">{b.barberName}</span>
                     <span className="text-amber-500/80 font-black">{b.total.toFixed(2)} ₾</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorySearch;

