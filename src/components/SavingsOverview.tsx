import React, { useState } from 'react';
import { useStore } from '../store';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, ComposedChart } from 'recharts';
import { ChevronDown, ChevronUp, Star, TrendingUp } from 'lucide-react';

export const SavingsOverview = () => {
  const { transactions } = useStore();
  const [expanded, setExpanded] = useState(false);

  // Filtere die Transaktionen für die Kategorie "Sparen"
  const savingsTransactions = transactions.filter(t => t.category === 'Sparen');

  // Initialisiere die Daten für alle Monate
  const initialData = Array.from({ length: 12 }, (_, i) => ({
    date: `${new Date().getFullYear()}-${String(i).padStart(2, '0')}`,
    savings: 0,
    monthlyDeposit: 0
  }));

  // Berechne die Ersparnisse im Zeitverlauf und die monatlichen Einzahlungen
  const savingsData = savingsTransactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;
    const entry = acc.find(d => d.date === monthKey);

    if (entry) {
      entry.monthlyDeposit += Math.abs(transaction.amount);
      entry.savings += Math.abs(transaction.amount);
    }
    return acc;
  }, initialData);

  // Berechne die kumulierten Ersparnisse
  savingsData.reduce((acc, entry) => {
    entry.savings += acc;
    return entry.savings;
  }, 0);

  const toggleExpanded = () => {
    setExpanded(prev => !prev);
  };

  // Berechne den höchsten Sparbetrag
  const maxSavings = Math.max(...savingsData.map(d => d.savings));

  // Monatsnamen für die X-Achse
  const monthNames = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-display">Sparübersicht</h2>
      
      <div className="h-[400px] rounded-2xl bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm p-6 border border-gray-200/10">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={savingsData}>
            <defs>
              <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" strokeOpacity={0.5} />
            <XAxis 
              dataKey="date" 
              tickFormatter={(tick) => monthNames[parseInt(tick.split('-')[1], 10)]}
            />
            <YAxis />
            <Tooltip 
              formatter={(value) => `${value.toFixed(2)}€`}
              contentStyle={{ 
                backgroundColor: 'rgba(31, 41, 55, 0.8)', 
                borderRadius: '0.5rem',
                border: 'none',
                backdropFilter: 'blur(5px)'
              }}
            />
            <Area type="monotone" dataKey="savings" stroke="#34d399" fillOpacity={1} fill="url(#colorSavings)" strokeWidth={2} />
            <Bar dataKey="monthlyDeposit" fill="#eab308" barSize={20} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between px-6 py-4 bg-green-100 dark:bg-green-900 rounded-2xl">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
          <p className="text-lg font-display">Höchster Sparbetrag: <span className="font-bold">{maxSavings.toFixed(2)}€</span></p>
        </div>
        <Star className="w-6 h-6 text-yellow-500" title="Meilenstein erreicht!" />
      </div>

      <div className="rounded-2xl bg-white dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700">
        <button
          onClick={toggleExpanded}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50"
        >
          <div className="flex items-center gap-4">
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
            <h3 className="text-lg font-display">Alle Transaktionen</h3>
          </div>
        </button>
        {expanded && (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-display">Datum</th>
                <th className="px-6 py-3 text-left text-sm font-display">Beschreibung</th>
                <th className="px-6 py-3 text-left text-sm font-display">Betrag</th>
                <th className="px-6 py-3 text-left text-sm font-display">Typ</th>
              </tr>
            </thead>
            <tbody>
              {savingsTransactions.map(transaction => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4">{new Date(transaction.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{transaction.description}</td>
                  <td className="px-6 py-4">{Math.abs(transaction.amount).toFixed(2)}€</td>
                  <td className="px-6 py-4">{transaction.type === 'income' ? 'Einnahme' : 'Ausgabe'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}; 