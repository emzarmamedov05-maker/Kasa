
import React, { useState } from 'react';
import { Barber, PaymentMethod, TipRecipient, Transaction, CosmeticTransaction } from '../types.ts';

interface Props {
  barber: Barber;
  onUpdateRate: (barberId: string, rate: number) => void;
  onAddTransaction: (barberId: string, amount: number, tip: number, method: PaymentMethod, tipRecipient: TipRecipient) => void;
  onAddCosmeticTransaction: (barberId: string, amount: number, method: PaymentMethod) => void;
  onDeleteTransaction: (barberId: string, transactionId: string) => void;
  onDeleteBarber?: (id: string) => void;
}

const BarberCard: React.FC<Props> = ({ barber, onUpdateRate, onAddTransaction, onAddCosmeticTransaction, onDeleteTransaction, onDeleteBarber }) => {
  const [amount, setAmount] = useState<string>('');
  const [tip, setTip] = useState<string>('');
  const [method, setMethod] = useState<PaymentMethod>('NAKIT');
  const [tipRecipient, setTipRecipient] = useState<TipRecipient>('BERBER');

  const [cosmeticAmount, setCosmeticAmount] = useState<string>('');
  const [cosmeticMethod, setCosmeticMethod] = useState<PaymentMethod>('NAKIT');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    const tipVal = parseFloat(tip) || 0;
    if (isNaN(val) || val <= 0) return;
    
    onAddTransaction(barber.id, val, tipVal, method, tipRecipient);
    setAmount('');
    setTip('');
  };

  const handleCosmeticSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(cosmeticAmount);
    if (isNaN(val) || val <= 0) return;
    
    onAddCosmeticTransaction(barber.id, val, cosmeticMethod);
    setCosmeticAmount('');
  };

  const barberTransactions = barber.transactions || [];
  const barberCosmetics = barber.cosmeticTransactions || [];

  // Hakediş Hesaplamaları (Faiz/Kesinti yok - Brüt üzerinden)
  const totalGrossService = barberTransactions.reduce((acc, t) => acc + t.amount, 0);
  const totalServiceShare = barberTransactions.reduce((acc, t) => acc + (t.amount * t.commissionRate), 0);
  const totalTips = barberTransactions.reduce((acc, t) => acc + (t.tipRecipient === 'BERBER' || !t.tipRecipient ? t.tip : 0), 0);
  const totalCosmetics = barberCosmetics.reduce((acc, t) => acc + t.amount, 0);
  
  const totalHakedis = totalServiceShare + totalTips + totalCosmetics;

  const cashVolume = barberTransactions.filter(t => t.method === 'NAKIT').reduce((acc, t) => acc + t.amount + t.tip, 0) + 
                     barberCosmetics.filter(t => t.method === 'NAKIT').reduce((acc, t) => acc + t.amount, 0);
  
  const cardVolume = barberTransactions.filter(t => t.method === 'KART').reduce((acc, t) => acc + t.amount + t.tip, 0) + 
                     barberCosmetics.filter(t => t.method === 'KART').reduce((acc, t) => acc + t.amount, 0);

  const transferVolume = barberTransactions.filter(t => t.method === 'TRANSFER').reduce((acc, t) => acc + t.amount + t.tip, 0) + 
                         barberCosmetics.filter(t => t.method === 'TRANSFER').reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-full shadow-2xl transition-all hover:border-slate-700">
      {/* Başlık ve Oran Kontrolü */}
      <div className="p-4 bg-slate-800/50 border-b border-slate-800 flex justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <h3 className="font-black text-lg text-amber-100 italic tracking-tight uppercase">{barber.name}</h3>
          {onDeleteBarber && (
            <button 
              onClick={() => onDeleteBarber(barber.id)} 
              title="Berberi Sil"
              type="button"
              className="text-slate-500 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
        <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-700">
          <button 
            onClick={() => onUpdateRate(barber.id, 0.40)}
            className={`px-3 py-1 text-[10px] font-black rounded transition-all ${barber.currentCommissionRate === 0.40 ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            %40
          </button>
          <button 
            onClick={() => onUpdateRate(barber.id, 0.50)}
            className={`px-3 py-1 text-[10px] font-black rounded transition-all ${barber.currentCommissionRate === 0.50 ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            %50
          </button>
        </div>
      </div>

      <div className="p-4 flex-grow space-y-4">
        {/* Hakediş Gösterge Paneli */}
        <div className="space-y-3">
          {/* Ana Toplam */}
          <div className="bg-gradient-to-br from-amber-500/10 to-transparent p-5 rounded-2xl border border-amber-500/20 shadow-inner text-center">
            <p className="text-[10px] text-amber-500/80 uppercase font-black tracking-[0.2em] mb-1">Berbere Ödenecek</p>
            <p className="text-5xl font-black text-amber-500 leading-none drop-shadow-lg">{totalHakedis.toFixed(2)} ₾</p>
          </div>

          {/* Breakdown Section */}
          <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800 space-y-2.5">
            <div className="flex justify-between items-center text-[10px] border-b border-slate-800/50 pb-2">
              <div className="flex flex-col">
                <span className="text-slate-500 font-bold uppercase">Hizmet Payı (%{barber.currentCommissionRate * 100}):</span>
                <span className="text-[8px] text-slate-400 font-black tracking-tighter">
                  TOPLAM HİZMET: {totalGrossService.toFixed(2)} ₾ (KESİNTİSİZ)
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-200 font-black text-sm">{totalServiceShare.toFixed(2)} ₾</span>
                <p className="text-[7px] text-slate-600 uppercase font-bold">Berber Payı</p>
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-500 font-bold uppercase">Bahşişler (Tamamı):</span>
              <span className="text-emerald-400 font-black text-xs">{totalTips.toFixed(2)} ₾</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-500 font-bold uppercase">Kozmetik Satış:</span>
              <span className="text-pink-400 font-black text-xs">{totalCosmetics.toFixed(2)} ₾</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <div className="bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/10 flex flex-col justify-between">
              <p className="text-[7.5px] text-emerald-500/70 font-black uppercase tracking-widest mb-1">Nakit</p>
              <span className="text-xs text-emerald-400 font-black leading-tight">{cashVolume.toFixed(2)} ₾</span>
            </div>
            <div className="bg-blue-500/5 p-2 rounded-xl border border-blue-500/10 flex flex-col justify-between">
              <p className="text-[7.5px] text-blue-500/70 font-black uppercase tracking-widest mb-1">Kart</p>
              <span className="text-xs text-blue-400 font-black leading-tight">{cardVolume.toFixed(2)} ₾</span>
            </div>
            <div className="bg-fuchsia-500/5 p-2 rounded-xl border border-fuchsia-500/10 flex flex-col justify-between">
              <p className="text-[7.5px] text-fuchsia-500/70 font-black uppercase tracking-widest mb-1">Transfer</p>
              <span className="text-xs text-fuchsia-400 font-black leading-tight">{transferVolume.toFixed(2)} ₾</span>
            </div>
          </div>
        </div>

        {/* Hizmet Ödeme Formu */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-slate-800">
          <div className="grid grid-cols-2 gap-3">
            <input 
              type="number" step="0.01" placeholder="Hizmet ₾"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm outline-none focus:border-amber-500 font-bold"
              value={amount} onChange={(e) => setAmount(e.target.value)} required
            />
            <input 
              type="number" step="0.01" placeholder="Bahşiş ₾"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm outline-none focus:border-emerald-500 font-bold"
              value={tip} onChange={(e) => setTip(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button 
              type="button" onClick={() => setMethod('NAKIT')}
              className={`flex-1 py-3 text-[10px] rounded-xl font-black border transition-all ${method === 'NAKIT' ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' : 'bg-slate-950 border-slate-700 text-slate-500'}`}
            >NAKİT</button>
            <button 
              type="button" onClick={() => setMethod('KART')}
              className={`flex-1 py-3 text-[10px] rounded-xl font-black border transition-all ${method === 'KART' ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-950 border-slate-700 text-slate-500'}`}
            >KART</button>
            <button 
              type="button" onClick={() => setMethod('TRANSFER')}
              className={`flex-1 py-3 text-[10px] rounded-xl font-black border transition-all ${method === 'TRANSFER' ? 'bg-fuchsia-600 border-fuchsia-500 text-white shadow-lg' : 'bg-slate-950 border-slate-700 text-slate-500'}`}
            >TRANSFER</button>
          </div>

          <button 
            type="submit" 
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-3 rounded-xl font-black transition-all shadow-xl text-xs uppercase tracking-widest active:scale-95"
          >
            ÖDEME AL
          </button>
        </form>

        {/* Kozmetik Formu */}
        <form onSubmit={handleCosmeticSubmit} className="space-y-3 pt-4 border-t border-slate-800">
          <p className="text-[10px] text-pink-500 font-black uppercase tracking-widest">Kozmetik Satışı (%100 Berber)</p>
          <input 
            type="number" step="0.01" placeholder="Tutar ₾"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm outline-none font-bold focus:border-pink-500 transition-colors"
            value={cosmeticAmount} onChange={(e) => setCosmeticAmount(e.target.value)} required
          />
          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={() => setCosmeticMethod('NAKIT')} 
              className={`flex-1 py-2 text-[10px] rounded-lg font-black border-2 flex items-center justify-center transition-all ${cosmeticMethod === 'NAKIT' ? 'bg-pink-600 border-pink-400 text-white shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-pink-500/60'}`}
            >
              NAKİT
            </button>
            <button 
              type="button" 
              onClick={() => setCosmeticMethod('KART')} 
              className={`flex-1 py-2 text-[10px] rounded-lg font-black border-2 flex items-center justify-center transition-all ${cosmeticMethod === 'KART' ? 'bg-pink-600 border-pink-400 text-white shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-pink-500/60'}`}
            >
              KART
            </button>
            <button 
              type="button" 
              onClick={() => setCosmeticMethod('TRANSFER')} 
              className={`flex-1 py-2 text-[10px] rounded-lg font-black border-2 flex items-center justify-center transition-all ${cosmeticMethod === 'TRANSFER' ? 'bg-pink-600 border-pink-400 text-white shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-pink-500/60'}`}
            >
              TRANSFER
            </button>
          </div>
          <button type="submit" className="w-full bg-slate-800 text-pink-400 py-3 rounded-lg font-black border border-pink-500/30 text-[10px] uppercase tracking-[0.2em] hover:bg-slate-750 active:scale-95 transition-all">
            KOZMETİK SATIŞI
          </button>
        </form>

        {/* İşlem Geçmişi */}
        <div className="mt-4 max-h-40 overflow-y-auto custom-scrollbar pr-1">
          <p className="text-[10px] text-slate-600 font-black uppercase mb-2 tracking-widest">Son İşlemler</p>
          <div className="space-y-1">
            {[...(barber.transactions || []), ...(barber.cosmeticTransactions || []).map(t => ({...t, isCosmetic: true}))]
              .sort((a, b) => b.timestamp - a.timestamp)
              .map(t => (
              <div key={t.id} className="group flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-slate-800 text-[10px]">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${t.method === 'NAKIT' ? 'bg-emerald-500' : t.method === 'KART' ? 'bg-blue-500' : 'bg-fuchsia-500'}`}></div>
                  <span className={`font-black ${'isCosmetic' in t ? 'text-pink-400' : 'text-slate-200'}`}>
                    {t.amount.toFixed(2)} ₾ 
                  </span>
                  <span className="text-[9px] text-slate-600 font-bold ml-1">
                    {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <button onClick={() => onDeleteTransaction(barber.id, t.id)} className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarberCard;

