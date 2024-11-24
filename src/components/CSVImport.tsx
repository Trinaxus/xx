import React, { useRef, useState } from 'react';
import { Upload, Download, AlertCircle, Calendar, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { exportTransactionsToCSV } from '../utils/csvUtils';
import { parseGermanDate, formatMonth } from '../utils/dateUtils';
import type { Transaction } from '../types';

export const CSVImport = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const { 
    addTransaction, 
    transactions,
    recurringTransactions,
    deleteTransactionsByMonth
  } = useStore();

  // Get unique months from transactions
  const availableMonths = React.useMemo(() => {
    const months = new Set<string>();
    transactions.forEach(t => {
      const date = new Date(t.date);
      months.add(`${date.getFullYear()}-${date.getMonth()}`);
    });
    return Array.from(months)
      .map(key => {
        const [year, month] = key.split('-').map(Number);
        return { key, label: formatMonth(month, year), year, month };
      })
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
  }, [transactions]);

  const parseCSV = async (file: File) => {
    try {
      setError(null);
      const text = await file.text();
      const rows = text.split('\n').filter(row => row.trim());
      const headers = rows[0].split(';').map(h => h.trim().replace(/^"|"$/g, ''));
      
      // Expected column order
      const expectedColumns = [
        'Status',
        'Datum',
        'Beschreibung',
        'Kategorie',
        'Betrag',
        'Typ',
        'Zahlungsart',
        'Wiederkehrend'
      ];

      // Validate column order
      const isValidOrder = expectedColumns.every((col, idx) => headers[idx] === col);
      if (!isValidOrder) {
        throw new Error(`Ungültige Spaltenreihenfolge. Erwartet: ${expectedColumns.join(';')}`);
      }

      const transactions = rows.slice(1).map(row => {
        const values = row.split(';').map(v => v.trim().replace(/^"|"$/g, ''));
        const data: Record<string, string> = {};
        
        headers.forEach((header, index) => {
          data[header] = values[index] || '';
        });

        const date = parseGermanDate(data['Datum']);
        if (!date) {
          throw new Error(`Ungültiges Datum in Zeile: ${row}`);
        }

        // Parse status - set isPending based on the status value
        const isPending = data['Status']?.toLowerCase()?.includes('ausstehend') ?? true;

        const transaction: Partial<Transaction> = {
          id: crypto.randomUUID(),
          date,
          amount: Math.abs(Number(data['Betrag'].replace(',', '.')) || 0),
          description: data['Beschreibung'] || '',
          category: data['Kategorie'] || 'Sonstiges',
          type: data['Typ']?.toLowerCase().includes('einnahme') ? 'income' : 'expense',
          paymentMethod: data['Zahlungsart'] || 'Überweisung',
          isPending,
          isRecurring: data['Wiederkehrend']?.toLowerCase() === 'ja'
        };

        if (isNaN(transaction.amount || 0)) {
          throw new Error(`Ungültiger Betrag in Zeile: ${row}`);
        }

        return transaction as Transaction;
      });

      transactions.forEach(transaction => {
        addTransaction(transaction);
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Import der CSV-Datei');
    }
  };

  const handleExportCSV = () => {
    const monthsToExport = selectedMonths.length > 0 ? selectedMonths : undefined;
    exportTransactionsToCSV(transactions, recurringTransactions, monthsToExport);
    setShowExportModal(false);
  };

  const handleDeleteMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-').map(Number);
    if (window.confirm(`Möchten Sie wirklich alle Transaktionen für ${formatMonth(month, year)} löschen?`)) {
      deleteTransactionsByMonth(month, year);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Upload className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-display">CSV Import/Export</h2>
        </div>

        <button
          onClick={() => setShowExportModal(true)}
          className="px-4 py-2 bg-gray-100/5 dark:bg-gray-700/50 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200/20 dark:hover:bg-gray-600/50 transition-colors flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          <span>CSV Export</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-rose-100/10 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            parseCSV(file);
          }
        }}
        accept=".csv"
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full p-8 border-2 border-dashed border-gray-300/50 dark:border-gray-700/50 rounded-lg hover:border-purple-500/50 transition-colors"
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-center font-display">
          CSV-Datei hier ablegen oder klicken zum Auswählen
        </p>
        <p className="text-center text-sm text-gray-500 mt-2">
          Erforderliche Spaltenreihenfolge: Status;Datum;Beschreibung;
          Kategorie;Betrag;Typ;
          Zahlungsart;Wiederkehrend
        </p>
      </button>

      {/* Available Months */}
      <div className="mt-6">
        <h3 className="text-lg font-display mb-4">Verfügbare Monate</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableMonths.map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center justify-between p-4 rounded-lg bg-white/5 dark:bg-gray-800/50"
            >
              <span>{label}</span>
              <button
                onClick={() => handleDeleteMonth(key)}
                className="p-1 text-gray-500 hover:text-rose-500 transition-colors"
                title="Monat löschen"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white/5 dark:bg-gray-800/50 rounded-2xl p-6 max-w-lg w-full">
            <h3 className="text-xl font-display mb-4">Monate für Export auswählen</h3>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {availableMonths.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedMonths.includes(key)}
                    onChange={(e) => {
                      setSelectedMonths(prev =>
                        e.target.checked
                          ? [...prev, key]
                          : prev.filter(m => m !== key)
                      );
                    }}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleExportCSV}
                className="flex-1 py-2 px-4 bg-purple-600/50 text-white rounded-lg hover:bg-purple-700/50 transition-colors"
              >
                Exportieren
              </button>
              <button
                onClick={() => {
                  setShowExportModal(false);
                  setSelectedMonths([]);
                }}
                className="flex-1 py-2 px-4 bg-gray-200/20 dark:bg-gray-700/50 rounded-lg hover:opacity-90 transition-opacity"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        <p className="font-medium mb-2">CSV Format:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Status: "Bestätigt" oder "Ausstehend"</li>
          <li>Datum: DD. MM YYYY (z.B. 15. Januar 2024)</li>
          <li>Beschreibung: Text</li>
          <li>Kategorie: Eine der vordefinierten Kategorien</li>
          <li>Betrag: Dezimalzahl mit Komma (z.B. 123,45)</li>
          <li>Typ: "Einnahme" oder "Ausgabe"</li>
          <li>Zahlungsart: Eine der vordefinierten Zahlungsarten</li>
          <li>Wiederkehrend: "Ja" oder "Nein"</li>
        </ul>
      </div>
    </div>
  );
};