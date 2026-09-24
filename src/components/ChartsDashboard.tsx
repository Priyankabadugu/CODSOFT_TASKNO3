import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { PieChart as PieIcon, BarChart3, Target, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { BudgetGoal, CurrencyConfig, Transaction, Category } from '../types';
import { formatCurrency } from '../utils/storage';
import { CategoryIcon } from './CategoryIcon';

interface ChartsDashboardProps {
  transactions: Transaction[];
  categories: Category[];
  budgets: BudgetGoal[];
  currency: CurrencyConfig;
  theme: 'light' | 'dark';
}

type ChartTab = 'breakdown' | 'trend' | 'budgets';
type Timeframe = 'this-month' | 'last-30' | 'this-year' | 'all';

export const ChartsDashboard: React.FC<ChartsDashboardProps> = ({
  transactions,
  categories,
  budgets,
  currency,
  theme,
}) => {
  const [activeTab, setActiveTab] = useState<ChartTab>('breakdown');
  const [timeframe, setTimeframe] = useState<Timeframe>('this-month');

  // Filter transactions based on selected timeframe
  const filteredTransactions = useMemo(() => {
    if (timeframe === 'all') return transactions;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentMonthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

    if (timeframe === 'this-month') {
      return transactions.filter((t) => t.date.startsWith(currentMonthStr));
    }

    if (timeframe === 'this-year') {
      return transactions.filter((t) => t.date.startsWith(`${currentYear}`));
    }

    if (timeframe === 'last-30') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
      return transactions.filter((t) => t.date >= thirtyDaysAgoStr);
    }

    return transactions;
  }, [transactions, timeframe]);

  // 1. Spending by Category Data (for Donut Chart)
  const categorySpendData = useMemo(() => {
    const expenseTx = filteredTransactions.filter((t) => t.type === 'expense');
    const categoryMap: Record<string, { name: string; value: number; count: number; color: string; icon: string }> = {};

    expenseTx.forEach((tx) => {
      const matchedCat = categories.find((c) => c.name === tx.category);
      const color = matchedCat?.color || '#94A3B8';
      const icon = matchedCat?.icon || 'Tag';

      if (!categoryMap[tx.category]) {
        categoryMap[tx.category] = {
          name: tx.category,
          value: 0,
          count: 0,
          color,
          icon,
        };
      }
      categoryMap[tx.category].value += tx.amount;
      categoryMap[tx.category].count += 1;
    });

    const totalExpense = expenseTx.reduce((sum, t) => sum + t.amount, 0);

    return Object.values(categoryMap)
      .map((item) => ({
        ...item,
        percentage: totalExpense > 0 ? (item.value / totalExpense) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions, categories]);

  // 2. Monthly Trend Data (Income vs Expense)
  const monthlyTrendData = useMemo(() => {
    const monthMap: Record<string, { month: string; income: number; expense: number }> = {};

    transactions.forEach((tx) => {
      const monthKey = tx.date.substring(0, 7); // YYYY-MM
      if (!monthMap[monthKey]) {
        const [year, month] = monthKey.split('-');
        const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
        const monthLabel = dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        monthMap[monthKey] = {
          month: monthLabel,
          income: 0,
          expense: 0,
        };
      }
      if (tx.type === 'income') {
        monthMap[monthKey].income += tx.amount;
      } else {
        monthMap[monthKey].expense += tx.amount;
      }
    });

    // Sort chronologically
    return Object.keys(monthMap)
      .sort()
      .map((key) => monthMap[key]);
  }, [transactions]);

  // 3. Category Budgets vs Actual Spending (current month)
  const budgetComparisonData = useMemo(() => {
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const thisMonthExpenses = transactions.filter(
      (t) => t.type === 'expense' && t.date.startsWith(currentMonthStr)
    );

    return budgets.map((b) => {
      const spent = thisMonthExpenses
        .filter((t) => t.category === b.category)
        .reduce((sum, t) => sum + t.amount, 0);
      const percentage = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
      const matchedCat = categories.find((c) => c.name === b.category);

      let status: 'safe' | 'warning' | 'exceeded' = 'safe';
      if (percentage > 100) status = 'exceeded';
      else if (percentage > 80) status = 'warning';

      return {
        category: b.category,
        budget: b.monthlyLimit,
        spent,
        remaining: b.monthlyLimit - spent,
        percentage,
        status,
        color: matchedCat?.color || '#6366F1',
        icon: matchedCat?.icon || 'Tag',
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [budgets, transactions, categories]);

  const totalFilteredExpense = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const isDark = theme === 'dark';

  return (
    <div
      id="charts-dashboard-container"
      className="rounded-2xl border p-5 sm:p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm"
    >
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl max-w-fit">
          <button
            id="tab-btn-breakdown"
            type="button"
            onClick={() => setActiveTab('breakdown')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'breakdown'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <PieIcon className="w-4 h-4 text-emerald-500" />
            <span>Spending Breakdown</span>
          </button>

          <button
            id="tab-btn-trend"
            type="button"
            onClick={() => setActiveTab('trend')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'trend'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <span>Income vs Expense</span>
          </button>

          <button
            id="tab-btn-budgets"
            type="button"
            onClick={() => setActiveTab('budgets')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'budgets'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Target className="w-4 h-4 text-indigo-500" />
            <span>Budget Health</span>
          </button>
        </div>

        {/* Timeframe selector (for breakdown & trend) */}
        {activeTab === 'breakdown' && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <select
              id="chart-timeframe-select"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as Timeframe)}
              className="text-xs sm:text-sm font-medium rounded-lg border px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/60 border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="this-month">This Month</option>
              <option value="last-30">Last 30 Days</option>
              <option value="this-year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        )}
      </div>

      {/* Tab 1: Category Spending Breakdown (Donut Chart + List) */}
      {activeTab === 'breakdown' && (
        <div className="pt-6">
          {categorySpendData.length === 0 ? (
            <div className="py-14 text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-400">
                <PieIcon className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                No expense data for this timeframe
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Add an expense transaction to view the category breakdown.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Chart container */}
              <div className="lg:col-span-6 h-64 sm:h-72 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-xl border p-2.5 shadow-lg bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs">
                              <p className="font-bold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-1.5">
                                <span
                                  className="w-2.5 h-2.5 rounded-full inline-block"
                                  style={{ backgroundColor: data.color }}
                                />
                                {data.name}
                              </p>
                              <p className="text-zinc-600 dark:text-zinc-400 font-semibold">
                                {formatCurrency(data.value, currency.symbol)}
                              </p>
                              <p className="text-zinc-400 dark:text-zinc-500 text-[11px] mt-0.5">
                                {data.percentage.toFixed(1)}% of total ({data.count} txns)
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Pie
                      data={categorySpendData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {categorySpendData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text in donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    Total Spent
                  </span>
                  <span className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
                    {formatCurrency(totalFilteredExpense, currency.symbol, 0)}
                  </span>
                </div>
              </div>

              {/* Category Legend & Details */}
              <div className="lg:col-span-6 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {categorySpendData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-800/30 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs"
                        style={{ backgroundColor: item.color }}
                      >
                        <CategoryIcon name={item.icon} size={14} />
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                          {item.count} {item.count === 1 ? 'transaction' : 'transactions'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-2">
                      <p className="font-bold text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(item.value, currency.symbol)}
                      </p>
                      <div className="flex items-center justify-end gap-1.5 mt-0.5">
                        <div className="w-14 bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                          />
                        </div>
                        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 w-8 text-right">
                          {item.percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Monthly Income vs Expenses Trend */}
      {activeTab === 'trend' && (
        <div className="pt-6">
          {monthlyTrendData.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                No trend data available yet
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Add transactions across months to compare cash inflows and outflows.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  Cash Flow Comparison by Month
                </h3>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                    <span className="text-zinc-600 dark:text-zinc-400">Income</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-rose-500" />
                    <span className="text-zinc-600 dark:text-zinc-400">Expense</span>
                  </div>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={isDark ? '#27272a' : '#f4f4f5'}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: isDark ? '#a1a1aa' : '#71717a', fontSize: 11 }}
                      axisLine={{ stroke: isDark ? '#3f3f46' : '#e4e4e7' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: isDark ? '#a1a1aa' : '#71717a', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => `${currency.symbol}${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                    />
                    <RechartsTooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const inc = Number(payload[0]?.value || 0);
                          const exp = Number(payload[1]?.value || 0);
                          const net = inc - exp;
                          return (
                            <div className="rounded-xl border p-3 shadow-lg bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs">
                              <p className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 border-b pb-1 border-zinc-100 dark:border-zinc-800">
                                {label}
                              </p>
                              <div className="space-y-1">
                                <p className="flex justify-between gap-4 text-emerald-600 dark:text-emerald-400 font-medium">
                                  <span>Income:</span>
                                  <span className="font-bold">{formatCurrency(inc, currency.symbol)}</span>
                                </p>
                                <p className="flex justify-between gap-4 text-rose-600 dark:text-rose-400 font-medium">
                                  <span>Expense:</span>
                                  <span className="font-bold">{formatCurrency(exp, currency.symbol)}</span>
                                </p>
                                <p
                                  className={`flex justify-between gap-4 pt-1 border-t border-zinc-100 dark:border-zinc-800 font-bold ${
                                    net >= 0
                                      ? 'text-emerald-700 dark:text-emerald-300'
                                      : 'text-rose-700 dark:text-rose-300'
                                  }`}
                                >
                                  <span>Net:</span>
                                  <span>{formatCurrency(net, currency.symbol)}</span>
                                </p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend wrapperStyle={{ display: 'none' }} />
                    <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={36} />
                    <Bar dataKey="expense" fill="#F43F5E" radius={[4, 4, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Budget Tracking & Health */}
      {activeTab === 'budgets' && (
        <div className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              Monthly Category Spending Limits
            </h3>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Target vs Actual (Current Month)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {budgetComparisonData.map((item) => (
              <div
                key={item.category}
                className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs"
                      style={{ backgroundColor: item.color }}
                    >
                      <CategoryIcon name={item.icon} size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {item.category}
                      </h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Limit: {formatCurrency(item.budget, currency.symbol, 0)}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      item.status === 'exceeded'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : item.status === 'warning'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {item.status === 'exceeded' ? (
                      <>
                        <AlertCircle className="w-3 h-3" /> Exceeded
                      </>
                    ) : item.status === 'warning' ? (
                      <>
                        <AlertCircle className="w-3 h-3" /> Near Limit
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> On Track
                      </>
                    )}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden my-2">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      item.status === 'exceeded'
                        ? 'bg-rose-500'
                        : item.status === 'warning'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, item.percentage)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-600 dark:text-zinc-400">
                  <span>Spent: <strong className="text-zinc-900 dark:text-zinc-200">{formatCurrency(item.spent, currency.symbol)}</strong> ({item.percentage.toFixed(0)}%)</span>
                  <span>
                    {item.remaining >= 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {formatCurrency(item.remaining, currency.symbol)} left
                      </span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">
                        +{formatCurrency(Math.abs(item.remaining), currency.symbol)} over
                      </span>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
