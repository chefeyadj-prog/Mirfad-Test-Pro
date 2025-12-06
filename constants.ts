
import { Product, Sale, Purchase, Supplier, Employee, Custody, SalaryTransaction, User } from './types';

export const MOCK_PRODUCTS: Product[] = [];

export const MOCK_SALES: Sale[] = [];

export const MOCK_PURCHASES: Purchase[] = [];

export const MOCK_SUPPLIERS: Supplier[] = [];

export const MOCK_EMPLOYEES: Employee[] = [];

export const MOCK_CUSTODY: Custody[] = [];

export const MOCK_SALARY_TRANSACTIONS: SalaryTransaction[] = [];

export const MOCK_USERS: User[] = [
  { id: 'U1', username: 'admin', password: '123', name: 'المدير العام', role: 'admin' },
  { id: 'U2', username: 'accountant', password: '123', name: 'محمد المحاسب', role: 'accountant' },
  { id: 'U3', username: 'cashier', password: '123', name: 'فهد الكاشير', role: 'cashier' },
];
