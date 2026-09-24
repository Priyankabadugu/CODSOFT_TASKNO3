import React from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  PiggyBank,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { CurrencyConfig, Transaction, BudgetGoal } from '../types';
import { formatCurrency } from '../utils/storage';

interface FinancialSummaryCardsProps {
  transactions: Transaction[];
  budgets: BudgetGoal[];
  currency: CurrencyConfig;
  onQuickAddIncome: () => void;
  onQuickAddExpense: () => void;
}

export const FinancialSummaryCards: React.FC<FinancialSummaryCardsProps> = ({
  transactions,
  budgets,
  currency,
  onQuickAddIncome,
  onQuickAddExpense,
}) => {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, ((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  // Current month expense calculation
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const currentMonthPrefix = `${currentYear}-${currentMonth}`;

  const currentMonthExpenses = transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonthPrefix))
    .reduce((sum, t) => sum + t.amount, 0);

  const totalMonthlyBudget = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const budgetSpentPct = totalMonthlyBudget > 0 ? (currentMonthExpenses / totalMonthlyBudget) * 100 : 0;
  const budgetRemaining = totalMonthlyBudget - currentMonthExpenses;

  const incomeCount = transactions.filter((t) => t.type === 'income').length;
  const expenseCount = transactions.filter((t) => t.type === 'expense').length;

  return (
    <section id="financial-summary-section" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Balance Card */}
      <div
        id="card-total-balance"
        className="rounded-2xl border p-5 transition-all bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Current Balance
          </span>
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              currentBalance >= 0
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
            }`}
          >
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <h2
            id="summary-balance-value"
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              currentBalance >= 0
                ? 'text-zinc-900 dark:text-zinc-50'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrency(currentBalance, currency.symbol)}
          </h2>
        </div>

        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
          <span className="text-zinc-500 dark:text-zinc-400">
            {savingsRate.toFixed(1)}% savings rate
          </span>
          <span
            className={`inline-flex items-center gap-1 font-semibold ${
              currentBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {currentBalance >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {currentBalance >= 0 ? 'Net Positive' : 'Deficit'}
          </span>
        </div>
      </div>

      {/* 2. Total Income Card */}
      <div
        id="card-total-income"
        className="rounded-2xl border p-5 transition-all bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Total Income
          </span>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline justify-between">
          <h2
            id="summary-income-value"
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400"
          >
            {formatCurrency(totalIncome, currency.symbol)}
          </h2>
          <button
            type="button"
            onClick={onQuickAddIncome}
            className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            title="Quick add income"
          >
            + Add
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>{incomeCount} credit entries</span>
          <span className="font-medium text-emerald-600 dark:text-emerald-400">Inflow</span>
        </div>
      </div>

      {/* 3. Total Expense Card */}
      <div
        id="card-total-expense"
        className="rounded-2xl border p-5 transition-all bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Total Expenses
          </span>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline justify-between">
          <h2
            id="summary-expense-value"
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400"
          >
            {formatCurrency(totalExpense, currency.symbol)}
          </h2>
          <button
            type="button"
            onClick={onQuickAddExpense}
            className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
            title="Quick add expense"
          >
            + Add
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>{expenseCount} debit entries</span>
          <span className="font-medium text-rose-600 dark:text-rose-400">Outflow</span>
        </div>
      </div>

      {/* 4. Monthly Budget Status Card */}
      <div
        id="card-monthly-budget"
        className="rounded-2xl border p-5 transition-all bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            This Month's Budget
          </span>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <PiggyBank className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline justify-between">
          <h2
            id="summary-budget-value"
            className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            {budgetRemaining >= 0
              ? `${formatCurrency(budgetRemaining, currency.symbol)} left`
              : `${formatCurrency(Math.abs(budgetRemaining), currency.symbol)} over`}
          </h2>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-md ${
              budgetSpentPct > 100
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                : budgetSpentPct > 80
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
            }`}
          >
            {budgetSpentPct.toFixed(0)}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              budgetSpentPct > 100
                ? 'bg-rose-500'
                : budgetSpentPct > 80
                ? 'bg-amber-500'
                : 'bg-indigo-500'
            }`}
            style={{ width: `${Math.min(100, budgetSpentPct)}%` }}
          />
        </div>

        <div className="mt-2.5 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>Spent: {formatCurrency(currentMonthExpenses, currency.symbol, 0)}</span>
          <span>Target: {formatCurrency(totalMonthlyBudget, currency.symbol, 0)}</span>
        </div>
      </div>
    </section>
  );
};
