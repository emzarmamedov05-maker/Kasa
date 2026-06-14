
import React from 'react';
import { AppState, PaymentMethod } from '../types.ts';

interface Props {
  state: AppState;
}

const SummaryHeader: React.FC<Props> = ({ state }) => {
  const allBarbers = state.barbers;
  const allTransactions = allBarbers.flatMap(b => b.transactions);
  const barberCosmetics = allBarbers.flatMap(b => b.cosmeticTransactions || []);
  const globalCosmetics = state.globalCosmetics || [];
  
  const incomes = state.incomes || [];
  const expenses = state.expenses || [];
  
  const totalServiceRevenue = allTransactions.reduce((acc, t) => acc + t.amount, 0);
  const totalCosmeticRevenue = barberCosmetics.reduce((acc, t) => acc + t.amount, 0) + 
                               globalCosmetics.reduce((acc, t) => acc + t.amount, 0);
  
  const cashierTips = allTransactions.reduce((acc, t) => {
    return acc + (t.tipRecipient === 'KASIYER' ? t.tip : 0);
  }, 0);

  const totalManualIncomes = incomes.reduce((acc, i) => acc + i.amount, 0);

  const shopServiceShare = allTransactions.reduce((acc, t) => {
    return acc + (t.amount * (1 - t.commissionRate));
  }, 0);

  const shopCosmeticRevenue = globalCosmetics.reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  const netProfit = (shopServiceShare + cashierTips + totalManualIncomes + shopCosmeticRevenue) - totalExpenses;

  // Flows
  const cashTransactions = allTransactions
    .filter(t => t.method === 'NAKIT')
    .reduce((acc, t) => acc + t.amount + t.tip, 0);
  const cashCosmetics = [...barberCosmetics, ...globalCosmetics]
    .filter(t => t.method === 'NAKIT')
    .reduce((acc, t) => acc + t.amount, 0);
  const cashIncomes = incomes
    .filter(i => i.method === 'NAKIT')
    .reduce((acc, i) => acc + i.amount, 0);
  const cashExpenses = expenses
    .filter(e => e.method === 'NAKIT')
    .reduce((acc, e) => acc + e.amount, 0);
    
  const totalCashFlow = cashTransactions + cashCosmetics + cashIncomes - cashExpenses;
  
  const cardTransactions = allTransactions
    .filter(t => t.method === 'KART')
    .reduce((acc, t) => acc + t.amount + t.tip, 0);
  const cardCosmetics = [...barberCosmetics, ...globalCosmetics]
    .filter(t => t.method === 'KART')
    .reduce((acc, t) => acc + t.amount, 0);
  const cardIncomes = incomes
    .filter(i => i.method === 'KART')
    .reduce((acc, i) => acc + i.amount, 0);
  const cardExpenses = expenses
    .filter(e => e.method === 'KART')
    .reduce((acc, e) => acc + e.amount, 0);

  const totalCardFlow = cardTransactions + cardCosmetics + cardIncomes - cardExpenses;

  const transferTransactions = allTransactions
    .filter(t => t.method === 'TRANSFER')
    .reduce((acc, t) => acc + t.amount + t.tip, 0);
  const transferCosmetics = [...barberCosmetics, ...globalCosmetics]
    .filter(t => t.method === 'TRANSFER')
    .reduce((acc, t) => acc + t.amount, 0);
  const transferIncomes = incomes
    .filter(i => i.method === 'TRANSFER')
    .reduce((acc, i) => acc + i.amount, 0);
  const transferExpenses = expenses
    .filter(e => e.method === 'TRANSFER')
    .reduce((acc, e) => acc + e.amount, 0);

  const totalTransferFlow = transferTransactions + transferCosmetics + transferIncomes - transferExpenses;

  // Individual Barber Payouts Calculation for Summary
  const barberPayoutDetails = allBarbers.map(b => {
    const bT = b.transactions || [];
    const bC = b.cosmeticTransactions || [];
    const share = bT.reduce((acc, t) => acc + (t.amount * t.commissionRate), 0);
    const tips = bT.reduce((acc, t) => acc + (t.tipRecipient === 'BERBER' || !t.tipRecipient ? t.tip : 0), 0);
    const cosmetics = bC.reduce((acc, t) => acc + t.amount, 0);
    return { name: b.name, total: share + tips + cosmetics };
  }).filter(p => p.total > 0);

  const totalBarberPayouts = barberPayoutDetails.reduce((acc, p) => acc + p.total, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatCard 
          title="Kasa Net Kar" 
          value={netProfit} 
          unit="GEL" 
          color="text-amber-400" 
          highlight 
          subText="Hakedişler Sonrası"
        />
        <StatCard title="Kasadaki Nakit" value={totalCashFlow} unit="GEL" color="text-emerald-400" subText="Fiziksel Mevcut" />
        <StatCard title="Banka Pos Ciro" value={totalCardFlow} unit="GEL" color="text-blue-400" subText="Kartlı Ödemeler" />
        <StatCard title="Havale/Transfer" value={totalTransferFlow} unit="GEL" color="text-fuchsia-400" subText="Banka Havale" />
        <StatCard title="Ödenecek Toplam" value={totalBarberPayouts} unit="GEL" color="text-red-400" subText="Berber Hakedişleri" />
        <StatCard title="Kozmetik Satış" value={totalCosmeticRevenue} unit="GEL" color="text-pink-400" subText="Ürün Ciro" />
        <StatCard title="Hizmet Ciro" value={totalServiceRevenue} unit="GEL" color="text-slate-200" subText="Toplam İşlem" />
        <StatCard title="Giderler" value={totalExpenses} unit="GEL" color="text-slate-400" />
      </div>

      {/* Berber Hakediş Listesi Summary Section */}
      {barberPayoutDetails.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-wrap gap-4 items-center">
          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest border-r border-slate-800 pr-4">Hakediş Özeti:</span>
          {barberPayoutDetails.map((b, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase">{b.name}:</span>
              <span className="text-xs font-black text-amber-500">{b.total.toFixed(2)} ₾</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ 
  title: string; 
  value: number; 
  unit: string; 
  color: string; 
  highlight?: boolean;
  subText?: string;
}> = ({ title, value, unit, color, highlight, subText }) => (
  <div className={`bg-slate-900 border ${highlight ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'border-slate-800'} p-4 rounded-xl shadow-lg transition-all flex flex-col justify-between`}>
    <div>
      <p className="text-slate-500 text-[9px] font-black uppercase tracking-wider mb-1">{title}</p>
      <p className={`text-lg font-black ${color}`}>
        {value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₾
      </p>
    </div>
    {subText && (
      <p className="text-[8px] text-slate-600 font-bold uppercase mt-2 tracking-tighter">{subText}</p>
    )}
  </div>
);

export default SummaryHeader;

