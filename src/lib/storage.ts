import { Budget, Expense, Insight, Category } from "./types";
import { toast } from "@/components/ui/use-toast";
import { getActiveCurrency, convertCurrency } from "./currency";

// LocalStorage keys
const EXPENSES_KEY = "spendwise-expenses";
const BUDGETS_KEY = "spendwise-budgets";
const INSIGHTS_KEY = "spendwise-insights";
const NOTIFICATIONS_KEY = "spendwise-notifications";

// Expenses
export const getExpenses = (): Expense[] => {
  const expenses = localStorage.getItem(EXPENSES_KEY);
  return expenses ? JSON.parse(expenses) : [];
};

// Get recent expenses, limited by count
export const getRecentExpenses = (count: number = 5): Expense[] => {
  const expenses = getExpenses();
  // Sort by date, most recent first
  return expenses
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
};

// Get total spent by category
export const getCategoriesTotalSpent = async (): Promise<Array<{
  category: Category;
  amount: number;
  percentage: number;
}>> => {
  const expenses = getExpenses();
  const activeCurrency = getActiveCurrency();
  
  if (expenses.length === 0) {
    return [];
  }
  
  // Group expenses by category and calculate totals
  const categoryTotals: Record<string, number> = {};
  
  // First pass to add up amounts for each category
  for (const expense of expenses) {
    if (!categoryTotals[expense.category]) {
      categoryTotals[expense.category] = 0;
    }
    
    // Convert to active currency if needed
    let amount = expense.amount;
    if (expense.currency && expense.currency !== activeCurrency) {
      try {
        amount = await convertCurrency(amount, expense.currency, activeCurrency);
      } catch (error) {
        console.error("Error converting amount:", error);
      }
    }
    
    categoryTotals[expense.category] += amount;
  }
  
  // Calculate total amount spent across all categories
  const totalSpent = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
  
  // Create the final result array with percentages
  const result = Object.entries(categoryTotals).map(([category, amount]) => ({
    category: category as Category,
    amount,
    percentage: (amount / totalSpent) * 100
  }));
  
  // Sort by amount (descending)
  return result.sort((a, b) => b.amount - a.amount);
};

export const saveExpense = (expense: Expense): void => {
  const expenses = getExpenses();
  expenses.push(expense);
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  
  // Check if this expense exceeds any budget
  checkBudgetLimits(expense);
};

export const updateExpense = (updatedExpense: Expense): void => {
  const expenses = getExpenses();
  const index = expenses.findIndex((exp) => exp.id === updatedExpense.id);
  if (index !== -1) {
    expenses[index] = updatedExpense;
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
    
    // Check if the updated expense exceeds any budget
    checkBudgetLimits(updatedExpense);
  }
};

export const deleteExpense = (id: string): void => {
  const expenses = getExpenses();
  const filtered = expenses.filter((exp) => exp.id !== id);
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(filtered));
};

