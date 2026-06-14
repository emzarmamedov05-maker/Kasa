
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, Barber, Transaction, CosmeticTransaction, Expense, Income, PaymentMethod, TipRecipient, DailyHistory } from './types';
import SummaryHeader from './components/SummaryHeader';
import BarberGrid from './components/BarberGrid';
import ExpenseManager from './components/ExpenseManager';
import IncomeManager from './components/IncomeManager';
import CosmeticProductManager from './components/CosmeticProductManager';
import HistoryManager from './components/HistoryManager';
import HistorySearch from './components/HistorySearch';
import SyncPanel from './components/SyncPanel';

const STORAGE_KEY = 'mens_space_v11_history';
const SYNC_API_BASE = 'https://kvdb.io/A4xT8uXGfVbYc2p9zLqM1r'; 

const INITIAL_BARBERS: Barber[] = [
  { id: '1', name: 'Rasim', transactions: [], cosmeticTransactions: [], currentCommissionRate: 0.40 },
  { id: '2', name: 'Artem', transactions: [], cosmeticTransactions: [], currentCommissionRate: 0.40 },
  { id: '3', name: 'Saleh', transactions: [], cosmeticTransactions: [], currentCommissionRate: 0.40 },
  { id: '4', name: 'Rafo', transactions: [], cosmeticTransactions: [], currentCommissionRate: 0.40 },
  { id: '5', name: 'Karen', transactions: [], cosmeticTransactions: [], currentCommissionRate: 0.40 },
  { id: '6', name: 'Bayram', transactions: [], cosmeticTransactions: [], currentCommissionRate: 0.40 },
  { id: '7', name: 'Bos1', transactions: [], cosmeticTransactions: [], currentCommissionRate: 0.40 },
  { id: '8', name: 'Bos2', transactions: [], cosmeticTransactions: [], currentCommissionRate: 0.40 },
];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (parsed.barbers && parsed.barbers.length > 0) {
          let loadedBarbers = parsed.barbers.map((b: any) => ({
            ...b,
            cosmeticTransactions: b.cosmeticTransactions || []
          }));
          // Auto migrate: if exactly 6 barbers exist (from old version), automatically append the two new default barbers to make it 8!
          if (loadedBarbers.length === 6) {
            loadedBarbers = [
              ...loadedBarbers,
              { id: '7', name: 'Emin', transactions: [], cosmeticTransactions: [], currentCommissionRate: 0.40 },
              { id: '8', name: 'David', transactions: [], cosmeticTransactions: [], currentCommissionRate: 0.40 },
            ];
          }
          return { 
            ...parsed, 
            history: parsed.history || [],
            incomes: parsed.incomes || [],
            globalCosmetics: parsed.globalCosmetics || [],
            barbers: loadedBarbers
          };
        }
      } catch (e) { console.error("Local load error", e); }
    }
    return { barbers: INITIAL_BARBERS, expenses: [], incomes: [], globalCosmetics: [], history: [], globalDefaultRate: 0.40, syncCode: '', lastUpdated: Date.now() };
  });

  const [syncStatus, setSyncStatus] = useState<'online' | 'syncing' | 'reconnecting' | 'offline'>('online');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  
  const isUpdatingRef = useRef(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const pushToCloud = useCallback(async (data: AppState) => {
    if (!data.syncCode || data.syncCode.length < 3 || isUpdatingRef.current) return;
    setSyncStatus('syncing');
    try {
      const safeCode = data.syncCode.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      const response = await fetch(`${SYNC_API_BASE}/${safeCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        setLastSync(new Date());
        setSyncStatus('online');
      }
    } catch (e) {
      setSyncStatus('reconnecting');
    }
  }, []);

  const pullFromCloud = useCallback(async (code: string) => {
    if (!code || code.length < 3 || isUpdatingRef.current) return;
    setSyncStatus('syncing');
    try {
      const safeCode = code.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      const response = await fetch(`${SYNC_API_BASE}/${safeCode}?t=${Date.now()}`);
      if (response.ok) {
        const cloudData: AppState = await response.json();
        if (cloudData && cloudData.lastUpdated > state.lastUpdated) {
          isUpdatingRef.current = true;
          setState(cloudData);
          setLastSync(new Date());
          setTimeout(() => { isUpdatingRef.current = false; }, 800);
        }
        setSyncStatus('online');
      }
    } catch (e) {
      setSyncStatus('reconnecting');
    }
  }, [state.lastUpdated]);

  useEffect(() => {
    if (!state.syncCode) return;
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') pullFromCloud(state.syncCode!);
    }, 15000);
    return () => clearInterval(interval);
  }, [state.syncCode, pullFromCloud]);

  const updateStateAndSync = (updater: (prev: AppState) => AppState) => {
    const newState = { ...updater(state), lastUpdated: Date.now() };
    setState(newState);
    if (newState.syncCode) {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => pushToCloud(newState), 1500);
    }
  };

  const updateBarberRate = (barberId: string, rate: number) => {
    updateStateAndSync(prev => ({
      ...prev,
      barbers: prev.barbers.map(b => b.id === barberId ? { ...b, currentCommissionRate: rate } : b)
    }));
  };

  const addTransaction = (barberId: string, amount: number, tip: number, method: PaymentMethod, tipRecipient: TipRecipient) => {
    updateStateAndSync(prev => {
      const barber = prev.barbers.find(b => b.id === barberId);
      if (!barber) return prev;
      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        amount, tip, method, tipRecipient,
        commissionRate: barber.currentCommissionRate,
        timestamp: Date.now(),
      };
      return {
        ...prev,
        barbers: prev.barbers.map(b => b.id === barberId ? { ...b, transactions: [...b.transactions, newTransaction] } : b)
      };
    });
  };

  const addCosmeticTransaction = (barberId: string, amount: number, method: PaymentMethod) => {
    updateStateAndSync(prev => ({
      ...prev,
      barbers: prev.barbers.map(b => b.id === barberId ? { ...b, cosmeticTransactions: [...(b.cosmeticTransactions || []), { id: crypto.randomUUID(), amount, method, timestamp: Date.now() }] } : b)
    }));
  };

  const addGlobalCosmetic = (description: string, amount: number, method: PaymentMethod) => {
    updateStateAndSync(prev => ({
      ...prev,
      globalCosmetics: [...(prev.globalCosmetics || []), { id: crypto.randomUUID(), description, amount, method, timestamp: Date.now() }]
    }));
  };

  const deleteGlobalCosmetic = (id: string) => {
    updateStateAndSync(prev => ({
      ...prev,
      globalCosmetics: (prev.globalCosmetics || []).filter(c => c.id !== id)
    }));
  };

  const deleteTransaction = (barberId: string, transactionId: string) => {
    updateStateAndSync(prev => ({
      ...prev,
      barbers: prev.barbers.map(b => b.id === barberId ? { 
        ...b, 
        transactions: b.transactions.filter(t => t.id !== transactionId),
        cosmeticTransactions: (b.cosmeticTransactions || []).filter(t => t.id !== transactionId)
      } : b)
    }));
  };

  const addExpense = (description: string, amount: number, method: PaymentMethod) => {
    updateStateAndSync(prev => ({
      ...prev,
      expenses: [...prev.expenses, { id: crypto.randomUUID(), description, amount, method, timestamp: Date.now() }]
    }));
  };

  const deleteExpense = (id: string) => {
    updateStateAndSync(prev => ({
      ...prev,
      expenses: prev.expenses.filter(e => e.id !== id)
    }));
  };

  const addIncome = (description: string, amount: number, method: PaymentMethod) => {
    updateStateAndSync(prev => ({
      ...prev,
      incomes: [...(prev.incomes || []), { id: crypto.randomUUID(), description, amount, method, timestamp: Date.now() }]
    }));
  };

  const deleteIncome = (id: string) => {
    updateStateAndSync(prev => ({
      ...prev,
      incomes: prev.incomes.filter(i => i.id !== id)
    }));
  };

  const addBarber = (name: string) => {
    updateStateAndSync(prev => {
      if (prev.barbers.length >= 8) {
        return prev;
      }
      const newBarber: Barber = {
        id: crypto.randomUUID(),
        name: name.trim(),
        transactions: [],
        cosmeticTransactions: [],
        currentCommissionRate: prev.globalDefaultRate || 0.40
      };
      return {
        ...prev,
        barbers: [...prev.barbers, newBarber]
      };
    });
  };

  const deleteBarber = (id: string) => {
    if (window.confirm("Bu berberi silmek istediğinizden emin misiniz? Günlük işlemleri silinecektir.")) {
      updateStateAndSync(prev => ({
        ...prev,
        barbers: prev.barbers.filter(b => b.id !== id)
      }));
    }
  };

  const resetDay = () => {
    if (window.confirm("Günü kapatmak ve verileri arşive kaydetmek istiyor musunuz?")) {
      const allTransactions = state.barbers.flatMap(b => b.transactions);
      const totalService = allTransactions.reduce((acc, t) => acc + t.amount, 0);
      const totalCosmetic = state.barbers.flatMap(b => b.cosmeticTransactions || []).reduce((acc, t) => acc + t.amount, 0) + (state.globalCosmetics || []).reduce((acc, t) => acc + t.amount, 0);
      const totalExpenses = state.expenses.reduce((acc, e) => acc + e.amount, 0);
      const totalManualIncomes = (state.incomes || []).reduce((acc, i) => acc + i.amount, 0);
      const cashierTips = allTransactions.reduce((acc, t) => acc + (t.tipRecipient === 'KASIYER' ? t.tip : 0), 0);
      
      const shopServiceShare = allTransactions.reduce((acc, t) => acc + (t.amount * (1 - t.commissionRate)), 0);
      const shopCosmeticRevenue = (state.globalCosmetics || []).reduce((acc, t) => acc + t.amount, 0);
      const netProfit = (shopServiceShare + cashierTips + totalManualIncomes + shopCosmeticRevenue) - totalExpenses;

      const barberPayouts = state.barbers.map(b => {
        const bTransactions = b.transactions || [];
        const bCosmetics = b.cosmeticTransactions || [];
        
        const calc = (method?: PaymentMethod) => {
          const fT = method ? bTransactions.filter(t => t.method === method) : bTransactions;
          const fC = method ? bCosmetics.filter(c => c.method === method) : bCosmetics;
          const share = fT.reduce((acc, t) => acc + (t.amount * t.commissionRate), 0);
          const tips = fT.reduce((acc, t) => acc + (t.tipRecipient === 'BERBER' || !t.tipRecipient ? t.tip : 0), 0);
          const cosmetics = fC.reduce((acc, t) => acc + t.amount, 0);
          return share + tips + cosmetics;
        };

        return {
          barberName: b.name,
          total: calc(),
          cash: calc('NAKIT'),
          card: calc('KART'),
          transfer: calc('TRANSFER')
        };
      }).filter(b => b.total > 0);

      const newHistoryEntry: DailyHistory = {
        id: crypto.randomUUID(),
        date: Date.now(),
        totalServiceRevenue: totalService,
        totalCosmeticRevenue: totalCosmetic,
        totalExpenses,
        totalManualIncomes,
        totalCashierTips: cashierTips,
        netProfit,
        barberPayouts
      };

      updateStateAndSync(prev => ({
        ...prev,
        history: [newHistoryEntry, ...(prev.history || [])],
        barbers: prev.barbers.map(b => ({ ...b, transactions: [], cosmeticTransactions: [] })),
        expenses: [],
        incomes: [],
        globalCosmetics: []
      }));
    }
  };

  const deleteHistoryItem = (id: string) => {
    if (window.confirm("Bu tarihe ait arşiv kaydını kalıcı olarak silmek istiyor musunuz?")) {
      updateStateAndSync(prev => ({
        ...prev,
        history: prev.history.filter(h => h.id !== id)
      }));
    }
  };

  const handleSetSyncCode = (code: string) => {
    const cleanCode = code.toUpperCase().trim();
    if (cleanCode.length < 3) return;
    updateStateAndSync(prev => ({ ...prev, syncCode: cleanCode }));
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-amber-500 p-3.5 rounded-2xl shadow-2xl transform -rotate-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 11-4.243 4.243 3 3 0 014.243-4.243zm0-5.758a3 3 0 11-4.243-4.243 3 3 0 014.243 4.243z" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter italic leading-none">MENS SPACE</h1>
            <p className="text-amber-500/60 text-[10px] font-black uppercase tracking-[0.4em] mt-2">DİJİTAL MUHASEBE SİSTEMİ</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
          <SyncPanel 
            syncCode={state.syncCode || ''} syncStatus={syncStatus} lastSync={lastSync}
            onSetSyncCode={handleSetSyncCode} onManualSync={() => state.syncCode && pullFromCloud(state.syncCode)}
          />
          <button 
            onClick={resetDay}
            className="flex-1 md:flex-none bg-red-600 hover:bg-red-700 text-white border border-red-500/50 px-6 py-3.5 rounded-2xl font-black text-[10px] tracking-widest transition-all active:scale-95 shadow-xl shadow-red-900/20"
          >
            GÜNÜ KAPAT & ARŞİVLE
          </button>
        </div>
      </header>

      <SummaryHeader state={state} />

      <main className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-12">
        <div className="lg:col-span-3">
          <BarberGrid 
            barbers={state.barbers} onUpdateRate={updateBarberRate}
            onAddTransaction={addTransaction} onAddCosmeticTransaction={addCosmeticTransaction}
            onDeleteTransaction={deleteTransaction}
            onAddBarber={addBarber} onDeleteBarber={deleteBarber}
          />
        </div>
        <aside className="lg:col-span-1 space-y-4">
          <IncomeManager incomes={state.incomes || []} onAddIncome={addIncome} onDeleteIncome={deleteIncome} />
          <ExpenseManager expenses={state.expenses} onAddExpense={addExpense} onDeleteExpense={deleteExpense} />
          <HistorySearch history={state.history || []} />
        </aside>
      </main>

      <section className="mt-8">
        <CosmeticProductManager 
          cosmetics={state.globalCosmetics || []} onAddCosmetic={addGlobalCosmetic} onDeleteCosmetic={deleteGlobalCosmetic}
        />
      </section>

      <section className="mt-12">
        <HistoryManager history={state.history || []} onDeleteHistory={deleteHistoryItem} />
      </section>

      <footer className="mt-24 text-center border-t border-slate-900 pt-16 pb-24 flex flex-col items-center gap-8">
        <div className="flex items-center gap-6 opacity-20">
           <span className="h-px w-20 bg-gradient-to-r from-transparent to-slate-100"></span>
           <span className="text-xs font-black tracking-[0.6em] text-white">TBILISI • MENS SPACE</span>
           <span className="h-px w-20 bg-gradient-to-l from-transparent to-slate-100"></span>
        </div>
        <p className="text-[9px] uppercase font-bold tracking-[0.5em] text-slate-800">MENS SPACE • DIGITAL ACCOUNTING SYSTEM • 2024</p>
      </footer>
    </div>
  );
};

export default App;
