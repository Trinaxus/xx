import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CalendarDays } from 'lucide-react';
import { useStore } from '../store';
import { formatMonth } from '../utils/dateUtils';

export const MonthlyComparison = () => {
  const { getMonthlyAnalysis } = useStore();
  const lastSixMonths = getMonthlyAnalysis(6);

  const chartData = lastSixMonths.map(analysis => ({
    name: formatMonth(analysis.month, analysis.year),
    Einnahmen: Number(analysis.income.toFixed(2)),
    Ausgaben: Number(analysis.expenses.toFixed(2)),
    Bilanz: Number(analysis.balance.toFixed(2))
  }));

  // Angepasstes Tooltip-Design
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
              {entry.name} : {entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CalendarDays className="w-6 h-6 text-purple-600" />
        <h2 className="text-xl font-display">Monatsvergleich</h2>
      </div>
      
      <div className="h-[400px] rounded-2xl bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm p-6 border border-gray-200/10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#4b5563" 
              strokeOpacity={0.5} 
            />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis 
              tick={{ fill: '#9ca3af' }}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                opacity: 0.8
              }} 
            />
            <Bar 
              dataKey="Einnahmen" 
              fill="#10b981" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="Ausgaben" 
              fill="#ef4444" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="Bilanz" 
              fill="#8b5cf6" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};