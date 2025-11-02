
import React from 'react';
import { Expense, ExpenseCategory } from '../types';
import { TrashIcon } from './icons';

interface ExpenseItemProps {
  expense: Expense;
  onDelete: (id: string) => void;
}

const categoryColors: Record<ExpenseCategory, string> = {
    Groceries: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    Transport: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    Entertainment: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    Bills: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    Other: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
};

const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, onDelete }) => {
  return (
    <li className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${categoryColors[expense.category]}`}>
          {expense.category}
        </span>
        <span className="text-slate-700 dark:text-slate-300">{expense.name}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-medium text-slate-900 dark:text-slate-100">
          ${expense.amount.toFixed(2)}
        </span>
        <button
          onClick={() => onDelete(expense.id)}
          className="text-slate-400 hover:text-red-500 transition-colors duration-200"
          aria-label={`Delete ${expense.name}`}
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </li>
  );
};

export default ExpenseItem;
