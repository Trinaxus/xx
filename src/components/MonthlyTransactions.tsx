import React, { useState } from 'react';
import { Calendar, ArrowLeft, ArrowRight, Plus, TrendingUp, TrendingDown, PiggyBank, ChevronDown, ChevronUp, Wallet } from 'lucide-react';
import { useStore } from '../store';
import { formatMonth, formatDate } from '../utils/dateUtils';
import { TransactionForm } from './TransactionForm';
import type { Transaction } from '../types';

export const MonthlyTransactions = () => {
  const { transactions, calculateMonthBalance, baseAccountBalance } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isCurrentMonth = () => {
    const now = new Date();
    return currentDate.getMonth() === now.getMonth() && 
           currentDate.getFullYear() === currentYear();
  };

  const currentYear = () => currentDate.getFullYear();
  const currentMonth = () => currentDate.getMonth();
  
  const monthBalance = calculateMonthBalance(currentMonth(), currentYear());
  const availableBalance = baseAccountBalance + monthBalance.balance;
  const projectedBalance = availableBalance + monthBalance.pending;

  // Get unique months from transactions and sort them
  const availableMonths = React.useMemo(() => {
    const months = new Set<string>();
    transactions.forEach(t => {
      const date = new Date(t.date);
      if (!isNaN(date.getTime())) { // Validate date
        months.add(`${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`);
      }
    });

    return Array.from(months)
      .map(key => {
        const [year, monthStr] = key.split('-');
        const month = parseInt(monthStr, 10);
        return {
          key,
          label: formatMonth(month, parseInt(year, 10)),
          year: parseInt(year, 10),
          month
        };
      })
      .sort((a, b) => {
        // Sort by year descending first
        if (a.year !== b.year) {
          return b.year - a.year;
        }
        // Then by month descending
        return b.month - a.month;
      });
  }, [transactions]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Navigate to a specific month
  const navigateToMonth = (year: number, month: number) => {
    setCurrentDate(new Date(year, month));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2">
          <button onClick={() => navigateMonth('prev')} className="text-white text-[8px] md:text-base">←</button>
          <h2 className="text-[12px] md:text-xl font-display">{formatMonth(currentDate.getMonth(), currentDate.getFullYear())}</h2>
          <button onClick={() => navigateMonth('next')} className="text-white text-[8px] md:text-base">→</button>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm md:text-base"
        >
          <Plus className="w-5 h-5" />
          <span>Neue Transaktion</span>
        </button>
      </div>

      {/* Monthly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Wallet className="w-6 h-6" />
            <div>
              <p className="text-sm opacity-75">Basiskontostand</p>
              <p className="text-2xl font-bold">€{baseAccountBalance.toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Bilanz:</span>
              <span className={monthBalance.balance >= 0 ? 'text-emerald-300' : 'text-rose-300'}>
                {monthBalance.balance >= 0 ? '+' : ''}€{monthBalance.balance.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Aktueller Kontostand:</span>
              <span className="font-bold">€{availableBalance.toFixed(2)}</span>
            </div>

            {monthBalance.pending !== 0 && (
              <>
                <div className="flex justify-between">
                  <span>Ausstehend:</span>
                  <span className={monthBalance.pending >= 0 ? 'text-emerald-300' : 'text-rose-300'}>
                    {monthBalance.pending >= 0 ? '+' : ''}€{monthBalance.pending.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between pt-2 border-t border-white/20">
                  <span>Projiziert:</span>
                  <span className="font-bold">€{projectedBalance.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="p-6 rounded-2xl bg-emerald-100 dark:bg-emerald-900">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Einnahmen</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                €{monthBalance.income.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6 rounded-2xl bg-rose-100 dark:bg-rose-900">
          <div className="flex items-center gap-3">
            <TrendingDown className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ausgaben</p>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                €{monthBalance.expenses.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6 rounded-2xl bg-purple-100 dark:bg-purple-900">
          <div className="flex items-center gap-3">
            <PiggyBank className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Bilanz</p>
              <p className={`text-2xl font-bold ${
                monthBalance.balance >= 0 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-rose-600 dark:text-rose-400'
              }`}>
                {monthBalance.balance >= 0 ? '+' : ''}€{monthBalance.balance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full">
            <h3 className="text-xl font-display mb-4">Neue Transaktion</h3>
            <TransactionForm
              onSubmit={() => setShowForm(false)}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};