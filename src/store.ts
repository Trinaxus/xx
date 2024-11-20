import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Store, Transaction, Budget, MonthlyAnalysis } from './types';
import { isValidDate } from './utils/dateUtils';

interface StoreState {
  theme: string;
  transactions: Transaction[];
  budgets: Budget[];
  recurringTransactions: Transaction[];
  baseAccountBalance: number;
}

interface StoreActions {
  toggleTheme: () => void;
  updateBaseAccountBalance: (balance: number) => void;
  getCurrentBalance: () => number;
  addTransaction: (transaction: Partial<Transaction>) => void;
  editTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  deleteTransactionsByMonth: (year: number, month: number) => void;
  updateBudget: (budget: Budget) => void;
  addRecurringTransaction: (transaction: Partial<Transaction>) => void;
  editRecurringTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteRecurringTransaction: (id: string) => void;
  applyRecurringTransactions: (month: number, year: number) => void;
  toggleTransactionPending: (id: string) => void;
  getMonthlyAnalysis: (months: number) => MonthlyAnalysis[];
  getCurrentMonthAnalysis: () => MonthlyAnalysis;
  getYearlyAnalysis: (year: number) => MonthlyAnalysis[];
  calculateMonthBalance: (month: number, year: number) => {
    income: number;
    expenses: number;
    balance: number;
    pending: number;
    available: number;
  };
  getAvailableBalance: () => number;
  updateRecurringTransactions: (recurringId: string, updates: Partial<Transaction>) => void;
  deleteTransactions: (transactionIds: string[]) => void;
}

