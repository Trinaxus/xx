import { Transaction } from '../types';
import { formatDate } from './dateUtils';

export const exportTransactionsToCSV = (
  transactions: Transaction[],
  recurringTransactions: Transaction[],
  monthKeys?: string[]
) => {
  // Filtere Transaktionen nach ausgewählten Monaten
  let filteredTransactions = transactions;
  if (monthKeys && monthKeys.length > 0) {
    filteredTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      return monthKeys.includes(key);
    });
  }

  const headers = [
    'Status',
    'Datum',
    'Beschreibung',
    'Kategorie',
    'Betrag',
    'Typ',
    'Zahlungsart',
    'Wiederkehrend'
  ];

  const rows = filteredTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(t => [
      t.isPending ? 'Ausstehend' : 'Bestätigt',
      formatDate(new Date(t.date)),
      t.description,
      t.category,
      t.amount.toFixed(2).replace('.', ','),
      t.type === 'income' ? 'Einnahme' : 'Ausgabe',
      t.paymentMethod,
      t.isRecurring ? 'Ja' : 'Nein'
    ]);

  // CSV-Inhalt erstellen
  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.join(';'))
  ].join('\n');

  // Download initiieren
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `finanzflow-export-${formatDate(new Date())}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};