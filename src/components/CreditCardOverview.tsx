import React, { useState } from 'react';
import { useStore } from '../store';
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, Bar } from 'recharts';
import { ChevronUp, ChevronDown } from 'lucide-react';

export const CreditCardOverview = () => {
  const { transactions } = useStore();
  const [expanded, setExpanded] = useState(false);

  // Filtere die Transaktionen für die Zahlungsart "Kreditkarte"
  const creditCardTransactions = transactions.filter(t => t.paymentMethod === 'Kreditkarte');

  // Initialisiere die Daten für alle Monate
  const initialData = Array.from({ length: 12 }, (_, i) => ({
    date: `${new Date().getFullYear()}-${String(i).padStart(2, '0')}`,
    monthlySpending: 0
  }));

  // Berechne die Ausgaben im Zeitverlauf und die monatlichen Ausgaben
  const creditCardData = creditCardTransactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;
    const entry = acc.find(d => d.date === monthKey);

    if (entry) {
      entry.monthlySpending += Math.abs(transaction.amount);
    }
    return acc;
  }, initialData);

  const toggleExpanded = () => {
    setExpanded(prev => !prev);
  };

  // Berechne den höchsten Ausgabenbetrag
  const maxSpending = Math.max(...creditCardData.map(d => d.monthlySpending));

  // Monatsnamen für die X-Achse
  const monthNames = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-display">Kreditkartenübersicht</h2>
      
      <div className="h-[400px] rounded-2xl bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm p-6 border border-gray-200/10">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={creditCardData}>
            <defs>
              <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f87171" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
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
            <Area type="monotone" dataKey="monthlySpending" stroke="#f87171" fillOpacity={1} fill="url(#colorSpending)" strokeWidth={2} />
            <Bar dataKey="monthlySpending" fill="rgba(234, 179, 8, 0.5)" barSize={10} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between px-6 py-4 bg-red-100 dark:bg-red-900 rounded-2xl">
        <div className="flex items-center gap-2">
          <p className="text-lg font-display">Höchster Ausgabenbetrag: <span className="font-bold">{maxSpending.toFixed(2)}€</span></p>
        </div>
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
              {creditCardTransactions.map(transaction => (
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