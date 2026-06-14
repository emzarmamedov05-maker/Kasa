import React, { useState } from 'react';
import { Barber, PaymentMethod, TipRecipient } from '../types';
import BarberCard from './BarberCard';

interface Props {
  barbers: Barber[];
  onUpdateRate: (barberId: string, rate: number) => void;
  onAddTransaction: (barberId: string, amount: number, tip: number, method: PaymentMethod, tipRecipient: TipRecipient) => void;
  onAddCosmeticTransaction: (barberId: string, amount: number, method: PaymentMethod) => void;
  onDeleteTransaction: (barberId: string, transactionId: string) => void;
  onAddBarber: (name: string) => void;
  onDeleteBarber: (id: string) => void;
}

const BarberGrid: React.FC<Props> = ({ 
  barbers, 
  onUpdateRate, 
  onAddTransaction, 
  onAddCosmeticTransaction, 
  onDeleteTransaction,
  onAddBarber,
  onDeleteBarber
}) => {
  const [newBarberName, setNewBarberName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBarberName.trim()) return;
    onAddBarber(newBarberName);
    setNewBarberName('');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-2 gap-6">
        {barbers.map(barber => (
          <BarberCard 
            key={barber.id}
            barber={barber}
            onUpdateRate={onUpdateRate}
            onAddTransaction={onAddTransaction}
            onAddCosmeticTransaction={onAddCosmeticTransaction}
            onDeleteTransaction={onDeleteTransaction}
            onDeleteBarber={onDeleteBarber}
          />
        ))}

        {barbers.length < 8 ? (
          <div className="bg-slate-900/30 border-2 border-dashed border-slate-850 rounded-2xl p-6 flex flex-col justify-center items-center hover:border-slate-700/50 transition-colors h-full min-h-[300px]">
            <div className="text-center w-full max-w-sm space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-amber-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h4 className="font-black text-sm text-slate-200 uppercase tracking-widest">Yeni Berber Ekle</h4>
                <p className="text-xs text-slate-500 mt-1">Maksimum {barbers.length}/8 aktif berber kullanabilirsiniz.</p>
              </div>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Berber adı girin..." 
                  maxLength={15}
                  value={newBarberName} 
                  onChange={(e) => setNewBarberName(e.target.value)}
                  className="flex-grow bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-amber-500 font-bold"
                  required
                />
                <button 
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 rounded-xl font-black text-xs uppercase tracking-wider active:scale-95 transition-all"
                >
                  EKLE
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/10 border-2 border-dashed border-slate-850/40 rounded-2xl p-6 flex flex-col justify-center items-center text-center h-full min-h-[300px]">
            <div className="w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center text-slate-600 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h4 className="font-black text-sm text-slate-500 uppercase tracking-widest">Kapasite Dolu (8/8)</h4>
            <p className="text-xs text-slate-600 mt-1 max-w-xs leading-relaxed">Aynı anda en fazla 8 berber ekli olabilir. Bir berber silerek yenisini ekleyebilirsiniz.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarberGrid;
