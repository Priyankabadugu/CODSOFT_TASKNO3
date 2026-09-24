import React, { useState } from 'react';
import { X, Target, Save, RotateCcw, AlertTriangle } from 'lucide-react';
import { BudgetGoal, Category, CurrencyConfig } from '../types';
import { formatCurrency } from '../utils/storage';
import { DEFAULT_BUDGETS } from '../constants/categories';
import { CategoryIcon } from './CategoryIcon';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgets: BudgetGoal[];
  onSaveBudgets: (newBudgets: BudgetGoal[]) => void;
  categories: Category[];
  currency: CurrencyConfig;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  budgets,
  onSaveBudgets,
  categories,
  currency,
}) => {
  const [localBudgets, setLocalBudgets] = useState<BudgetGoal[]>(budgets);

  // Sync state when opened
  React.useEffect(() => {
    if (isOpen) {
      setLocalBudgets(budgets);
    }
  }, [isOpen, budgets]);

  if (!isOpen) return null;

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  // Handle changing an existing budget or creating one
  const handleLimitChange = (categoryName: string, value: string) => {
    const num = Math.max(0, parseFloat(value) || 0);
    setLocalBudgets((prev) => {
      const existing = prev.find((b) => b.category === categoryName);
      if (existing) {
        return prev.map((b) => (b.category === categoryName ? { ...b, monthlyLimit: num } : b));
      } else {
        return [...prev, { category: categoryName, monthlyLimit: num }];
      }
    });
  };

  const handleResetDefaults = () => {
    setLocalBudgets(DEFAULT_BUDGETS);
  };

  const handleSave = () => {
    onSaveBudgets(localBudgets);
    onClose();
  };

  const totalBudget = localBudgets.reduce((sum, b) => sum + (b.monthlyLimit || 0), 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="budget-modal-dialog"
        className="w-full max-w-xl rounded-2xl border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                Monthly Category Budgets
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Set target monthly spending caps to trigger pacing alerts
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

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Total Overview Box */}
          <div className="p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/60 dark:bg-indigo-950/30 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-indigo-950 dark:text-indigo-300">
                Total Monthly Budget Planned
              </span>
              <p className="text-lg font-extrabold text-indigo-700 dark:text-indigo-200">
                {formatCurrency(totalBudget, currency.symbol, 0)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Defaults
            </button>
          </div>

          {/* Categories Budget Inputs */}
          <div className="space-y-3">
            {expenseCategories.map((cat) => {
              const currentGoal = localBudgets.find((b) => b.category === cat.name);
              const limitValue = currentGoal ? currentGoal.monthlyLimit : 0;

              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} size={14} />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {cat.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-zinc-400 font-bold">{currency.symbol}</span>
                    <input
                      type="number"
                      step="10"
                      min="0"
                      value={limitValue === 0 ? '' : limitValue}
                      placeholder="0"
                      onChange={(e) => handleLimitChange(cat.name, e.target.value)}
                      className="w-24 sm:w-28 px-2.5 py-1 text-xs sm:text-sm font-bold text-right rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 active:scale-[0.98] transition-all"
          >
            <Save className="w-4 h-4" />
            Save Budgets
          </button>
        </div>
      </div>
    </div>
  );
};
