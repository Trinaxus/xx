import React, { useState, useMemo } from 'react';
import { Edit2, Trash2, Filter, Plus, Repeat, Calendar, Search, ChevronDown, ChevronUp, Clock, Download, Zap, FileText, Check, Minus, CheckCircle2, CheckCircle } from 'lucide-react';
import { useStore } from '../store';
import { formatDate, formatMonth, isValidDate } from '../utils/dateUtils';
import { TransactionForm } from './TransactionForm';
import type { Transaction } from '../types';

export const TransactionManager = () => {
  const { 
    transactions, 
    deleteTransaction,
    recurringTransactions,
    toggleTransactionPending,
    updateTransactions
  } = useStore();
  
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedMonths, setExpandedMonths] = useState<string[]>([]);
  const [selectAllMonths, setSelectAllMonths] = useState(false);
  
  // Group transactions by month with correct sorting
  const groupedTransactions = useMemo(() => {
    const groups = new Map<string, Transaction[]>();
    
    // Filter transactions
    const filteredTransactions = transactions.filter(t => {
      const matchesFilter = filter === 'all' || t.type === filter;
      const matchesSearch = !searchTerm || 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    // Group by month
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      if (!isValidDate(date)) return;
      
      const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)?.push(transaction);
    });

    // Sort transactions within each group by date descending
    groups.forEach((transactions, key) => {
      transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    // Convert to array and sort by date descending
    const sortedEntries = Array.from(groups.entries()).sort((a, b) => {
      const [yearA, monthA] = a[0].split('-').map(Number);
      const [yearB, monthB] = b[0].split('-').map(Number);
      return yearB * 12 + monthB - (yearA * 12 + monthA);
    });

    return new Map(sortedEntries);
  }, [transactions, filter, searchTerm]);

  const toggleMonth = (monthKey: string) => {
    setExpandedMonths(prev => 
      prev.includes(monthKey)
        ? prev.filter(m => m !== monthKey)
        : [...prev, monthKey]
    );
  };

  const formatAmount = (transaction: Transaction) => {
    const amount = Math.abs(transaction.amount);
    return `€${amount.toFixed(2)}`;
  };

  const calculateMonthlyTotals = (monthTransactions: Transaction[]) => {
    return monthTransactions.reduce(
      (acc, t) => {
        const amount = t.amount;
        if (t.type === 'income') {
          acc.income += amount;
        } else {
          acc.expenses += amount;
        }
        acc.balance = acc.income - acc.expenses;
        return acc;
      },
      { income: 0, expenses: 0, balance: 0 }
    );
  };

  // Check if a transaction matches a recurring pattern
  const isRecurringTransaction = (transaction: Transaction) => {
    return recurringTransactions.some(rt => 
      rt.description === transaction.description &&
      rt.amount === transaction.amount &&
      rt.category === transaction.category &&
      rt.type === transaction.type &&
      rt.paymentMethod === transaction.paymentMethod
    );
  };

  const handleSelectAllMonths = () => {
    if (selectAllMonths) {
      setExpandedMonths([]);
    } else {
      setExpandedMonths(Array.from(groupedTransactions.keys()));
    }
    setSelectAllMonths(!selectAllMonths);
  };

  const toggleAllTransactionsStatus = (monthKey: string, setAsPending: boolean) => {
    transactions.forEach(t => {
      const transactionKey = formatMonthKey(new Date(t.date));
      if (transactionKey === monthKey) {
        if (t.isPending !== setAsPending) {
          toggleTransactionPending(t.id);
        }
      }
    });
  };

  const areAllTransactionsConfirmed = (monthKey: string) => {
    return transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        const transactionKey = `${transactionDate.getFullYear()}-${transactionDate.getMonth()}`;
        return transactionKey === monthKey;
      })
      .every(t => !t.isPending);
  };

  const formatMonthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex-1 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Transaktion suchen..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <option value="all">Alle Transaktionen</option>
              <option value="income">Nur Einnahmen</option>
              <option value="expense">Nur Ausgaben</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAllMonths}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <span>{selectAllMonths ? 'Alle zuklappen' : 'Alle aufklappen'}</span>
            </button>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Neue Transaktion</span>
          </button>
        </div>
      </div>

      {/* Monthly Transaction Groups */}
      <div className="space-y-4">
        {Array.from(groupedTransactions.entries()).map(([monthKey, monthTransactions]) => {
          const [year, month] = monthKey.split('-').map(Number);
          const monthName = formatMonth(month, year);
          const isExpanded = expandedMonths.includes(monthKey);
          const totals = calculateMonthlyTotals(monthTransactions);

          return (
            <div key={monthKey} className="rounded-2xl bg-white dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Month Header */}
              <button
                onClick={() => toggleMonth(monthKey)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-center gap-4">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                  <h3 className="text-lg font-display">{monthName}</h3>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Einnahmen</p>
                    <p className="font-medium text-emerald-600">+€{totals.income.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Ausgaben</p>
                    <p className="font-medium text-rose-600">-€{totals.expenses.toFixed(2)}</p>
                  </div>
                  <div className="text-right min-w-[120px]">
                    <p className="text-sm text-gray-500">Bilanz</p>
                    <p className={`font-medium ${
                      totals.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {totals.balance >= 0 ? '+' : ''}{totals.balance.toFixed(2)}€
                    </p>
                  </div>
                </div>
              </button>

              {/* Transactions Table */}
              {isExpanded && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-display">
                          <div className="flex items-center gap-2">
                            Status
                            <div className="flex gap-1">
                              <button
                                onClick={() => toggleAllTransactionsStatus(monthKey, false)}
                                className="p-1 hover:text-purple-600 transition-colors"
                                title="Alle als ausgeführt markieren"
                              >
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              </button>
                              <button
                                onClick={() => toggleAllTransactionsStatus(monthKey, true)}
                                className="p-1 hover:text-purple-600 transition-colors"
                                title="Alle als ausstehend markieren"
                              >
                                <Clock className="w-4 h-4 text-gray-500" />
                              </button>
                            </div>
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-display">Datum</th>
                        <th className="px-6 py-3 text-left text-sm font-display">Beschreibung</th>
                        <th className="px-6 py-3 text-left text-sm font-display">Kategorie</th>
                        <th className="px-6 py-3 text-right text-sm font-display">Betrag</th>
                        <th className="px-6 py-3 text-right text-sm font-display">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {monthTransactions.map(transaction => {
                        const isRecurring = isRecurringTransaction(transaction);
                        return (
                          <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-6 py-4">
                              <button
                                onClick={() => toggleTransactionPending(transaction.id)}
                                className="p-1 hover:text-purple-600 transition-colors"
                                title={transaction.isPending ? 'Als ausgeführt markieren' : 'Als ausstehend markieren'}
                              >
                                {transaction.isPending ? (
                                  <Clock className="w-4 h-4 text-gray-500" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                )}
                              </button>
                            </td>
                            <td className="px-6 py-4">{formatDate(new Date(transaction.date))}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {transaction.isRecurring ? (
                                  <Repeat className="w-4 h-4 text-purple-500" />
                                ) : (
                                  <Zap className="w-4 h-4 text-amber-500" />
                                )}
                                <span>{transaction.description}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700">
                                {transaction.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className={`font-medium ${
                                transaction.type === 'income' 
                                  ? 'text-emerald-600 dark:text-emerald-400' 
                                  : 'text-rose-600 dark:text-rose-400'
                              } ${transaction.isPending ? 'opacity-50' : ''}`}>
                                {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => setEditingTransaction(transaction)}
                                  className="p-1 hover:text-purple-600 transition-colors"
                                  title="Bearbeiten"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteTransaction(transaction.id)}
                                  className="p-1 hover:text-rose-600 transition-colors"
                                  title="Löschen"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}

        {groupedTransactions.size === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white dark:bg-gray-800 rounded-2xl">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-display">
              {searchTerm 
                ? 'Keine Transaktionen gefunden' 
                : 'Keine Transaktionen vorhanden'}
            </p>
          </div>
        )}
      </div>

      {/* Transaction Form Modals */}
      {(showForm || editingTransaction) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full">
            <h3 className="text-xl font-display mb-4">
              {editingTransaction ? 'Transaktion bearbeiten' : 'Neue Transaktion'}
            </h3>
            <TransactionForm
              initialData={editingTransaction || undefined}
              onSubmit={() => {
                setShowForm(false);
                setEditingTransaction(null);
              }}
              onCancel={() => {
                setShowForm(false);
                setEditingTransaction(null);
              }}
              recurringTransactions={recurringTransactions}
            />
          </div>
        </div>
      )}
    </div>
  );
};