export const useStore = create<StoreState & StoreActions>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      transactions: [],
      budgets: [],
      recurringTransactions: [],
      baseAccountBalance: 0,
      
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'dark' ? 'light' : 'dark' 
      })),
      
      updateBaseAccountBalance: (balance) => set(() => ({
        baseAccountBalance: balance
      })),

      getCurrentBalance: () => {
        const { baseAccountBalance, transactions } = get();
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const monthTransactions = transactions.filter(t => {
          const date = new Date(t.date);
          return isValidDate(date) &&
                 date.getMonth() === currentMonth && 
                 date.getFullYear() === currentYear &&
                 !t.isPending;
        });

        return monthTransactions.reduce((balance, t) => {
          return t.type === 'income' 
            ? balance + t.amount
            : balance - t.amount;
        }, baseAccountBalance);
      },

      addTransaction: (transaction) => set((state) => ({
        transactions: [...state.transactions, { 
          ...transaction, 
          id: crypto.randomUUID(),
          isPending: true
        }]
      })),
      
      editTransaction: (id, transaction) => set((state) => ({
        transactions: state.transactions.map(t => 
          t.id === id ? { ...t, ...transaction } : t
        )
      })),
      
      deleteTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter(t => t.id !== id)
      })),

      deleteTransactionsByMonth: (month: number, year: number) => set((state) => ({
        transactions: state.transactions.filter(t => {
          const date = new Date(t.date);
          return !isValidDate(date) || 
                 date.getMonth() !== month || 
                 date.getFullYear() !== year;
        })
      })),
      
      updateBudget: (budget) => set((state) => ({
        budgets: [
          ...state.budgets.filter(b => b.category !== budget.category),
          budget
        ]
      })),

      addRecurringTransaction: (transaction) => set((state) => ({
        recurringTransactions: [...state.recurringTransactions, { 
          ...transaction, 
          id: crypto.randomUUID(),
          isRecurring: true 
        }]
      })),

      editRecurringTransaction: (id, transaction) => set((state) => ({
        recurringTransactions: state.recurringTransactions.map(t =>
          t.id === id ? { ...t, ...transaction } : t
        )
      })),

      deleteRecurringTransaction: (id) => set((state) => ({
        recurringTransactions: state.recurringTransactions.filter(t => t.id !== id)
      })),

      applyRecurringTransactions: (month: number, year: number) => {
        const { recurringTransactions, addTransaction } = get();
        
        recurringTransactions.forEach(transaction => {
          const newTransaction = {
            ...transaction,
            date: new Date(year, month, 1),
            isRecurring: false
          };
          const { id, ...transactionWithoutId } = newTransaction;
          addTransaction(transactionWithoutId);
        });
      },

      toggleTransactionPending: (id) => set((state) => ({
        transactions: state.transactions.map(t =>
          t.id === id ? { ...t, isPending: !t.isPending } : t
        )
      })),
      
      getMonthlyAnalysis: (months: number) => {
        const { transactions } = get();
        const analyses: MonthlyAnalysis[] = [];
        
        for (let i = 0; i < months; i++) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const month = date.getMonth();
          const year = date.getFullYear();
          
          const monthTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return isValidDate(tDate) &&
                   tDate.getMonth() === month && 
                   tDate.getFullYear() === year;
          });
          
          const income = monthTransactions
            .filter(t => t.type === 'income' && !t.isPending)
            .reduce((sum, t) => sum + t.amount, 0);
            
          const expenses = monthTransactions
            .filter(t => t.type === 'expense' && !t.isPending)
            .reduce((sum, t) => sum + t.amount, 0);
            
          const categories = monthTransactions
            .filter(t => !t.isPending)
            .reduce((acc, t) => ({
              ...acc,
              [t.category]: (acc[t.category] || 0) + (t.type === 'expense' ? -t.amount : t.amount)
            }), {} as Record<string, number>);
          
          analyses.push({
            month,
            year,
            income,
            expenses,
            balance: income - expenses,
            categories
          });
        }
        
        return analyses;
      },
      
      getCurrentMonthAnalysis: () => {
        const { getMonthlyAnalysis } = get();
        return getMonthlyAnalysis(1)[0];
      },

      getYearlyAnalysis: (year: number) => {
        const { transactions } = get();
        const analyses: MonthlyAnalysis[] = [];
        
        for (let month = 0; month < 12; month++) {
          const monthTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return isValidDate(tDate) &&
                   tDate.getMonth() === month && 
                   tDate.getFullYear() === year && 
                   !t.isPending;
          });
          
          const income = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
          const expenses = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
            
          const categories = monthTransactions.reduce((acc, t) => ({
            ...acc,
            [t.category]: (acc[t.category] || 0) + (t.type === 'expense' ? -t.amount : t.amount)
          }), {} as Record<string, number>);
          
          analyses.push({
            month,
            year,
            income,
            expenses,
            balance: income - expenses,
            categories
          });
        }
        
        return analyses;
      },

      calculateMonthBalance: (month: number, year: number) => {
        const { transactions, baseAccountBalance } = get();
        
        const monthTransactions = transactions.filter(t => {
          const date = new Date(t.date);
          return isValidDate(date) &&
                 date.getMonth() === month && 
                 date.getFullYear() === year;
        });

        const totals = monthTransactions.reduce((acc, t) => {
          const amount = t.amount;
          
          if (t.isPending) {
            if (t.type === 'income') {
              acc.pending += amount;
            } else {
              acc.pending -= amount;
            }
          } else {
            if (t.type === 'income') {
              acc.income += amount;
            } else {
              acc.expenses += amount;
            }
          }
          
          return acc;
        }, {
          income: 0,
          expenses: 0,
          pending: 0
        });

        const balance = totals.income - totals.expenses;
        const available = baseAccountBalance + balance;

        return {
          income: totals.income,
          expenses: totals.expenses,
          balance,
          pending: totals.pending,
          available
        };
      },

      getAvailableBalance: () => {
        const { calculateMonthBalance } = get();
        const now = new Date();
        return calculateMonthBalance(now.getMonth(), now.getFullYear()).available;
      },

      updateRecurringTransactions: (recurringId, updates) => set(state => ({
        transactions: state.transactions.map(t =>
          t.recurringId === recurringId && new Date(t.date) >= new Date()
            ? { ...t, ...updates }
            : t
        )
      })),

      deleteTransactions: (transactionIds: string[]) => {
        set((state) => ({
          transactions: state.transactions.filter(t => !transactionIds.includes(t.id))
        }));
      }
    }),
    {
      name: 'finanz-flow-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        transactions: state.transactions,
        budgets: state.budgets,
        recurringTransactions: state.recurringTransactions,
        theme: state.theme,
        baseAccountBalance: state.baseAccountBalance
      }),
      version: 1
    }
  )
);