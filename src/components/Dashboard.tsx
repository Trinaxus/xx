import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useStore } from '../store';
import { AccountBalance } from './AccountBalance';

export const Dashboard = () => {
  const { transactions } = useStore();

  // Grundlegende Berechnungen
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AccountBalance />
        
        {/* Einnahmen Card */}
        <div className="p-6 rounded-2xl bg-emerald-100 dark:bg-emerald-900">
          <div className="flex items-center gap-4">
            <TrendingUp className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-sm opacity-75 font-display">Gesamteinnahmen</p>
              <p className="text-2xl font-bold">€{totalIncome.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        {/* Ausgaben Card */}
        <div className="p-6 rounded-2xl bg-rose-100 dark:bg-rose-900">
          <div className="flex items-center gap-4">
            <TrendingDown className="w-8 h-8 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="text-sm opacity-75 font-display">Gesamtausgaben</p>
              <p className="text-2xl font-bold">€{totalExpenses.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};