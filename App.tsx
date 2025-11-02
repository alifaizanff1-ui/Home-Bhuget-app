
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Expense, ExpenseCategory } from './types';
import { getFinancialTip } from './services/geminiService';
import SummaryCard from './components/SummaryCard';
import ExpenseItem from './components/ExpenseItem';
import { SparklesIcon, LoadingSpinner, WarningIcon } from './components/icons';

const App: React.FC = () => {
  const [budget, setBudget] = useState<number | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [newCategory, setNewCategory] = useState<ExpenseCategory>('Other');
  const [financialTip, setFinancialTip] = useState('');
  const [isLoadingTip, setIsLoadingTip] = useState(false);
  const [error, setError] = useState('');
  const [alertThreshold, setAlertThreshold] = useState<number>(80);
  const [isAlertDismissed, setIsAlertDismissed] = useState(false);

  useEffect(() => {
    try {
      const savedBudget = localStorage.getItem('budget');
      const savedExpenses = localStorage.getItem('expenses');
      const savedThreshold = localStorage.getItem('alertThreshold');
      if (savedBudget) setBudget(JSON.parse(savedBudget));
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
      if (savedThreshold) setAlertThreshold(JSON.parse(savedThreshold));
    } catch (e) {
      console.error("Failed to load data from localStorage", e);
    }
  }, []);

  useEffect(() => {
    try {
      if (budget !== null) localStorage.setItem('budget', JSON.stringify(budget));
      localStorage.setItem('expenses', JSON.stringify(expenses));
      localStorage.setItem('alertThreshold', JSON.stringify(alertThreshold));
    } catch (e) {
      console.error("Failed to save data to localStorage", e);
    }
  }, [budget, expenses, alertThreshold]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const remainingBalance = useMemo(() => {
    if (budget === null) return 0;
    return budget - totalExpenses;
  }, [budget, totalExpenses]);

  const showAlert = useMemo(() => {
    if (budget === null || budget === 0 || isAlertDismissed) return false;
    const spendingPercentage = (totalExpenses / budget) * 100;
    return spendingPercentage >= alertThreshold;
  }, [totalExpenses, budget, alertThreshold, isAlertDismissed]);

  useEffect(() => {
    if (budget === null || budget === 0) return;
    const spendingPercentage = (totalExpenses / budget) * 100;
    if (spendingPercentage < alertThreshold) {
      setIsAlertDismissed(false);
    }
  }, [totalExpenses, budget, alertThreshold]);

  const handleSetBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const budgetValue = parseFloat(newItemAmount);
    if (!isNaN(budgetValue) && budgetValue > 0) {
      setBudget(budgetValue);
      setNewItemAmount('');
      setError('');
    } else {
      setError('Please enter a valid, positive number for your budget.');
    }
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newItemAmount);
    if (newItemName.trim() && !isNaN(amount) && amount > 0) {
      const newExpense: Expense = {
        id: new Date().toISOString(),
        name: newItemName.trim(),
        amount: amount,
        category: newCategory,
      };
      setExpenses(prevExpenses => [...prevExpenses, newExpense].sort((a,b) => a.id < b.id ? 1 : -1));
      setNewItemName('');
      setNewItemAmount('');
      setNewCategory('Other');
      setError('');
    } else {
      setError('Please enter a valid item name and amount.');
    }
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prevExpenses => prevExpenses.filter(expense => expense.id !== id));
  };
  
  const handleGetFinancialTip = useCallback(async () => {
      if (budget === null) return;
      setIsLoadingTip(true);
      setFinancialTip('');
      try {
          const tip = await getFinancialTip(budget, expenses);
          setFinancialTip(tip);
      } catch (e) {
          setFinancialTip("An error occurred while fetching your tip.");
      } finally {
          setIsLoadingTip(false);
      }
  }, [budget, expenses]);


  if (budget === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-center text-slate-800 dark:text-slate-100 mb-2">Welcome to Your Budget OS</h1>
          <p className="text-center text-slate-500 dark:text-slate-400 mb-6">Let's start by setting your total budget.</p>
          <form onSubmit={handleSetBudget}>
            <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 dark:text-slate-400">$</span>
                <input
                    type="number"
                    value={newItemAmount}
                    onChange={(e) => setNewItemAmount(e.target.value)}
                    placeholder="e.g., 1000"
                    className="w-full pl-7 pr-3 py-3 text-lg border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition dark:bg-slate-700 dark:text-white"
                    step="0.01"
                    min="0.01"
                    autoFocus
                />
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <button type="submit" className="w-full mt-6 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition transform hover:scale-105">
              Set Budget
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {showAlert && (
            <div className="mb-6 bg-amber-100 dark:bg-amber-900/50 border-l-4 border-amber-500 text-amber-800 dark:text-amber-200 p-4 rounded-lg shadow-md flex items-center justify-between" role="alert">
                <div className="flex items-center">
                    <WarningIcon className="h-6 w-6 mr-3 flex-shrink-0" />
                    <p className="text-sm">
                        <span className="font-bold">Heads up!</span> You've spent over {alertThreshold}% of your budget.
                    </p>
                </div>
                <button onClick={() => setIsAlertDismissed(true)} aria-label="Dismiss alert" className="ml-4 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        )}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-center text-slate-800 dark:text-slate-100">My Budget Overview</h1>
          <p className="text-center text-slate-500 dark:text-slate-400 mt-1">Your simple, personal finance dashboard.</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <SummaryCard title="Total Budget" amount={budget} colorClass="text-green-500 dark:text-green-400" />
          <SummaryCard title="Total Expenses" amount={totalExpenses} colorClass="text-red-500 dark:text-red-400" />
          <SummaryCard title="Remaining Balance" amount={remainingBalance} colorClass={remainingBalance >= 0 ? 'text-blue-500 dark:text-blue-400' : 'text-red-500 dark:text-red-400'} />
        </section>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Add New Expense</h2>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Expense Name (e.g., Groceries)"
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition dark:bg-slate-700 dark:text-white"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as ExpenseCategory)}
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition dark:bg-slate-700 dark:text-white"
              >
                <option>Groceries</option>
                <option>Transport</option>
                <option>Entertainment</option>
                <option>Bills</option>
                <option>Other</option>
              </select>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 dark:text-slate-400">$</span>
                <input
                    type="number"
                    value={newItemAmount}
                    onChange={(e) => setNewItemAmount(e.target.value)}
                    placeholder="Amount"
                    className="w-full pl-7 pr-3 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition dark:bg-slate-700 dark:text-white"
                    step="0.01"
                    min="0.01"
                />
              </div>
              {error && <p className="text-red-500 text-sm -mt-2">{error}</p>}
              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition transform hover:scale-105">
                Add Expense
              </button>
            </form>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Expense List</h2>
            {expenses.length > 0 ? (
              <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {expenses.map(expense => (
                  <ExpenseItem key={expense.id} expense={expense} onDelete={handleDeleteExpense} />
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 text-center py-8">No expenses added yet. Good job!</p>
            )}
          </div>
        </main>

        <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold mb-4">Budget Alert</h2>
                <label htmlFor="alert-threshold" className="block text-sm font-medium text-slate-600 dark:text-slate-400">
                    Notify me when spending exceeds: <span className="font-bold text-indigo-600 dark:text-indigo-400">{alertThreshold}%</span>
                </label>
                <input
                    id="alert-threshold"
                    type="range"
                    min="1"
                    max="100"
                    value={alertThreshold}
                    onChange={(e) => setAlertThreshold(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer mt-3 accent-indigo-600"
                    aria-label="Set budget alert threshold"
                />
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg text-center flex flex-col justify-center">
                 <h2 className="text-2xl font-semibold mb-4">AI Financial Tip</h2>
                 <button 
                    onClick={handleGetFinancialTip} 
                    disabled={isLoadingTip}
                    className="inline-flex items-center justify-center gap-2 bg-amber-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    {isLoadingTip ? <LoadingSpinner /> : <SparklesIcon className="h-5 w-5" />}
                    {isLoadingTip ? 'Thinking...' : 'Get a Tip'}
                 </button>
                 {financialTip && (
                    <div className="mt-4 p-4 bg-indigo-50 dark:bg-slate-700 rounded-lg">
                        <p className="text-indigo-800 dark:text-indigo-200 italic">"{financialTip}"</p>
                    </div>
                 )}
            </div>
        </section>

      </div>
    </div>
  );
};

export default App;
