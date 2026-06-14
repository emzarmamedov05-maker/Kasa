
export type PaymentMethod = 'NAKIT' | 'KART' | 'TRANSFER';
export type TipRecipient = 'BERBER' | 'KASIYER';

export interface Transaction {
  id: string;
  amount: number;
  tip: number;
  method: PaymentMethod;
  tipRecipient?: TipRecipient;
  commissionRate: number;
  timestamp: number;
}

export interface CosmeticTransaction {
  id: string;
  amount: number;
  method: PaymentMethod;
  timestamp: number;
  description?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  method: PaymentMethod;
  timestamp: number;
}

export interface Income {
  id: string;
  description: string;
  amount: number;
  method: PaymentMethod;
  timestamp: number;
}

export interface Barber {
  id: string;
  name: string;
  transactions: Transaction[];
  cosmeticTransactions: CosmeticTransaction[];
  currentCommissionRate: number;
}

export interface DailyHistory {
  id: string;
  date: number;
  totalServiceRevenue: number;
  totalCosmeticRevenue: number;
  totalExpenses: number;
  totalManualIncomes: number;
  totalCashierTips: number;
  netProfit: number;
  barberPayouts: {
    barberName: string;
    total: number;
    cash: number;
    card: number;
    transfer?: number;
  }[];
}

export interface AppState {
  barbers: Barber[];
  expenses: Expense[];
  incomes: Income[];
  globalCosmetics: CosmeticTransaction[];
  history: DailyHistory[];
  globalDefaultRate: number;
  syncCode?: string; 
  lastUpdated: number;
}
