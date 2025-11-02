
export type ExpenseCategory = 'Groceries' | 'Transport' | 'Entertainment' | 'Bills' | 'Other';

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
}
