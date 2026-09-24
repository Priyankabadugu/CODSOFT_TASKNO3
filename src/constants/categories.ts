import { Category, CurrencyConfig, Transaction, BudgetGoal } from '../types';

export const CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar ($)' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar ($)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' },
];

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense Categories
  { id: 'exp-housing', name: 'Housing & Rent', type: 'expense', color: '#6366F1', icon: 'Home' },
  { id: 'exp-food', name: 'Groceries & Food', type: 'expense', color: '#10B981', icon: 'ShoppingCart' },
  { id: 'exp-dining', name: 'Dining Out & Cafes', type: 'expense', color: '#F59E0B', icon: 'Utensils' },
  { id: 'exp-transport', name: 'Transportation & Fuel', type: 'expense', color: '#3B82F6', icon: 'Car' },
  { id: 'exp-utilities', name: 'Utilities & Bills', type: 'expense', color: '#EC4899', icon: 'Zap' },
  { id: 'exp-entertainment', name: 'Entertainment & Leisure', type: 'expense', color: '#8B5CF6', icon: 'Film' },
  { id: 'exp-shopping', name: 'Shopping & Electronics', type: 'expense', color: '#14B8A6', icon: 'ShoppingBag' },
  { id: 'exp-health', name: 'Healthcare & Fitness', type: 'expense', color: '#EF4444', icon: 'HeartPulse' },
  { id: 'exp-travel', name: 'Travel & Trips', type: 'expense', color: '#06B6D4', icon: 'Plane' },
  { id: 'exp-education', name: 'Education & Courses', type: 'expense', color: '#84CC16', icon: 'GraduationCap' },
  { id: 'exp-misc', name: 'Miscellaneous', type: 'expense', color: '#6B7280', icon: 'MoreHorizontal' },

  // Income Categories
  { id: 'inc-salary', name: 'Monthly Salary', type: 'income', color: '#059669', icon: 'Briefcase' },
  { id: 'inc-freelance', name: 'Freelance & Consulting', type: 'income', color: '#2563EB', icon: 'Laptop' },
  { id: 'inc-investments', name: 'Investments & Dividends', type: 'income', color: '#7C3AED', icon: 'TrendingUp' },
  { id: 'inc-business', name: 'Business Revenue', type: 'income', color: '#D97706', icon: 'Store' },
  { id: 'inc-bonus', name: 'Bonuses & Gifts', type: 'income', color: '#DB2777', icon: 'Gift' },
  { id: 'inc-other', name: 'Other Income', type: 'income', color: '#4B5563', icon: 'Coins' },
];

export const DEFAULT_BUDGETS: BudgetGoal[] = [
  { category: 'Groceries & Food', monthlyLimit: 600 },
  { category: 'Dining Out & Cafes', monthlyLimit: 300 },
  { category: 'Housing & Rent', monthlyLimit: 1600 },
  { category: 'Transportation & Fuel', monthlyLimit: 250 },
  { category: 'Shopping & Electronics', monthlyLimit: 350 },
  { category: 'Entertainment & Leisure', monthlyLimit: 200 },
  { category: 'Utilities & Bills', monthlyLimit: 220 },
];

// Helper to get formatted current month dates
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
const prevMonthNum = now.getMonth() === 0 ? 12 : now.getMonth();
const prevYear = now.getMonth() === 0 ? currentYear - 1 : currentYear;
const prevMonth = String(prevMonthNum).padStart(2, '0');

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'income',
    amount: 5200,
    category: 'Monthly Salary',
    date: `${currentYear}-${currentMonth}-01`,
    description: 'TechCorp primary salary payout',
    paymentMethod: 'Bank Transfer',
    createdAt: Date.now() - 6 * 86400000,
  },
  {
    id: 'tx-2',
    type: 'income',
    amount: 850,
    category: 'Freelance & Consulting',
    date: `${currentYear}-${currentMonth}-03`,
    description: 'Client UX audit contract milestone',
    paymentMethod: 'Digital Wallet',
    createdAt: Date.now() - 4 * 86400000,
  },
  {
    id: 'tx-3',
    type: 'expense',
    amount: 1450,
    category: 'Housing & Rent',
    date: `${currentYear}-${currentMonth}-02`,
    description: 'Apartment monthly lease & maintenance',
    paymentMethod: 'Bank Transfer',
    createdAt: Date.now() - 5 * 86400000,
  },
  {
    id: 'tx-4',
    type: 'expense',
    amount: 185.5,
    category: 'Groceries & Food',
    date: `${currentYear}-${currentMonth}-04`,
    description: 'Whole Foods organic weekly grocery haul',
    paymentMethod: 'Card',
    createdAt: Date.now() - 3 * 86400000,
  },
  {
    id: 'tx-5',
    type: 'expense',
    amount: 64.2,
    category: 'Dining Out & Cafes',
    date: `${currentYear}-${currentMonth}-05`,
    description: 'Dinner with colleagues at Italian Bistro',
    paymentMethod: 'Card',
    createdAt: Date.now() - 2 * 86400000,
  },
  {
    id: 'tx-6',
    type: 'expense',
    amount: 75.0,
    category: 'Transportation & Fuel',
    date: `${currentYear}-${currentMonth}-05`,
    description: 'Gas station fuel & metro refill pass',
    paymentMethod: 'Card',
    createdAt: Date.now() - 2 * 86400000,
  },
  {
    id: 'tx-7',
    type: 'expense',
    amount: 120.0,
    category: 'Utilities & Bills',
    date: `${currentYear}-${currentMonth}-06`,
    description: 'High-speed fiber internet & electricity bill',
    paymentMethod: 'Bank Transfer',
    createdAt: Date.now() - 1 * 86400000,
  },
  {
    id: 'tx-8',
    type: 'expense',
    amount: 45.0,
    category: 'Entertainment & Leisure',
    date: `${currentYear}-${currentMonth}-06`,
    description: 'Cinema IMAX tickets & streaming subscriptions',
    paymentMethod: 'Digital Wallet',
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'tx-9',
    type: 'income',
    amount: 340,
    category: 'Investments & Dividends',
    date: `${prevYear}-${prevMonth}-28`,
    description: 'Quarterly ETF index dividend distribution',
    paymentMethod: 'Bank Transfer',
    createdAt: Date.now() - 10 * 86400000,
  },
  {
    id: 'tx-10',
    type: 'expense',
    amount: 149.99,
    category: 'Shopping & Electronics',
    date: `${prevYear}-${prevMonth}-25`,
    description: 'Ergonomic mechanical keyboard upgrade',
    paymentMethod: 'Card',
    createdAt: Date.now() - 13 * 86400000,
  }
];
