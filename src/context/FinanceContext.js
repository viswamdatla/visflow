import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getData, storeData } from '../services/storage';

export const CATEGORIES = [
  'Food & Dining', 'Transport', 'Shopping', 'Bills & Utilities', 
  'Health', 'Entertainment', 'Investment', 'Salary', 
  'Freelance', 'Trading P&L', 'Other'
];

const DEFAULT_BUDGET_LIMITS = {
  'SHOPPING': 5000,
  'FOOD & DINING': 2000,
  'TRANSPORT': 300,
  'ENTERTAINMENT': 400,
  'BILLS & UTILITIES': 1500,
  'HEALTH': 1000,
  'INVESTMENT': 5000,
  'OTHER': 100
};

const CATEGORY_COLORS = {
  'SHOPPING': '#5e614d',
  'FOOD & DINING': '#5e614d',
  'TRANSPORT': '#c88a73',
  'ENTERTAINMENT': '#5e614d',
  'BILLS & UTILITIES': '#5e614d',
  'HEALTH': '#5e614d',
  'INVESTMENT': '#5e614d',
  'OTHER': '#ccc'
};

const INITIAL_FINANCE_DATA = {
  balance: 45000,
  accountType: 'Savings Account',
  totalIncome: 120000,
  totalExpenses: 75000,
  budgetLimits: DEFAULT_BUDGET_LIMITS,
  budgets: [],
  transactions: [
    { id: '1', vendor: 'Amazon.in', category: 'SHOPPING', time: '10:45 AM', date: '25-03-2026', amount: -2499, status: 'CONFIRMED', icon: 'shopping-bag', isIncome: false },
    { id: '2', vendor: 'Swiggy', category: 'FOOD & DINING', time: '01:20 PM', date: '24-03-2026', amount: -450, status: 'PENDING', icon: 'restaurant', isIncome: false },
    { id: '3', vendor: 'Monthly Salary', category: 'SALARY', time: '09:00 AM', date: '23-03-2026', amount: 85000, status: 'CONFIRMED', icon: 'account-balance', isIncome: true },
    { id: '4', vendor: 'Netflix India', category: 'ENTERTAINMENT', time: '11:00 PM', date: '22-03-2026', amount: -649, status: 'CONFIRMED', icon: 'play-circle-outline', isIncome: false },
  ]
};

export const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
  const [data, setData] = useState(INITIAL_FINANCE_DATA);
  const [loading, setLoading] = useState(true);

  const parseDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return new Date(0);
    const parts = dateStr.split('-');
    if (parts.length !== 3) return new Date(0);
    const [day, month, year] = parts.map(Number);
    return new Date(year, month - 1, day);
  };

  const recalculateData = (transactions, existingData) => {
    const sortedTransactions = [...transactions].sort((a, b) => {
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateB - dateA;
      }
      const idA = parseInt(a.id.replace(/\D/g, '')) || 0;
      const idB = parseInt(b.id.replace(/\D/g, '')) || 0;
      return idB - idA;
    });

    let totalIncome = 0;
    let totalExpenses = 0;
    let balance = 0;
    
    const categorySpending = {};

    sortedTransactions.forEach(t => {
      const amt = parseFloat(t.amount) || 0;
      const isInc = t.isIncome !== undefined ? t.isIncome : amt > 0;
      
      if (isInc) {
        totalIncome += Math.abs(amt);
      } else {
        const absAmt = Math.abs(amt);
        totalExpenses += absAmt;
        const cat = (t.category || 'OTHER').toUpperCase();
        categorySpending[cat] = (categorySpending[cat] || 0) + absAmt;
      }
      balance += amt;
    });

    const budgetLimits = existingData.budgetLimits || DEFAULT_BUDGET_LIMITS;

    const dynamicBudgets = Object.keys(categorySpending)
      .filter(cat => categorySpending[cat] > 0)
      .map((cat, index) => {
        const spent = categorySpending[cat];
        const total = budgetLimits[cat] || 0;
        const color = CATEGORY_COLORS[cat] || '#5e614d';
        
        let label = 'NO TARGET SET';
        if (total > 0) {
          const percent = Math.round((spent / total) * 100);
          label = `${percent}% OF MONTHLY BUDGET USED`;
        }

        const titleCaseCategory = CATEGORIES.find(c => c.toUpperCase() === cat) || cat;

        return {
          id: `budget-${cat}-${index}`,
          category: titleCaseCategory,
          spent,
          total,
          label,
          color: color
        };
      });
    
    return {
      ...existingData,
      budgetLimits,
      transactions: sortedTransactions,
      balance,
      totalIncome,
      totalExpenses,
      budgets: dynamicBudgets
    };
  };

  const loadFinanceData = useCallback(async () => {
    setLoading(true);
    const savedData = await getData('finance');
    if (savedData && savedData.transactions) {
      const validatedData = recalculateData(savedData.transactions, savedData);
      setData(validatedData);
    } else {
      const initialCalculated = recalculateData(INITIAL_FINANCE_DATA.transactions, INITIAL_FINANCE_DATA);
      await storeData('finance', initialCalculated);
      setData(initialCalculated);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFinanceData();
  }, [loadFinanceData]);

  const addTransaction = async (transaction) => {
    setData(prevData => {
      const amountNum = parseFloat(transaction.amount) || 0;
      const isInc = !!transaction.isIncome;
      
      const newTransaction = {
        id: Date.now().toString(),
        date: transaction.date || new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
        ...transaction,
        amount: isInc ? Math.abs(amountNum) : -Math.abs(amountNum),
        isIncome: isInc,
        time: transaction.time || 'JUST NOW'
      };
      
      const updatedTransactions = [newTransaction, ...prevData.transactions];
      const updatedData = recalculateData(updatedTransactions, prevData);
      
      storeData('finance', updatedData);
      return updatedData;
    });
  };

  const deleteTransaction = async (id) => {
    setData(prevData => {
      const updatedTransactions = prevData.transactions.filter(t => t.id !== id);
      const updatedData = recalculateData(updatedTransactions, prevData);
      
      storeData('finance', updatedData);
      return updatedData;
    });
  };

  const updateTransaction = async (id, updatedFields) => {
    setData(prevData => {
      const transactionIndex = prevData.transactions.findIndex(t => t.id === id);
      if (transactionIndex === -1) return prevData;

      const oldTransaction = prevData.transactions[transactionIndex];
      const newTransaction = { ...oldTransaction, ...updatedFields };

      const amountNum = parseFloat(newTransaction.amount) || 0;
      newTransaction.amount = newTransaction.isIncome ? Math.abs(amountNum) : -Math.abs(amountNum);

      const updatedTransactions = [...prevData.transactions];
      updatedTransactions[transactionIndex] = newTransaction;

      const updatedData = recalculateData(updatedTransactions, prevData);
      
      storeData('finance', updatedData);
      return updatedData;
    });
  };

  const updateBudgetLimit = async (category, newLimit) => {
    setData(prevData => {
      const updatedLimits = {
        ...prevData.budgetLimits,
        [category.toUpperCase()]: parseFloat(newLimit) || 0
      };
      
      const updatedData = recalculateData(prevData.transactions, {
        ...prevData,
        budgetLimits: updatedLimits
      });
      
      storeData('finance', updatedData);
      return updatedData;
    });
  };

  return (
    <FinanceContext.Provider value={{ 
      ...data, 
      loading, 
      addTransaction, 
      deleteTransaction, 
      updateTransaction,
      updateBudgetLimit,
      refreshData: loadFinanceData 
    }}>
      {children}
    </FinanceContext.Provider>
  );
};
