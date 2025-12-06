
export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  partyName: string; // Customer or Supplier name
}

export interface Sale extends Transaction {
  status: 'completed' | 'pending';
}

export interface DailyClosing {
  id: string;
  date: string;
  createdAt: string;
  
  // Actual Counts (Jard)
  cashActual: number;
  cardActual: number;
  totalActual: number;
  
  // System Totals (POS Z-Report)
  cashSystem: number;
  cardSystem: number;
  totalSystem: number;
  
  // Variance
  variance: number;
  
  // Financials
  netSales: number;
  vatAmount: number;
  discountAmount: number;
  grossSales: number;
  tips: number; // New field for Tips

  // Details for viewing later
  details: {
    cashDenominations: Record<string, number>;
    cardReconcile: Record<string, number>;
    posInputs: Record<string, number>;
  };
}

export interface InvoiceItem {
  id: string;
  code?: string; // SKU or Barcode
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Purchase extends Transaction {
  invoiceNumber?: string; // Visual Invoice Number (can be duplicate across suppliers)
  status: 'received' | 'ordered';
  items?: InvoiceItem[];
  currency?: string;
  taxNumber?: string;
  paymentMethod?: 'cash' | 'credit' | 'transfer';
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  cost: number;
  category: string;
  createdAt?: string; // Added for date filtering
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  balance: number;
  taxNumber?: string;
  code?: string; // Supplier Prefix Code (e.g., 200)
}

export interface Employee {
  id: string;
  code?: string; // Employee ID / Job Number
  name: string;
  role: string;
  phone?: string;
  salary: number; // Basic Salary
  joinDate?: string;
}

export type SalaryTransactionType = 'loan' | 'deduction' | 'meal' | 'shortage' | 'bonus' | 'salary_payment';

export interface SalaryTransaction {
  id: string;
  employeeId: string;
  date: string;
  amount: number;
  type: SalaryTransactionType;
  notes?: string;
}

export interface Custody {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  dateGiven: string;
  status: 'active' | 'closed';
  expenses?: number; // Only when closing
  returnAmount?: number; // Only when closing
  notes?: string;
}

export interface DashboardStats {
  totalSales: number;
  totalPurchases: number;
  netProfit: number;
  lowStockCount: number;
}

// Authentication Types
export type UserRole = 'admin' | 'accountant' | 'cashier';

export interface User {
  id: string;
  username: string;
  password?: string; // In real app, never store plain password
  name: string;
  role: UserRole;
  avatar?: string;
}
