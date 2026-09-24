import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Edit2,
  Calendar,
  CreditCard,
  FileText,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import { Category, CurrencyConfig, PaymentMethod, Transaction, TransactionType } from '../types';
import { CategoryIcon } from './CategoryIcon';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'createdAt'>, id?: string) => void;
  editingTransaction?: Transaction | null;
  categories: Category[];
  currency: CurrencyConfig;
  initialType?: TransactionType;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  categories,
  currency,
  initialType = 'expense',
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Card');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset or populate state when modal opens or editingTransaction changes
  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        setType(editingTransaction.type);
        setAmount(editingTransaction.amount.toString());
        setCategory(editingTransaction.category);
        setDate(editingTransaction.date);
        setDescription(editingTransaction.description || '');
        setPaymentMethod(editingTransaction.paymentMethod);
      } else {
        const todayStr = new Date().toISOString().split('T')[0];
        setType(initialType);
        setAmount('');
        setDate(todayStr);
        setDescription('');
        setPaymentMethod(initialType === 'income' ? 'Bank Transfer' : 'Card');

        // Set default category for the type
        const defaultCat = categories.find((c) => c.type === initialType);
        setCategory(defaultCat ? defaultCat.name : '');
      }
      setErrors({});
    }
  }, [isOpen, editingTransaction, initialType, categories]);

  // When type toggles, adjust default category if current category does not match the new type
  const handleTypeToggle = (newType: TransactionType) => {
    setType(newType);
    const available = categories.filter((c) => c.type === newType);
    const hasCurrent = available.some((c) => c.name === category);
    if (!hasCurrent && available.length > 0) {
      setCategory(available[0].name);
    }
    if (!editingTransaction) {
      setPaymentMethod(newType === 'income' ? 'Bank Transfer' : 'Card');
    }
  };

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }

    if (!category.trim()) {
      newErrors.category = 'Please select a category';
    }

    if (!date) {
      newErrors.date = 'Please specify a transaction date';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(
      {
        type,
        amount: Math.round(numAmount * 100) / 100,
        category,
        date,
        description: description.trim(),
        paymentMethod,
      },
      editingTransaction?.id
    );

    onClose();
  };

  const handleAddPreset = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + val).toFixed(2));
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: '' }));
    }
  };

  const setTodayDate = () => {
    setDate(new Date().toISOString().split('T')[0]);
  };

  const setYesterdayDate = () => {
    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    setDate(yest.toISOString().split('T')[0]);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="transaction-modal-dialog"
        className="w-full max-w-lg rounded-2xl border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                editingTransaction
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              }`}
            >
              {editingTransaction ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {editingTransaction
                  ? 'Update transaction parameters and category'
                  : 'Record a new income credit or expense debit'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Type Toggle: Expense / Income */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl">
            <button
              id="modal-type-expense-btn"
              type="button"
              onClick={() => handleTypeToggle('expense')}
              className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Expense (Outflow)
            </button>
            <button
              id="modal-type-income-btn"
              type="button"
              onClick={() => handleTypeToggle('income')}
              className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Income (Inflow)
            </button>
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Amount ({currency.code}) *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 font-bold text-base sm:text-lg">
                {currency.symbol}
              </span>
              <input
                id="transaction-amount-input"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
                }}
                autoFocus
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border font-bold text-lg text-zinc-900 dark:text-zinc-50 bg-zinc-50 dark:bg-zinc-800/60 focus:outline-none focus:ring-2 ${
                  errors.amount
                    ? 'border-rose-500 focus:ring-rose-500'
                    : 'border-zinc-300 dark:border-zinc-700 focus:ring-emerald-500'
                }`}
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-rose-500 font-medium mt-1">{errors.amount}</p>
            )}

            {/* Quick Add Amount Buttons */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[11px] text-zinc-400 self-center mr-1">Quick:</span>
              {[10, 25, 50, 100, 250].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAddPreset(preset)}
                  className="px-2 py-0.5 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
                >
                  +{currency.symbol}{preset}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1 border rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900">
              {filteredCategories.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.name);
                      if (errors.category) setErrors((prev) => ({ ...prev, category: '' }));
                    }}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs font-medium border transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 shadow-2xs'
                        : 'border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} size={11} />
                    </div>
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
            {errors.category && (
              <p className="text-xs text-rose-500 font-medium mt-1">{errors.category}</p>
            )}
          </div>

          {/* Date & Payment Method (Two columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Date *
                </label>
                <div className="flex gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={setTodayDate}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Today
                  </button>
                  <span className="text-zinc-300 dark:text-zinc-600">|</span>
                  <button
                    type="button"
                    onClick={setYesterdayDate}
                    className="text-zinc-500 hover:underline"
                  >
                    Yesterday
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  id="transaction-date-input"
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    if (errors.date) setErrors((prev) => ({ ...prev, date: '' }));
                  }}
                  className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm text-zinc-900 dark:text-zinc-50 bg-zinc-50 dark:bg-zinc-800/60 focus:outline-none focus:ring-2 ${
                    errors.date
                      ? 'border-rose-500 focus:ring-rose-500'
                      : 'border-zinc-300 dark:border-zinc-700 focus:ring-emerald-500'
                  }`}
                />
              </div>
              {errors.date && (
                <p className="text-xs text-rose-500 font-medium mt-1">{errors.date}</p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Payment Method
              </label>
              <select
                id="transaction-payment-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 rounded-xl border text-xs sm:text-sm text-zinc-900 dark:text-zinc-50 bg-zinc-50 dark:bg-zinc-800/60 border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="Card">Credit / Debit Card</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Digital Wallet">Digital Wallet (Apple/Google/UPI)</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Description / Note */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Description / Notes
            </label>
            <input
              id="transaction-desc-input"
              type="text"
              placeholder="e.g. Monthly rent, Client milestone, Dinner with team"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border text-xs sm:text-sm text-zinc-900 dark:text-zinc-50 bg-zinc-50 dark:bg-zinc-800/60 border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              id="modal-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              id="modal-save-btn"
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 active:scale-[0.98] transition-all"
            >
              {editingTransaction ? 'Update Transaction' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
