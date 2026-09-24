import React from 'react';
import {
  Download,
  Moon,
  Plus,
  Sun,
  Target,
  Wallet,
  RotateCcw,
} from 'lucide-react';
import { CurrencyConfig, ThemeMode } from '../types';
import { CURRENCIES } from '../constants/categories';

interface NavbarProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  currency: CurrencyConfig;
  onCurrencyChange: (c: CurrencyConfig) => void;
  onOpenAddModal: () => void;
  onOpenBudgetModal: () => void;
  onExportCSV: () => void;
  onResetData: () => void;
  totalTransactionsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  currency,
  onCurrencyChange,
  onOpenAddModal,
  onOpenBudgetModal,
  onExportCSV,
  onResetData,
  totalTransactionsCount,
}) => {
  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 w-full border-b transition-colors backdrop-blur-md bg-white/90 dark:bg-zinc-950/90 border-zinc-200 dark:border-zinc-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 ring-1 ring-emerald-500/30">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  ExpenseTracker
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  Local Storage
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
                Personal Financial Intelligence & Budgeting
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Currency Selector */}
            <div className="relative">
              <select
                id="currency-selector"
                value={currency.code}
                onChange={(e) => {
                  const selected = CURRENCIES.find((c) => c.code === e.target.value);
                  if (selected) onCurrencyChange(selected);
                }}
                className="appearance-none pl-2.5 pr-7 py-1.5 text-xs sm:text-sm font-semibold rounded-lg border bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                title="Select Display Currency"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-zinc-400">
                <span className="text-[10px]">▼</span>
              </div>
            </div>

            {/* Budget Targets Button */}
            <button
              id="budget-manager-btn"
              type="button"
              onClick={onOpenBudgetModal}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-2xs"
              title="Manage Category Budgets"
            >
              <Target className="w-4 h-4 text-indigo-500" />
              <span className="hidden md:inline">Budgets</span>
            </button>

            {/* Export CSV Button */}
            <button
              id="export-csv-btn"
              type="button"
              onClick={onExportCSV}
              disabled={totalTransactionsCount === 0}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-2xs"
              title="Export Transactions to CSV"
            >
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden md:inline">Export CSV</span>
            </button>

            {/* Reset / Sample Data button */}
            <button
              id="reset-sample-btn"
              type="button"
              onClick={onResetData}
              className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Restore default sample transactions"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Samples</span>
            </button>

            {/* Dark / Light Toggle */}
            <button
              id="theme-toggle-btn"
              type="button"
              onClick={onToggleTheme}
              className="p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle dark/light theme"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-600" />
              )}
            </button>

            {/* Add Transaction Button */}
            <button
              id="add-transaction-header-btn"
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="font-semibold">New Entry</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
