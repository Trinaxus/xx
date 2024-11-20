import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Tag } from 'lucide-react';
import { useStore } from '../store';

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#6366f1'];

  export const CategoryAnalysis = () => {
  const { getCurrentMonthAnalysis } = useStore();
  const analysis = getCurrentMonthAnalysis();
  
  const categoryData = Object.entries(analysis.categories)
    .map(([name, amount]) => ({
      name,
      value: Math.abs(amount)
    }))
    .sort((a, b) => b.value - a.value);

  // Erweiterte Farbpalette mit 12 unterschiedlichen Farben
  const COLORS = [
    '#8b5cf6', // Violett
    '#ec4899', // Pink
    '#f59e0b', // Orange
    '#10b981', // Smaragdgrün
    '#3b82f6', // Blau
    '#ef4444', // Rot
    '#06b6d4', // Cyan
    '#f97316', // Helles Orange
    '#6366f1', // Indigo
    '#84cc16', // Limette
    '#a855f7', // Lila
    '#14b8a6', // Türkis
  ];

  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, value, index, fill } = props;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    const innerX = cx + (outerRadius + 10) * Math.cos(-midAngle * RADIAN);
    const innerY = cy + (outerRadius + 10) * Math.sin(-midAngle * RADIAN);

    return (
      <g>
        <path
          d={`M ${innerX},${innerY} L ${x},${y}`}
          stroke={fill}
          fill="none"
          strokeWidth={1}
        />
        <text
          x={x}
          y={y}
          fill={fill}
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
          className="font-medium"
        >
          {`€${value.toFixed(2)}`}
        </text>
      </g>
    );
  };

  // Angepasstes Rendering für die Legende
  const renderColorfulLegendText = (value: string, entry: any) => {
    return (
      <span className="text-sm font-medium" style={{ color: entry.color }}>
        {entry.payload.name} (€{entry.payload.value.toFixed(2)})
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Tag className="w-6 h-6 text-purple-600" />
        <h2 className="text-xl font-display">Kategorien (Aktueller Monat)</h2>
      </div>
      
      <div className="h-[300px] rounded-2xl bg-white dark:bg-gray-800 p-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="50%"
              outerRadius="75%"
              paddingAngle={5}
              label={renderCustomizedLabel}
              labelLine={false}
            >
              {categoryData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name, props) => [`€${Number(value).toFixed(2)}`, name]}
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.5rem'
              }}
              itemStyle={{ color: props => props.payload.fill }}
            />
            <Legend 
              formatter={renderColorfulLegendText}
              layout="vertical"
              align="right"
              verticalAlign="middle"
              wrapperStyle={{
                paddingLeft: '20px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {categoryData.map((category, index) => (
          <div
            key={category.name}
            className="p-4 rounded-lg bg-white dark:bg-gray-800"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="font-display text-sm">{category.name}</span>
            </div>
            <p className="mt-1 text-lg font-bold">€{Number(category.value).toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};