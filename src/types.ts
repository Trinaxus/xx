export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  category: string;
  description: string;
  type: 'income' | 'expense';
  paymentMethod: string;
  receipt?: string;
  isRecurring?: boolean;
  recurringInterval?: 'monthly' | 'weekly' | 'yearly';
  recurringId?: string | null;
  isPending?: boolean;
}

export const CATEGORIES = [
  'Gehalt',
  'Miete',
  'Lebensmittel',
  'Transport',
  'Unterhaltung',
  'Gesundheit',
  'Bildung',
  'Shopping',
  'Versicherung',
  'Strom',
  'Internet',
  'Sparen',
  'Multimedia',
  'Abonnements',
  'Handy',
  'Kreditkarte',
  'Sonstiges'
] as const;

export const PAYMENT_METHODS = [
  'Bargeld',
  'Überweisung',
  'Kreditkarte',
  'PayPal',
  'Lastschrift',
  'Sonstiges'
] as const;

export interface Budget {
  category: string;
  limit: number;
  spent: number;
  period: 'monthly' | 'yearly';
}

export interface MonthlyAnalysis {
  month: number;
  year: number;
  income: number;
  expenses: number;
  balance: number;
  categories: Record<string, number>;
}

export interface StoreState {
  theme: 'dark' | 'light';
  transactions: Transaction[];
  budgets: Budget[];
  recurringTransactions: Transaction[];
  baseAccountBalance: number;
}

export interface StoreActions {
  toggleTheme: () => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  editTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  deleteTransactionsByMonth: (month: number, year: number) => void;
  updateBudget: (budget: Budget) => void;
  addRecurringTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  editRecurringTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteRecurringTransaction: (id: string) => void;
  applyRecurringTransactions: (month: number, year: number) => void;
  getMonthlyAnalysis: (months: number) => MonthlyAnalysis[];
  getCurrentMonthAnalysis: () => MonthlyAnalysis;
  getYearlyAnalysis: (year: number) => MonthlyAnalysis[];
  updateBaseAccountBalance: (balance: number) => void;
  toggleTransactionPending: (id: string) => void;
  getAvailableBalance: () => number;
  calculateMonthBalance: (month: number, year: number) => {
    income: number;
    expenses: number;
    balance: number;
    pending: number;
    available: number;
  };
  getCurrentBalance: () => number;
}

export type Store = StoreState & StoreActions;