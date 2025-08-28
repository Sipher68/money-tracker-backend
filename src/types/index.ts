import { Request } from 'express';

// Transaction Types
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string; // ISO date string (YYYY-MM-DD)
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

export interface NewTransaction {
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface TransactionFilters {
  type?: TransactionType;
  category?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

// Budget Types
export interface Budget {
  id: string;
  user_id: string;
  category: string;
  budget_amount: number;
  spent_amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewBudget {
  category: string;
  budget_amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date: string;
}

// Savings Goal Types
export interface SavingsGoal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  category: string;
  target_date: string;
  priority: 'low' | 'medium' | 'high';
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewSavingsGoal {
  title: string;
  description: string;
  target_amount: number;
  category: string;
  target_date: string;
  priority: 'low' | 'medium' | 'high';
}

// User Types
export interface User {
  id: string;
  firebase_uid: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface NewUser {
  firebase_uid: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request Types
export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
  };
}
