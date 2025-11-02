
import React from 'react';

interface SummaryCardProps {
  title: string;
  amount: number;
  colorClass: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, colorClass }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md flex-1 text-center">
      <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</h2>
      <p className={`text-3xl font-bold mt-2 ${colorClass}`}>
        ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  );
};

export default SummaryCard;
