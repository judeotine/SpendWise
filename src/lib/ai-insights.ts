
import { Expense, Category, Insight } from "./types";
import { getExpenses } from "./storage";
import { v4 as uuidv4 } from 'uuid';

// Helper to group expenses by category
const groupByCategory = (expenses: Expense[]) => {
  const grouped: Record<Category, Expense[]> = {} as Record<Category, Expense[]>;
  
  expenses.forEach(expense => {
    if (!grouped[expense.category]) {
      grouped[expense.category] = [];
    }
    grouped[expense.category].push(expense);
  });
  
  return grouped;
};

// Helper to get the total for a category
const getCategoryTotal = (expenses: Expense[], category: Category) => {
  return expenses
    .filter(e => e.category === category)
    .reduce((sum, e) => sum + e.amount, 0);
};

// Helper to group expenses by month
const groupByMonth = (expenses: Expense[]) => {
  const grouped: Record<string, Expense[]> = {};
  
  expenses.forEach(expense => {
    const date = new Date(expense.date);
    const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (!grouped[monthYear]) {
      grouped[monthYear] = [];
    }
    grouped[monthYear].push(expense);
  });
  
  return grouped;
};

// Generate insights based on spending patterns
export const generateInsights = (): Insight[] => {
  const allExpenses = getExpenses();
  if (allExpenses.length < 5) {
    return [];
  }
  
  const insights: Insight[] = [];
  const now = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(now.getMonth() - 1);
  
  // Get current month and previous month expenses
  const currentMonthExpenses = allExpenses.filter(
    e => new Date(e.date) >= oneMonthAgo
  );
  const previousMonthExpenses = allExpenses.filter(
    e => new Date(e.date) < oneMonthAgo && 
       new Date(e.date) >= new Date(oneMonthAgo.getFullYear(), oneMonthAgo.getMonth() - 1)
  );
  
  // Group by category
  const currentByCategory = groupByCategory(currentMonthExpenses);
  
  // Check for categories with significant increases
  Object.entries(currentByCategory).forEach(([category, expenses]) => {
    const currentTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
    const prevTotal = getCategoryTotal(previousMonthExpenses, category as Category);
    
    if (prevTotal > 0 && currentTotal > prevTotal * 1.5 && currentTotal > 50) {
      insights.push({
        id: uuidv4(),
        title: 'Spending Increase Detected',
        description: `Your ${category} spending is ${Math.round((currentTotal / prevTotal - 1) * 100)}% higher than last month.`,
        type: 'warning',
        date: new Date().toISOString(),
        read: false,
        relatedCategory: category as Category
      });
    }
  });
  
  // Check for unusual single expenses (significantly higher than average for category)
  currentMonthExpenses.forEach(expense => {
    const categoryExpenses = currentByCategory[expense.category] || [];
    const avgAmount = categoryExpenses.reduce((sum, e) => sum + e.amount, 0) / categoryExpenses.length;
    
    if (expense.amount > avgAmount * 2 && expense.amount > 30) {
      insights.push({
        id: uuidv4(),
        title: 'Unusual Expense Detected',
        description: `Your ${expense.description} expense of $${expense.amount.toFixed(2)} is much higher than your average ${expense.category} expense.`,
        type: 'info',
        date: new Date().toISOString(),
        read: false,
        relatedCategory: expense.category
      });
    }
  });
  
  // Add money-saving suggestion
  if (insights.length === 0 && Math.random() > 0.7) {
    const categories = Object.keys(currentByCategory);
    if (categories.length > 0) {
      const randomCategory = categories[Math.floor(Math.random() * categories.length)] as Category;
      insights.push({
        id: uuidv4(),
        title: 'Money-Saving Tip',
        description: `Consider setting a budget for ${randomCategory} to better track and control your spending.`,
        type: 'info',
        date: new Date().toISOString(),
        read: false,
        relatedCategory: randomCategory
      });
    }
  }
  
  return insights;
};

// Generate a predicted budget based on past expenses
export const predictBudget = (category: Category): number => {
  const allExpenses = getExpenses();
  const categoryExpenses = allExpenses.filter(e => e.category === category);
  
  if (categoryExpenses.length < 3) {
    return 0;
  }
  
  const monthlySums: Record<string, number> = {};
  categoryExpenses.forEach(expense => {
    const date = new Date(expense.date);
    const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (!monthlySums[monthYear]) {
      monthlySums[monthYear] = 0;
    }
    monthlySums[monthYear] += expense.amount;
  });
  
  // Calculate average monthly spending
  const monthlyValues = Object.values(monthlySums);
  const avgMonthlySpending = monthlyValues.reduce((sum, val) => sum + val, 0) / monthlyValues.length;
  
  // Add a small random factor to simulate an AI prediction
  const predictionFactor = 0.9 + Math.random() * 0.3; // Between 0.9 and 1.2
  return Math.round(avgMonthlySpending * predictionFactor * 100) / 100;
};

// Analyze spending trends to identify patterns
export const analyzeSpendingTrends = () => {
  const allExpenses = getExpenses();
  if (allExpenses.length < 10) {
    return null;
  }
  
  const byMonth = groupByMonth(allExpenses);
  const monthlyTotals = Object.entries(byMonth).map(([month, expenses]) => ({
    month,
    total: expenses.reduce((sum, e) => sum + e.amount, 0)
  }));
  
  // Sort by month
  monthlyTotals.sort((a, b) => a.month.localeCompare(b.month));
  
  // Calculate trend (simple linear regression)
  const n = monthlyTotals.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = monthlyTotals.map(m => m.total);
  
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  
  // Return trend information
  return {
    monthlyTotals,
    trend: {
      slope,
      isIncreasing: slope > 0,
      percentChange: Math.abs(slope) / (sumY / n) * 100
    }
  };
};
