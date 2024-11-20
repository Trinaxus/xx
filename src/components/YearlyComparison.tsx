import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CalendarRange } from 'lucide-react';
import { useStore } from '../store';
import { formatMonth } from '../utils/dateUtils';

export const YearlyComparison = () => {
  const { getYearlyAnalysis } = useStore();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  const yearlyData = getYearlyAnalysis(selectedYear);
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const chartData = yearlyData.map(analysis => ({
    name: formatMonth(analysis.month, analysis.year),
    Einnahmen: analysis.income,
    Ausgaben: analysis.expenses,
    Bilanz: analysis.balance
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="backdrop-blur-md bg-gray-900/80 dark:bg-gray-800/80 p-4 rounded-lg shadow-lg border border-gray-700/50">
          <p className="text-gray-200 font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={`item-${index}`}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {entry.name} : €{entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarRange className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-display">Jahresvergleich</h2>
        </div>
        
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-4 py-2 rounded-lg border border-gray-700/50 bg-gray-900/50 dark:bg-gray-800/50 backdrop-blur-sm"
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      
      <div className="h-[400px] rounded-2xl bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm p-6 border border-gray-200/10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" strokeOpacity={0.5} />
            <XAxis dataKey="name" tick={{ fill: '#9ca3af' }} />
            <YAxis tick={{ fill: '#9ca3af' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                opacity: 0.8
              }}
            />
            <Line type="monotone" dataKey="Einnahmen" stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="Ausgaben" stroke="#ef4444" strokeWidth={2} />
            <Line type="monotone" dataKey="Bilanz" stroke="#8b5cf6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/10">
          <p className="text-sm text-gray-400 mb-1">Jahreseinnahmen</p>
          <p className="text-2xl font-bold text-emerald-500">
            €{yearlyData.reduce((sum, m) => sum + m.income, 0).toFixed(2)}
          </p>
        </div>
        
        <div className="p-4 rounded-lg bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/10">
          <p className="text-sm text-gray-400 mb-1">Jahresausgaben</p>
          <p className="text-2xl font-bold text-rose-500">
            €{yearlyData.reduce((sum, m) => sum + m.expenses, 0).toFixed(2)}
          </p>
        </div>
        
        <div className="p-4 rounded-lg bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/10">
          <p className="text-sm text-gray-400 mb-1">Jahresbilanz</p>
          <p className="text-2xl font-bold text-purple-500">
            €{yearlyData.reduce((sum, m) => sum + m.balance, 0).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};