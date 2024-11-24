import React, { useState } from 'react';
import { Calendar, ArrowLeft, ArrowRight, Plus, TrendingUp, TrendingDown, PiggyBank, ChevronDown, ChevronUp, Wallet } from 'lucide-react';
import { useStore } from '../store';
import { formatMonth, formatDate } from '../utils/dateUtils';
import { TransactionForm } from './TransactionForm';
import type { Transaction } from '../types';

export const MonthlyTransactions = () => {
  const { transactions } = useStore();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth());
  });
  const [showForm, setShowForm] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Filtere Transaktionen für den aktuellen Monat
  const monthlyTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate.getMonth() === currentMonth.getMonth() &&
      transactionDate.getFullYear() === currentMonth.getFullYear()
    );
  });

  // Berechne Summen
  const baseAccountBalance = 5000; // Beispiel-Basiskontostand
  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyBalance = monthlyIncome - monthlyExpenses;

  // Gruppiere Transaktionen nach Datum
  const groupedTransactions = monthlyTransactions.reduce((groups, transaction) => {
    const date = transaction.date.split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  // Sortiere Daten absteigend
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const toggleSection = (date: string) => {
    setExpandedSections(prev =>
      prev.includes(date)
        ? prev.filter(d => d !== date)
        : [...prev, date]
    );
  };

  const formatAmount = (transaction: Transaction) => {
    const amount = transaction.type === 'expense' ? -transaction.amount : transaction.amount;
    return `€${amount.toFixed(2)}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-display">Monatliche Transaktionen</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100/10 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-display">{formatMonth(currentMonth)}</span>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100/10 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-transparent border border-gray-200/10">
        {sortedDates.map(date => (
          <div key={date}>
            <button
              onClick={() => toggleSection(date)}
              className="w-full px-6 py-3 flex items-center justify-between hover:bg-gray-100/5 dark:hover:bg-gray-700/30 transition-colors border-b border-gray-200/10 dark:border-gray-700/50"
            >
              <div className="flex items-center gap-4">
                <span className="font-display">{formatDate(new Date(date))}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-emerald-600">
                    +€{groupedTransactions[date]
                      .filter(t => t.type === 'income')
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toFixed(2)}
                  </span>
                  <span className="text-sm text-rose-600">
                    -€{groupedTransactions[date]
                      .filter(t => t.type === 'expense')
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>
              {expandedSections.includes(date) ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {expandedSections.includes(date) && (
              <div className="divide-y divide-gray-200/10 dark:divide-gray-700/50">
                {groupedTransactions[date].map(transaction => (
                  <div
                    key={transaction.id}
                    className="px-6 py-3 flex items-center justify-between hover:bg-gray-100/5 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{transaction.category}</p>
                    </div>
                    <span
                      className={
                        transaction.type === 'income'
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                      }
                    >
                      {formatAmount(transaction)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {sortedDates.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="font-display">Keine Transaktionen in diesem Monat</p>
          </div>
        )}
      </div>

      <button
        onClick={() => setShowForm(true)}
        className="w-full py-3 rounded-lg bg-purple-600/80 hover:bg-purple-700/80 text-white font-medium transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Neue Transaktion
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-200/10 rounded-2xl p-6 max-w-lg w-full">
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