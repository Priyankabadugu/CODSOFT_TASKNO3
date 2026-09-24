import { BudgetGoal, CurrencyConfig, ThemeMode, Transaction } from '../types';
import { CURRENCIES, DEFAULT_BUDGETS, INITIAL_TRANSACTIONS } from '../constants/categories';

const TRANSACTIONS_KEY = 'pet_transactions_data_v1';
const BUDGETS_KEY = 'pet_budgets_data_v1';
const CURRENCY_KEY = 'pet_currency_data_v1';
const THEME_KEY = 'pet_theme_data_v1';

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    if (!raw) {
      saveTransactions(INITIAL_TRANSACTIONS);
      return INITIAL_TRANSACTIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length >= 0) {
      return parsed;
    }
    return INITIAL_TRANSACTIONS;
  } catch (err) {
    console.error('Failed to parse transactions from localStorage', err);
    return INITIAL_TRANSACTIONS;
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (err) {
    console.error('Failed to save transactions to localStorage', err);
  }
}

export function loadBudgets(): BudgetGoal[] {
  try {
    const raw = localStorage.getItem(BUDGETS_KEY);
    if (!raw) {
      saveBudgets(DEFAULT_BUDGETS);
      return DEFAULT_BUDGETS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return DEFAULT_BUDGETS;
  } catch (err) {
    console.error('Failed to load budgets from localStorage', err);
    return DEFAULT_BUDGETS;
  }
}

export function saveBudgets(budgets: BudgetGoal[]): void {
  try {
    localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
  } catch (err) {
    console.error('Failed to save budgets to localStorage', err);
  }
}

export function loadCurrency(): CurrencyConfig {
  try {
    const raw = localStorage.getItem(CURRENCY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.symbol && parsed?.code) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return CURRENCIES[0]; // USD default
}

export function saveCurrency(currency: CurrencyConfig): void {
  try {
    localStorage.setItem(CURRENCY_KEY, JSON.stringify(currency));
  } catch (err) {
    console.error('Failed to save currency to localStorage', err);
  }
}

export function loadTheme(): ThemeMode {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (raw === 'light' || raw === 'dark') {
      return raw;
    }
    // Check system preference
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch {
    // fallback
  }
  return 'light';
}

export function saveTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (err) {
    console.error('Failed to save theme to localStorage', err);
  }
}

export function formatCurrency(amount: number, symbol: string, decimals: number = 2): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${isNegative ? '-' : ''}${symbol}${formatted}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  } catch {
    // ignore
  }
  return dateString;
}

export function exportToCSV(transactions: Transaction[], currencyCode: string): void {
  if (transactions.length === 0) {
    return;
  }

  const headers = ['ID', 'Date', 'Type', 'Category', 'Description', 'Amount', 'Currency', 'Payment Method'];
  
  const rows = transactions.map((t) => [
    `"${t.id}"`,
    `"${t.date}"`,
    `"${t.type.toUpperCase()}"`,
    `"${t.category.replace(/"/g, '""')}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.amount.toFixed(2),
    `"${currencyCode}"`,
    `"${t.paymentMethod}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const today = new Date().toISOString().split('T')[0];
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `expense_tracker_export_${today}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
