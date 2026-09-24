import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Check, Download, RefreshCw } from 'lucide-react';
import {
  BudgetGoal,
  Category,
  CurrencyConfig,
  ThemeMode,
  Transaction,
  TransactionType,
} from './types';
import { DEFAULT_CATEGORIES, INITIAL_TRANSACTIONS } from './constants/categories';
import {
  exportToCSV,
  loadBudgets,
  loadCurrency,
  loadTheme,
  loadTransactions,
  saveBudgets,
  saveCurrency,
  saveTheme,
  saveTransactions,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { FinancialSummaryCards } from './components/FinancialSummaryCards';
import { ChartsDashboard } from './components/ChartsDashboard';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { BudgetModal } from './components/BudgetModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';

export default function App() {
  // 1. Core State with Local Storage persistence
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions());
  const [budgets, setBudgets] = useState<BudgetGoal[]>(() => loadBudgets());
  const [currency, setCurrency] = useState<CurrencyConfig>(() => loadCurrency());
  const [theme, setTheme] = useState<ThemeMode>(() => loadTheme());
  const [categories] = useState<Category[]>(DEFAULT_CATEGORIES);

  // 2. Modals state
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionModalType, setTransactionModalType] = useState<TransactionType>('expense');
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Delete confirm state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    txId?: string;
    isResetAll?: boolean;
  }>({ isOpen: false });

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Sync theme with HTML root class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveTheme(theme);
  }, [theme]);

  // Persist transactions on change
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  // Persist budgets on change
  useEffect(() => {
    saveBudgets(budgets);
  }, [budgets]);

  // Persist currency on change
  const handleCurrencyChange = (newCurrency: CurrencyConfig) => {
    setCurrency(newCurrency);
    saveCurrency(newCurrency);
    showToast(`Currency changed to ${newCurrency.name}`);
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Transaction Operations
  const handleOpenAddModal = (type: TransactionType = 'expense') => {
    setEditingTransaction(null);
    setTransactionModalType(type);
    setIsTransactionModalOpen(true);
  };

  const handleOpenEditModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    setTransactionModalType(tx.type);
    setIsTransactionModalOpen(true);
  };

  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      // Edit
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === existingId
            ? { ...t, ...txData }
            : t
        )
      );
      showToast('Transaction updated successfully');
    } else {
      // Add
      const newTx: Transaction = {
        ...txData,
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: Date.now(),
      };
      setTransactions((prev) => [newTx, ...prev]);
      showToast(`${txData.type === 'income' ? 'Income' : 'Expense'} entry recorded`);
    }
  };

  const handleDeleteRequest = (txId: string) => {
    setDeleteModal({
      isOpen: true,
      txId,
      isResetAll: false,
    });
  };

  const handleDuplicateTransaction = (tx: Transaction) => {
    const duplicate: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      description: `${tx.description || tx.category} (Copy)`,
      createdAt: Date.now(),
    };
    setTransactions((prev) => [duplicate, ...prev]);
    showToast('Transaction duplicated');
  };

  const handleConfirmDelete = () => {
    if (deleteModal.isResetAll) {
      setTransactions(INITIAL_TRANSACTIONS);
      showToast('Sample transactions restored');
    } else if (deleteModal.txId) {
      setTransactions((prev) => prev.filter((t) => t.id !== deleteModal.txId));
      showToast('Transaction removed');
    }
  };

  const handleResetDataRequest = () => {
    setDeleteModal({
      isOpen: true,
      isResetAll: true,
    });
  };

  const handleExportCSV = () => {
    exportToCSV(transactions, currency.code);
    showToast(`Exported ${transactions.length} transactions to CSV`);
  };

  const handleSaveBudgets = (newBudgets: BudgetGoal[]) => {
    setBudgets(newBudgets);
    showToast('Budget goals updated');
  };

  return (
    <div className="min-h-screen bg-zinc-100/70 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors">
      {/* Navigation Header */}
      <Navbar
        theme={theme}
        onToggleTheme={handleToggleTheme}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        onOpenAddModal={() => handleOpenAddModal('expense')}
        onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        onExportCSV={handleExportCSV}
        onResetData={handleResetDataRequest}
        totalTransactionsCount={transactions.length}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* 1. Financial Metric Summary Cards */}
        <FinancialSummaryCards
          transactions={transactions}
          budgets={budgets}
          currency={currency}
          onQuickAddIncome={() => handleOpenAddModal('income')}
          onQuickAddExpense={() => handleOpenAddModal('expense')}
        />

        {/* 2. Interactive Charts & Budget Analytics */}
        <ChartsDashboard
          transactions={transactions}
          categories={categories}
          budgets={budgets}
          currency={currency}
          theme={theme}
        />

        {/* 3. Filterable Transaction Log & Management */}
        <TransactionList
          transactions={transactions}
          categories={categories}
          currency={currency}
          onEditTransaction={handleOpenEditModal}
          onDeleteTransaction={handleDeleteRequest}
          onDuplicateTransaction={handleDuplicateTransaction}
          onOpenAddModal={() => handleOpenAddModal('expense')}
        />
      </main>

      {/* Floating Mobile Action Button */}
      <button
        id="mobile-fab-add-btn"
        type="button"
        onClick={() => handleOpenAddModal('expense')}
        className="sm:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/30 flex items-center justify-center active:scale-95 transition-all"
        aria-label="Add transaction"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="toast-notification"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs sm:text-sm font-semibold shadow-xl border border-zinc-700 dark:border-zinc-300 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        categories={categories}
        currency={currency}
        initialType={transactionModalType}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        budgets={budgets}
        onSaveBudgets={handleSaveBudgets}
        categories={categories}
        currency={currency}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={handleConfirmDelete}
        title={deleteModal.isResetAll ? 'Restore Sample Data' : 'Delete Transaction'}
        message={
          deleteModal.isResetAll
            ? 'This will reset transactions back to the curated sample set. Current entries will be replaced.'
            : 'Are you sure you want to delete this transaction from local storage? This action cannot be undone.'
        }
      />
    </div>
  );
}
