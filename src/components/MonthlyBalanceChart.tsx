import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CalendarRange, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store';
import { formatDate } from '../utils/dateUtils';

export const MonthlyBalanceChart = () => {
  const { transactions } = useStore();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Erstelle ein Array mit allen Tagen des ausgewählten Monats
  const daysInMonth = useMemo(() => {
    const date = new Date(selectedYear, selectedMonth + 1, 0);
    return date.getDate();
  }, [selectedMonth, selectedYear]);

  // Berechne die tägliche Bilanz
  const dailyData = useMemo(() => {
    // Initialisiere ein Array für jeden Tag des Monats
    const days = Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      return {
        date: new Date(selectedYear, selectedMonth, day),
        balance: 0,
        hasTransactions: false,
        transactions: []
      };
    });

    // Filtere Transaktionen für den ausgewählten Monat
    const monthlyTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    });

    // Berechne die kumulative Bilanz für jeden Tag
    let runningBalance = 0;
    days.forEach(dayData => {
      const dayTransactions = monthlyTransactions.filter(t => {
        const date = new Date(t.date);
        return date.getDate() === dayData.date.getDate();
      });

      if (dayTransactions.length > 0) {
        dayData.hasTransactions = true;
        dayData.transactions = dayTransactions;
        const dayBalance = dayTransactions.reduce((sum, t) => {
          return sum + (t.type === 'income' ? t.amount : -t.amount);
        }, 0);
        runningBalance += dayBalance;
      }
      
      dayData.balance = runningBalance;
    });

    return days.map(day => ({
      name: day.date.getDate().toString().padStart(2, '0'),
      Nettobilanz: day.balance,
      dot: day.hasTransactions,
      transactions: day.transactions
    }));
  }, [transactions, selectedMonth, selectedYear, daysInMonth]);

  // Berechne Monatsstatistiken
  const monthlyStats = useMemo(() => {
    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    });

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expenses,
      balance: income - expenses
    };
  }, [transactions, selectedMonth, selectedYear]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.[0]?.payload) {
      const data = payload[0].payload;
      return (
        <div className="backdrop-blur-md bg-gray-900/80 dark:bg-gray-800/80 p-4 rounded-lg shadow-lg border border-gray-700/50">
          <p className="text-gray-200 font-medium mb-2">{`${label}. ${months[selectedMonth]} ${selectedYear}`}</p>
          <p className="text-sm text-purple-400 mb-2">
            Nettobilanz: €{data.Nettobilanz.toFixed(2)}
          </p>
          {data.transactions && data.transactions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-400">Transaktionen:</p>
              {data.transactions.map((t: any, index: number) => (
                <div key={index} className="text-sm flex items-center justify-between gap-4">
                  <span className="text-gray-300">{t.description}</span>
                  <span className={t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}>
                    {t.type === 'income' ? '+' : '-'}€{Math.abs(t.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const months = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember"
  ];

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <CalendarRange className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-display">Monatsverlauf</h2>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handlePreviousMonth}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          
          <div className="flex items-center gap-2 flex-1 sm:flex-auto justify-center">
            <span className="text-lg font-medium min-w-[100px] text-center">{months[selectedMonth]}</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-1 rounded-lg border border-gray-700/50 bg-gray-900/50 dark:bg-gray-800/50 backdrop-blur-sm"
            >
              {Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>
      
      <div className="h-[300px] sm:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dailyData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" strokeOpacity={0.5} />
            <XAxis 
              dataKey="name" 
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="Nettobilanz"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={(props: any) => {
                const { payload } = props;
                if (payload.dot) {
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={4}
                      fill="#8b5cf6"
                      stroke="none"
                    />
                  );
                }
                return null;
              }}
              activeDot={{ r: 6, fill: "#8b5cf6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/10">
          <p className="text-sm text-gray-500 dark:text-gray-400">Einnahmen</p>
          <p className="text-xl font-semibold text-emerald-600">€{monthlyStats.income.toFixed(2)}</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/10">
          <p className="text-sm text-gray-500 dark:text-gray-400">Ausgaben</p>
          <p className="text-xl font-semibold text-rose-600">€{monthlyStats.expenses.toFixed(2)}</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/10">
          <p className="text-sm text-gray-500 dark:text-gray-400">Bilanz</p>
          <p className={`text-xl font-semibold ${monthlyStats.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            €{monthlyStats.balance.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};