// Helper to check if an expense pushes any category over budget
const checkBudgetLimits = async (expense: Expense): Promise<void> => {
  const budgets = getBudgets();
  const expenses = getExpenses();
  const now = new Date();
  const activeCurrency = getActiveCurrency();
  
  // Find relevant budget for this expense
  const categoryBudget = budgets.find(b => b.category === expense.category);
  if (!categoryBudget) return;
  
  // Determine time period to check
  let periodStart: Date;
  switch (categoryBudget.period) {
    case "daily":
      periodStart = new Date(now.setHours(0, 0, 0, 0));
      break;
    case "weekly":
      const day = now.getDay();
      periodStart = new Date(now);
      periodStart.setDate(now.getDate() - day);
      periodStart.setHours(0, 0, 0, 0);
      break;
    case "yearly":
      periodStart = new Date(now.getFullYear(), 0, 1);
      break;
    case "monthly":
    default:
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  
  // Calculate total spent in this category during this period
  let totalSpent = 0;
  
  for (const exp of expenses.filter(e => 
    e.category === expense.category && 
    new Date(e.date) >= periodStart
  )) {
    // Convert to active currency if needed
    let amount = exp.amount;
    if (exp.currency && exp.currency !== activeCurrency) {
      try {
        amount = await convertCurrency(exp.amount, exp.currency, activeCurrency);
      } catch (error) {
        console.error("Error converting amount:", error);
      }
    }
    totalSpent += amount;
  }
  
  // Convert budget to active currency if needed
  let budgetAmount = categoryBudget.amount;
  if (categoryBudget.currency && categoryBudget.currency !== activeCurrency) {
    try {
      budgetAmount = await convertCurrency(budgetAmount, categoryBudget.currency, activeCurrency);
    } catch (error) {
      console.error("Error converting budget amount:", error);
    }
  }
  
  // If over budget, notify the user
  if (totalSpent > budgetAmount) {
    const overage = totalSpent - budgetAmount;
    const title = `Budget Alert: ${expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}`;
    const description = `You've exceeded your ${categoryBudget.period} budget by ${activeCurrency} ${overage.toFixed(2)}`;
    
    // Show a toast notification
    toast({
      title,
      description,
      variant: "destructive",
    });
    
    // Store the notification for history
    addNotification({
      id: Date.now().toString(),
      title,
      message: description,
      date: new Date().toISOString(),
      category: expense.category,
      read: false
    });
    
    // Try to show a system notification if permissions are granted
    if ("Notification" in window) {
      try {
        if (Notification.permission === "granted") {
          new Notification(title, {
            body: description,
            icon: "/favicon.ico"
          });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then(permission => {
            if (permission === "granted") {
              new Notification(title, {
                body: description,
                icon: "/favicon.ico"
              });
            }
          });
        }
      } catch (error) {
        console.error("Error showing system notification:", error);
      }
    }
  }
};

// Budgets
export const getBudgets = (): Budget[] => {
  const budgets = localStorage.getItem(BUDGETS_KEY);
  const parsedBudgets = budgets ? JSON.parse(budgets) : [];
  
  // Ensure backward compatibility for budgets without currency field
  return parsedBudgets.map((budget: Budget) => {
    if (!budget.currency) {
      return {
        ...budget,
        currency: 'USD' // Default to USD for older budgets
      };
    }
    return budget;
  });
};

export const saveBudget = (budget: Budget): void => {
  const budgets = getBudgets();
  const existingIndex = budgets.findIndex(b => b.id === budget.id);
  
  // Make sure currency is always set
  if (!budget.currency) {
    budget.currency = getActiveCurrency();
  }
  
  if (existingIndex !== -1) {
    // Update existing budget
    budgets[existingIndex] = budget;
  } else {
    // Add new budget
    budgets.push(budget);
  }
  
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
};

export const updateBudget = (updatedBudget: Budget): void => {
  saveBudget(updatedBudget); // Reuse the saveBudget function which handles updates
};

export const deleteBudget = (id: string): void => {
  const budgets = getBudgets();
  const filtered = budgets.filter((b) => b.id !== id);
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(filtered));
};

// Insights
export const getInsights = (): Insight[] => {
  const insights = localStorage.getItem(INSIGHTS_KEY);
  return insights ? JSON.parse(insights) : [];
};

export const saveInsight = (insight: Insight): void => {
  const insights = getInsights();
  insights.push(insight);
  localStorage.setItem(INSIGHTS_KEY, JSON.stringify(insights));
};

export const markInsightAsRead = (id: string): void => {
  const insights = getInsights();
  const index = insights.findIndex((i) => i.id === id);
  if (index !== -1) {
    insights[index].read = true;
    localStorage.setItem(INSIGHTS_KEY, JSON.stringify(insights));
  }
};

// Notifications
interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  category?: string;
  read: boolean;
}

export const getNotifications = (): Notification[] => {
  const notifications = localStorage.getItem(NOTIFICATIONS_KEY);
  return notifications ? JSON.parse(notifications) : [];
};

export const addNotification = (notification: Notification): void => {
  const notifications = getNotifications();
  notifications.push(notification);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
};

export const markNotificationAsRead = (id: string): void => {
  const notifications = getNotifications();
  const index = notifications.findIndex(n => n.id === id);
  if (index !== -1) {
    notifications[index].read = true;
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }
};

export const clearNotifications = (): void => {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]));
};

// Storage usage statistics
export const getStorageUsage = (): { used: number, total: number, items: Record<string, number> } => {
  // Calculate used storage
  const keys = [EXPENSES_KEY, BUDGETS_KEY, INSIGHTS_KEY, NOTIFICATIONS_KEY];
  let totalSize = 0;
  const itemSizes: Record<string, number> = {};
  
  for (const key of keys) {
    const item = localStorage.getItem(key);
    if (item) {
      const size = new Blob([item]).size;
      totalSize += size;
      itemSizes[key] = size;
    } else {
      itemSizes[key] = 0;
    }
  }
  
  // Estimate total available storage (5MB is typical for localStorage)
  const totalAvailable = 5 * 1024 * 1024;
  
  return {
    used: totalSize,
    total: totalAvailable,
    items: itemSizes
  };
};
