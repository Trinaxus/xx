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

  const months = [
    "Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
    "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"
  ];

  const chartData = yearlyData.map(analysis => ({
    name: months[analysis.month],
    Nettobilanz: analysis.income - analysis.expenses
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
              Nettobilanz: €{entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Berechne die Gesamtbilanz für das Jahr
  const yearlyBalance = yearlyData.reduce((sum, m) => sum + (m.income - m.expenses), 0);
  const totalIncome = yearlyData.reduce((sum, m) => sum + m.income, 0);
  const totalExpenses = yearlyData.reduce((sum, m) => sum + m.expenses, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarRange className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-display">Jahresvergleich {selectedYear}</h2>
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
      
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <defs>
              <linearGradient id="yearlyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" strokeOpacity={0.5} />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="Nettobilanz" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/10">
          <p className="text-sm text-gray-500 dark:text-gray-400">Jahreseinnahmen</p>
          <p className="text-xl font-semibold text-emerald-600">
            €{totalIncome.toFixed(2)}
          </p>
        </div>
        
        <div className="p-4 rounded-xl bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/10">
          <p className="text-sm text-gray-500 dark:text-gray-400">Jahresausgaben</p>
          <p className="text-xl font-semibold text-rose-600">
            €{totalExpenses.toFixed(2)}
          </p>
        </div>
        
        <div className="p-4 rounded-xl bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/10">
          <p className="text-sm text-gray-500 dark:text-gray-400">Jahresbilanz</p>
          <p className={`text-xl font-semibold ${yearlyBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            €{yearlyBalance.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};