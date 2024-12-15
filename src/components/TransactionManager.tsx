import React, { useState, useMemo } from 'react';
import { Edit2, Trash2, Filter, Plus, Repeat, Calendar, Search, ChevronDown, ChevronUp, Clock, Download, Zap, Check, Minus, CheckCircle2, CheckCircle } from 'lucide-react';
import { useStore } from '../store';
import { formatDate, formatMonth, isValidDate } from '../utils/dateUtils';
import { TransactionForm } from './TransactionForm';
import type { Transaction } from '../types';

export const TransactionManager = () => {
  const transactions = useStore((state) => state.transactions);
  const recurringTransactions = useStore((state) => state.recurringTransactions);
  const deleteTransaction = useStore((state) => state.deleteTransaction);
  const toggleTransactionPending = useStore((state) => state.toggleTransactionPending);
  const updateTransactions = useStore((state) => state.updateTransactions);
  
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
    return transaction.isRecurring === true;
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

  const handleDelete = (transactionId: string) => {
    const confirmDelete = window.confirm("Möchten Sie diese Transaktion wirklich löschen?");
    if (confirmDelete) {
      deleteTransaction(transactionId);
    }
  };

  // Erstelle ein Array für die Monate mit Abkürzungen
  const months = [
    "Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
    "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"
  ];

  // Berechne die monatlichen Statistiken
  const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
    name: months[i],
    Einnahmen: 0,
    Ausgaben: 0,
    Bilanz: 0,
  }));

  transactions.forEach(transaction => {
    const monthIndex = new Date(transaction.date).getMonth();
    if (!transaction.isPending) { // Nur ausgeführte Transaktionen berücksichtigen
      if (transaction.type === 'income') {
        monthlyStats[monthIndex].Einnahmen += transaction.amount;
      } else {
        monthlyStats[monthIndex].Ausgaben += transaction.amount;
      }
    }
  });

  // Berechne die Bilanz für jeden Monat
  monthlyStats.forEach(month => {
    month.Bilanz = month.Einnahmen - month.Ausgaben;
  });

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
        <div className="flex items-center gap-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Transaktion suchen..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200/10 dark:border-gray-700/50 bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm"
          />
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1 rounded-lg border border-gray-200/10 dark:border-gray-700/50 bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm"
            >
              <option value="all">Alle Transaktionen</option>
              <option value="income">Nur Einnahmen</option>
              <option value="expense">Nur Ausgaben</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAllMonths}
              className="px-4 py-2 bg-gray-100/5 dark:bg-gray-700/50 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200/10 dark:hover:bg-gray-600/50 transition-colors flex items-center gap-2"
            >
              <span>{selectAllMonths ? 'Alle zuklappen' : 'Alle aufklappen'}</span>
            </button>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-purple-600/80 hover:bg-purple-700/80 text-white rounded-lg transition-colors flex items-center gap-2"
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
            <div key={monthKey} className="rounded-2xl bg-gray-100/80 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-700/50 overflow-hidden">
              {/* Month Header */}
              <button
                onClick={() => toggleMonth(monthKey)}
                className="w-full px-4 md:px-6 py-3 md:py-4 flex items-center justify-between hover:bg-gray-200/50 dark:hover:bg-gray-700/30"
              >
                <div className="flex items-center gap-2 md:gap-4">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
                  )}
                  <span className="text-sm md:text-base font-display text-gray-900 dark:text-white">{monthName}</span>
                  <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    ({monthTransactions.length} {monthTransactions.length === 1 ? 'Transaktion' : 'Transaktionen'})
                  </span>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Einnahmen</span>
                    <span className="text-sm md:text-base font-display text-emerald-700 dark:text-emerald-400">
                      {formatAmount({ amount: totals.income })}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Ausgaben</span>
                    <span className="text-sm md:text-base font-display text-rose-700 dark:text-rose-400">
                      {formatAmount({ amount: totals.expenses })}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Bilanz</span>
                    <span className={`text-sm md:text-base font-display ${totals.balance >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                      {formatAmount({ amount: totals.balance })}
                    </span>
                  </div>
                </div>
              </button>

              {/* Transactions Table */}
              <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-200/50 dark:bg-gray-900/50 border-b border-gray-300/50 dark:border-gray-700/50">
                      <tr>
                        <th className="px-2 md:px-6 py-3 text-left text-xs md:text-sm font-display tracking-wider uppercase text-gray-700 dark:text-gray-300">
                          <div className="flex items-center gap-2">
                            Status
                            <div className="flex gap-1">
                              <button
                                onClick={() => toggleAllTransactionsStatus(monthKey, false)}
                                className="p-1 hover:text-purple-700 dark:hover:text-purple-400 transition-colors"
                              >
                                <CheckCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              </button>
                              <button
                                onClick={() => toggleAllTransactionsStatus(monthKey, true)}
                                className="p-1 hover:text-purple-700 dark:hover:text-purple-400 transition-colors"
                              >
                                <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              </button>
                            </div>
                          </div>
                        </th>
                        <th className="px-2 md:px-6 py-3 text-left text-xs md:text-sm font-display tracking-wider uppercase text-gray-700 dark:text-gray-300">Datum</th>
                        <th className="px-2 md:px-6 py-3 text-left text-xs md:text-sm font-display tracking-wider uppercase text-gray-700 dark:text-gray-300">Beschreibung</th>
                        <th className="px-2 md:px-6 py-3 text-left text-xs md:text-sm font-display tracking-wider uppercase text-gray-700 dark:text-gray-300">Kategorie</th>
                        <th className="px-2 md:px-6 py-3 text-right text-xs md:text-sm font-display tracking-wider uppercase text-gray-700 dark:text-gray-300">Betrag</th>
                        <th className="px-2 md:px-6 py-3 text-right text-xs md:text-sm font-display tracking-wider uppercase text-gray-700 dark:text-gray-300">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300/50 dark:divide-gray-700/50">
                      {monthTransactions.map(transaction => {
                        const isRecurring = isRecurringTransaction(transaction);
                        return (
                          <tr key={transaction.id} className="hover:bg-gray-200/50 dark:hover:bg-gray-700/30 transition-colors">
                            <td className="px-2 md:px-6 py-3 md:py-4">
                              <button
                                onClick={() => toggleTransactionPending(transaction.id)}
                                className="p-1 hover:text-purple-700 dark:hover:text-purple-400 transition-colors"
                                title={transaction.isPending ? 'Als ausgeführt markieren' : 'Als ausstehend markieren'}
                              >
                                {transaction.isPending ? (
                                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                                )}
                              </button>
                            </td>
                            <td className="px-2 md:px-6 py-3 md:py-4">
                              <span className="text-sm font-display tracking-wider text-gray-900 dark:text-white">{formatDate(new Date(transaction.date))}</span>
                            </td>
                            <td className="px-2 md:px-6 py-3 md:py-4">
                              <div className="flex items-center gap-2">
                                {isRecurring ? (
                                  <Repeat className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                                ) : (
                                  <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                )}
                                <span className="text-sm font-display tracking-wider text-gray-900 dark:text-white">{transaction.description}</span>
                              </div>
                            </td>
                            <td className="px-2 md:px-6 py-3 md:py-4">
                              <span className="px-2 py-1 rounded-full text-sm font-display tracking-wider bg-gray-200/80 dark:bg-gray-700/50 text-gray-900 dark:text-white">
                                {transaction.category}
                              </span>
                            </td>
                            <td className="px-2 md:px-6 py-3 md:py-4 text-right">
                              <span className={`text-sm font-display tracking-wider ${
                                transaction.type === 'income' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                              }`}>
                                {formatAmount(transaction)}
                              </span>
                            </td>
                            <td className="px-2 md:px-6 py-3 md:py-4 text-right">
                              <div className="flex gap-1 md:gap-2 justify-end">
                                <button
                                  onClick={() => setEditingTransaction(transaction)}
                                  className="p-1 hover:text-purple-700 dark:hover:text-purple-400 transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(transaction.id)}
                                  className="p-1 hover:text-rose-700 dark:hover:text-rose-400 transition-colors"
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
              </div>
            </div>
          );
        })}

        {groupedTransactions.size === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/10 rounded-2xl">
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-200/10 rounded-2xl p-6 max-w-2xl w-full">
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