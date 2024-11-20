import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Euro, Tag, FileText, Calendar, CreditCard, Upload, Save, X, Repeat } from 'lucide-react';
import { CATEGORIES, PAYMENT_METHODS } from '../types';
import type { Transaction } from '../types';

interface TransactionFormProps {
  initialData?: Partial<Transaction>;
  onSubmit?: () => void;
  onCancel?: () => void;
  recurringTransactions?: Transaction[];
}

export const TransactionForm = ({ 
  initialData, 
  onSubmit, 
  onCancel,
  recurringTransactions = []
}: TransactionFormProps) => {
  const { 
    addTransaction, 
    editTransaction, 
    addRecurringTransaction,
    editRecurringTransaction,
    updateRecurringTransactions
  } = useStore();
  const [useRecurringTemplate, setUseRecurringTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [createRecurring, setCreateRecurring] = useState(initialData?.isRecurring || false);
  const [recurringInterval, setRecurringInterval] = useState<'monthly' | 'weekly' | 'yearly'>(
    initialData?.recurringInterval || 'monthly'
  );
  
  // Safely handle date conversion
  const getInitialDate = () => {
    if (!initialData?.date) return new Date().toISOString().split('T')[0];
    const date = new Date(initialData.date);
    return isNaN(date.getTime()) ? new Date().toISOString().split('T')[0] : date.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    amount: initialData?.amount?.toString() || '',
    category: initialData?.category || CATEGORIES[0],
    description: initialData?.description || '',
    type: initialData?.type || 'expense',
    date: getInitialDate(),
    paymentMethod: initialData?.paymentMethod || PAYMENT_METHODS[0],
    receipt: initialData?.receipt || '',
    isPending: initialData?.isPending ?? true,
  });

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        amount: initialData.amount?.toString() || '',
        category: initialData.category || CATEGORIES[0],
        description: initialData.description || '',
        type: initialData.type || 'expense',
        date: getInitialDate(),
        paymentMethod: initialData.paymentMethod || PAYMENT_METHODS[0],
        receipt: initialData.receipt || '',
        isPending: initialData.isPending ?? true,
      });
      setCreateRecurring(initialData.isRecurring || false);
      setRecurringInterval(initialData.recurringInterval || 'monthly');
    }
  }, [initialData]);

  const handleTemplateChange = (templateId: string) => {
    const template = recurringTransactions.find(t => t.id === templateId);
    if (template) {
      setFormData({
        amount: template.amount.toString(),
        category: template.category,
        description: template.description,
        type: template.type,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: template.paymentMethod,
        receipt: template.receipt || '',
        isPending: true,
      });
      setCreateRecurring(true);
      setRecurringInterval(template.recurringInterval || 'monthly');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const transactionData = {
      amount: Number(formData.amount),
      category: formData.category,
      description: formData.description,
      type: formData.type as 'income' | 'expense',
      date: new Date(formData.date),
      paymentMethod: formData.paymentMethod,
      receipt: formData.receipt,
      isPending: formData.isPending,
      isRecurring: createRecurring,
      recurringInterval: createRecurring ? recurringInterval : undefined
    };

    if (initialData?.id) {
      if (initialData.isRecurring) {
        const updateAll = window.confirm(
          'Möchten Sie alle zukünftigen wiederkehrenden Zahlungen dieser Serie aktualisieren?'
        );
        
        if (updateAll) {
          await editRecurringTransaction(initialData.id, transactionData);
          // Aktualisiere auch alle zukünftigen Instanzen
          const futureTransactions = transactions.filter(t => 
            t.recurringId === initialData.id && 
            new Date(t.date) >= new Date()
          );
          for (const transaction of futureTransactions) {
            await editTransaction(transaction.id, transactionData);
          }
        } else {
          // Nur diese einzelne Instanz aktualisieren
          await editTransaction(initialData.id, {
            ...transactionData,
            isRecurring: false,
            recurringId: null
          });
        }
      } else {
        await editTransaction(initialData.id, transactionData);
      }
    } else {
      if (createRecurring) {
        await addRecurringTransaction(transactionData);
      } else {
        await addTransaction(transactionData);
      }
    }

    onSubmit?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {recurringTransactions.length > 0 && !initialData?.id && (
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={useRecurringTemplate}
              onChange={(e) => setUseRecurringTemplate(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <span className="text-sm font-display flex items-center gap-1">
              <Repeat className="w-4 h-4" />
              Wiederkehrende Transaktion als Vorlage verwenden
            </span>
          </label>

          {useRecurringTemplate && (
            <select
              value={selectedTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <option value="">Vorlage auswählen...</option>
              {recurringTransactions.map(t => (
                <option key={t.id} value={t.id}>
                  {t.description} ({t.type === 'income' ? '+' : '-'}€{t.amount})
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Amount Field */}
        <div>
          <label className="block text-sm font-display mb-1">Betrag</label>
          <div className="relative">
            <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
        </div>

        {/* Category Field */}
        <div>
          <label className="block text-sm font-display mb-1">Kategorie</label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={formData.category}
              onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500"
            >
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description Field */}
        <div className="md:col-span-2">
          <label className="block text-sm font-display mb-1">Beschreibung</label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Date Field */}
        <div>
          <label className="block text-sm font-display mb-1">Datum</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={formData.date}
              onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Payment Method Field */}
        <div>
          <label className="block text-sm font-display mb-1">Zahlungsart</label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={formData.paymentMethod}
              onChange={e => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500"
            >
              {PAYMENT_METHODS.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Transaction Type */}
        <div className="md:col-span-2">
          <label className="block text-sm font-display mb-1">Typ</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="expense"
                checked={formData.type === 'expense'}
                onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as 'expense' | 'income' }))}
                className="w-4 h-4 text-purple-600"
              />
              <span>Ausgabe</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="income"
                checked={formData.type === 'income'}
                onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as 'expense' | 'income' }))}
                className="w-4 h-4 text-purple-600"
              />
              <span>Einnahme</span>
            </label>
          </div>
        </div>

        {/* Status Field */}
        <div className="md:col-span-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!formData.isPending}
              onChange={(e) => setFormData(prev => ({ ...prev, isPending: !e.target.checked }))}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <span>Transaktion bestätigt</span>
          </label>
        </div>

        {/* Recurring Transaction Option */}
        <div className="md:col-span-2 space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={createRecurring}
              onChange={(e) => setCreateRecurring(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <span className="text-sm font-display flex items-center gap-1">
              <Repeat className="w-4 h-4" />
              {initialData?.isRecurring 
                ? 'Als wiederkehrende Transaktion bearbeiten'
                : 'Als wiederkehrende Transaktion speichern'
              }
            </span>
          </label>

          {createRecurring && (
            <select
              value={recurringInterval}
              onChange={(e) => setRecurringInterval(e.target.value as 'monthly' | 'weekly' | 'yearly')}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <option value="monthly">Monatlich</option>
              <option value="weekly">Wöchentlich</option>
              <option value="yearly">Jährlich</option>
            </select>
          )}
        </div>

        {/* Receipt Upload */}
        <div className="md:col-span-2">
          <label className="block text-sm font-display mb-1">Beleg hochladen</label>
          <div className="relative">
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setFormData(prev => ({ ...prev, receipt: reader.result as string }));
                  };
                  reader.readAsDataURL(file);
                }
              }}
              accept="image/*,.pdf"
              className="hidden"
              id="receipt"
            />
            <label
              htmlFor="receipt"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:border-purple-500 cursor-pointer transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span>{formData.receipt ? 'Beleg ausgewählt' : 'Beleg auswählen'}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity font-display flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          Speichern
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-700 rounded-lg hover:opacity-90 transition-opacity font-display flex items-center justify-center gap-2"
        >
          <X className="w-5 h-5" />
          Abbrechen
        </button>
      </div>
    </form>
  );
};