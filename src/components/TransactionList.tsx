import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Edit,
  Copy,
  Calendar,
  X,
  CreditCard,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Layers,
} from 'lucide-react';
import { Category, CurrencyConfig, FilterState, Transaction, TransactionType } from '../types';
import { formatCurrency, formatDate } from '../utils/storage';
import { CategoryIcon } from './CategoryIcon';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  currency: CurrencyConfig;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onDuplicateTransaction: (tx: Transaction) => void;
  onOpenAddModal: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  currency,
  onEditTransaction,
  onDeleteTransaction,
  onDuplicateTransaction,
  onOpenAddModal,
}) => {
  // Local Filter State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    type: 'all',
    category: 'all',
    startDate: '',
    endDate: '',
    paymentMethod: 'all',
    sortBy: 'date-desc',
  });

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Filter and Sort Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Search filter
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesDesc = tx.description?.toLowerCase().includes(query);
        const matchesCat = tx.category.toLowerCase().includes(query);
        const matchesAmount = tx.amount.toString().includes(query);
        const matchesPay = tx.paymentMethod.toLowerCase().includes(query);
        if (!matchesDesc && !matchesCat && !matchesAmount && !matchesPay) {
          return false;
        }
      }

      // 2. Type filter
      if (filters.type !== 'all' && tx.type !== filters.type) {
        return false;
      }

      // 3. Category filter
      if (filters.category !== 'all' && tx.category !== filters.category) {
        return false;
      }

      // 4. Payment Method
      if (filters.paymentMethod !== 'all' && tx.paymentMethod !== filters.paymentMethod) {
        return false;
      }

      // 5. Date filters
      if (filters.startDate && tx.date < filters.startDate) {
        return false;
      }
      if (filters.endDate && tx.date > filters.endDate) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'date-desc':
          return b.date.localeCompare(a.date) || b.createdAt - a.createdAt;
        case 'date-asc':
          return a.date.localeCompare(b.date) || a.createdAt - b.createdAt;
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });
  }, [transactions, filters]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.type !== 'all' ||
    filters.category !== 'all' ||
    filters.startDate !== '' ||
    filters.endDate !== '' ||
    filters.paymentMethod !== 'all';

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      type: 'all',
      category: 'all',
      startDate: '',
      endDate: '',
      paymentMethod: 'all',
      sortBy: 'date-desc',
    });
    setCurrentPage(1);
  };

  return (
    <div
      id="transactions-table-container"
      className="rounded-2xl border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden"
    >
      {/* Header bar */}
      <div className="p-4 sm:p-6 border-b border-zinc-100 dark:border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <span>Transaction History</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                {filteredTransactions.length}
              </span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Filter, search, review, and edit all your financial entries
            </p>
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear Filters
              </button>
            )}
            <button
              id="add-transaction-list-btn"
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Entry</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 pt-2">
          {/* Search Box (5 cols on lg) */}
          <div className="relative lg:col-span-4">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="transaction-search-input"
              type="text"
              placeholder="Search by note, category, or amount..."
              value={filters.searchQuery}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, searchQuery: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm rounded-xl border bg-zinc-50 dark:bg-zinc-800/60 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Filter Pills (3 cols on lg) */}
          <div className="lg:col-span-3 flex items-center p-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
            {(['all', 'expense', 'income'] as const).map((t) => (
              <button
                key={t}
                id={`filter-type-${t}`}
                type="button"
                onClick={() => {
                  setFilters((prev) => ({ ...prev, type: t }));
                  setCurrentPage(1);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                  filters.type === t
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {t === 'all' ? 'All' : t === 'expense' ? 'Expenses' : 'Income'}
              </button>
            ))}
          </div>

          {/* Category Dropdown (3 cols on lg) */}
          <div className="lg:col-span-3">
            <select
              id="category-filter-select"
              value={filters.category}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, category: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2.5 text-xs sm:text-sm rounded-xl border bg-zinc-50 dark:bg-zinc-800/60 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          {/* Sort By (2 cols on lg) */}
          <div className="lg:col-span-2">
            <select
              id="sort-by-select"
              value={filters.sortBy}
              onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as FilterState['sortBy'] }))}
              className="w-full py-1.5 px-2.5 text-xs sm:text-sm rounded-xl border bg-zinc-50 dark:bg-zinc-800/60 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="date-desc">Newest Date</option>
              <option value="date-asc">Oldest Date</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Display */}
      {filteredTransactions.length === 0 ? (
        <div className="py-16 px-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center mx-auto mb-3 text-zinc-400">
            <Layers className="w-7 h-7" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
            No transactions found
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1 mb-4">
            {hasActiveFilters
              ? 'Try modifying your search criteria or resetting filters.'
              : 'Start logging your daily income and expense transactions to see them here.'}
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 transition-colors"
            >
              Reset Filters
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Record First Transaction</span>
            </button>
          )}
        </div>
      ) : (
        <div>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 font-semibold border-b border-zinc-100 dark:border-zinc-800 text-xs">
                <tr>
                  <th className="py-3 px-4">Transaction / Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {paginatedTransactions.map((tx) => {
                  const matchedCat = categories.find((c) => c.name === tx.category);
                  const isIncome = tx.type === 'income';

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors group"
                    >
                      {/* Category & Description */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                            style={{ backgroundColor: matchedCat?.color || (isIncome ? '#10B981' : '#F43F5E') }}
                          >
                            <CategoryIcon name={matchedCat?.icon || 'Tag'} size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                              {tx.description || tx.category}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                              <span>{tx.category}</span>
                              <span>•</span>
                              <span className={isIncome ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-rose-600 dark:text-rose-400 font-medium'}>
                                {isIncome ? 'Income' : 'Expense'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-xs text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {tx.paymentMethod}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-extrabold text-sm sm:text-base ${
                            isIncome
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-zinc-900 dark:text-zinc-100'
                          }`}
                        >
                          {isIncome ? '+' : '-'}
                          {formatCurrency(tx.amount, currency.symbol)}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => onDuplicateTransaction(tx)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Duplicate transaction"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditTransaction(tx)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                            title="Edit transaction"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteTransaction(tx.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {paginatedTransactions.map((tx) => {
              const matchedCat = categories.find((c) => c.name === tx.category);
              const isIncome = tx.type === 'income';

              return (
                <div key={tx.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                        style={{ backgroundColor: matchedCat?.color || (isIncome ? '#10B981' : '#F43F5E') }}
                      >
                        <CategoryIcon name={matchedCat?.icon || 'Tag'} size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                          {tx.description || tx.category}
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {tx.category} • {formatDate(tx.date)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p
                        className={`font-extrabold text-sm ${
                          isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-zinc-900 dark:text-zinc-100'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {formatCurrency(tx.amount, currency.symbol)}
                      </p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {tx.paymentMethod}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
                    <button
                      type="button"
                      onClick={() => onDuplicateTransaction(tx)}
                      className="text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 px-2 py-1"
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditTransaction(tx)}
                      className="text-xs font-medium text-blue-600 dark:text-blue-400 px-2 py-1"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteTransaction(tx.id)}
                      className="text-xs font-medium text-rose-600 dark:text-rose-400 px-2 py-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Footer */}
          <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>
              Showing {Math.min(filteredTransactions.length, (currentPage - 1) * itemsPerPage + 1)} to{' '}
              {Math.min(filteredTransactions.length, currentPage * itemsPerPage)} of{' '}
              {filteredTransactions.length} entries
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Previous
                </button>
                <span className="px-2 font-semibold text-zinc-800 dark:text-zinc-200">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
