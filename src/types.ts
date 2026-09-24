export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'Card' | 'Cash' | 'Bank Transfer' | 'Digital Wallet' | 'Other';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  description: string;
  paymentMethod: PaymentMethod;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
}

export interface BudgetGoal {
  category: string;
  monthlyLimit: number;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
}

export interface FilterState {
  searchQuery: string;
  type: 'all' | 'income' | 'expense';
  category: string;
  startDate: string;
  endDate: string;
  paymentMethod: string;
  sortBy: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
}

export type ThemeMode = 'light' | 'dark';
