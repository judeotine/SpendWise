
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Expense, ExpenseSummary, MonthlyTotal } from "@/lib/types";
import { formatCategoryName } from "@/lib/categories";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { motion } from "framer-motion";
import { useCurrency } from "@/hooks/use-currency";

const COLORS = [
  "#16a34a", "#2563eb", "#d946ef", "#f59e0b", 
  "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6",
  "#6366f1", "#f97316", "#84cc16", "#64748b"
];

interface SpendingTabProps {
  expenses: Expense[];
  selectedPeriod: string;
  setTotalSpent: (total: number) => void;
  setTopCategory: (category: string) => void;
  trendDescription: string | null;
}

export const SpendingTab = ({ 
  expenses, 
  selectedPeriod,
  setTotalSpent,
  setTopCategory,
  trendDescription
}: SpendingTabProps) => {
  const [categorySummary, setCategorySummary] = useState<ExpenseSummary[]>([]);
  const [monthlyTotals, setMonthlyTotals] = useState<MonthlyTotal[]>([]);
  const { activeCurrency, convertAmount } = useCurrency();
  
  // Process expense data based on the selected period
  useEffect(() => {
    const processExpenseData = async () => {
      if (expenses.length === 0) return;
      
      // Filter expenses based on the selected period
      const now = new Date();
      const filtered = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        
        if (selectedPeriod === "1month") {
          const oneMonthAgo = new Date(now);
          oneMonthAgo.setMonth(now.getMonth() - 1);
          return expenseDate >= oneMonthAgo;
        } else if (selectedPeriod === "3months") {
          const threeMonthsAgo = new Date(now);
          threeMonthsAgo.setMonth(now.getMonth() - 3);
          return expenseDate >= threeMonthsAgo;
        } else if (selectedPeriod === "6months") {
          const sixMonthsAgo = new Date(now);
          sixMonthsAgo.setMonth(now.getMonth() - 6);
          return expenseDate >= sixMonthsAgo;
        } else {
          const oneYearAgo = new Date(now);
          oneYearAgo.setFullYear(now.getFullYear() - 1);
          return expenseDate >= oneYearAgo;
        }
      });
      
      // Calculate category summary with currency conversion
      const categoryAmounts: Record<string, number> = {};
      const categoryCount: Record<string, number> = {};
      let totalAmount = 0;
      
      // Process each expense
      for (const expense of filtered) {
        if (!categoryAmounts[expense.category]) {
          categoryAmounts[expense.category] = 0;
          categoryCount[expense.category] = 0;
        }
        
        // Convert to active currency if needed
        let amount = expense.amount;
        if (expense.currency && expense.currency !== activeCurrency) {
          try {
            amount = await convertAmount(expense.amount, expense.currency);
          } catch (error) {
            console.error("Error converting amount:", error);
          }
        }
        
        categoryAmounts[expense.category] += amount;
        categoryCount[expense.category]++;
        totalAmount += amount;
      }
      
      // Update total spent in parent component
      setTotalSpent(totalAmount);
      
      // Create the category summary
      const summary: ExpenseSummary[] = Object.keys(categoryAmounts).map(category => ({
        category: category as any,
        totalAmount: categoryAmounts[category],
        percentage: (categoryAmounts[category] / totalAmount) * 100,
        count: categoryCount[category]
      }));
      
      // Sort by amount descending
      summary.sort((a, b) => b.totalAmount - a.totalAmount);
      
      // Set the top spending category
      if (summary.length > 0) {
        setTopCategory(formatCategoryName(summary[0].category));
      }
      
      setCategorySummary(summary);
      
      // Calculate monthly totals with currency conversion
      await calculateMonthlyTotals(expenses);
    };
    
    processExpenseData();
  }, [expenses, selectedPeriod, activeCurrency]);
  
  // Calculate monthly spending totals
  const calculateMonthlyTotals = async (expenses: Expense[]) => {
    if (expenses.length === 0) return;
    
    const now = new Date();
    const monthlyData: Record<string, number> = {};
    
    // Get last 6 months
    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(now);
      monthDate.setMonth(now.getMonth() - i);
      const monthKey = monthDate.toISOString().slice(0, 7); // YYYY-MM format
      monthlyData[monthKey] = 0;
    }
    
    // Add expense amounts with currency conversion
    for (const expense of expenses) {
      const expenseDate = new Date(expense.date);
      const monthKey = expenseDate.toISOString().slice(0, 7); // YYYY-MM format
      
      if (monthlyData[monthKey] !== undefined) {
        // Convert to active currency if needed
        let amount = expense.amount;
        if (expense.currency && expense.currency !== activeCurrency) {
          try {
            amount = await convertAmount(expense.amount, expense.currency);
          } catch (error) {
            console.error("Error converting amount:", error);
          }
        }
        
        monthlyData[monthKey] += amount;
      }
    }
    
    // Convert to array and format display names
    const monthlyArray = Object.entries(monthlyData).map(([month, total]) => {
      const date = new Date(month + "-01");
      const displayName = date.toLocaleString('default', { month: 'short' }) + ' ' + 
                          date.toISOString().slice(2, 4); // Short month + YY
      return {
        month: displayName,
        total
      };
    });
    
    // Sort by date (oldest to newest)
    monthlyArray.sort((a, b) => {
      const dateA = new Date(monthlyData[a.month]);
      const dateB = new Date(monthlyData[b.month]);
      return dateA.getTime() - dateB.getTime();
    });
    
    setMonthlyTotals(monthlyArray);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-4">
        <label className="text-sm font-medium mb-2 block">Time Period</label>
        <select
          className="w-full p-2 rounded-md border border-input bg-background"
          value={selectedPeriod}
          onChange={(e) => e.target.value} // This will be handled by parent component
        >
          <option value="1month">Last Month</option>
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="12months">Last Year</option>
        </select>
      </div>
      
      {categorySummary.length > 0 ? (
        <>
          <Card className="p-4 mb-6">
            <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySummary}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    innerRadius={40}
                    dataKey="totalAmount"
                    nameKey="category"
                  >
                    {categorySummary.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend
                    formatter={(value: string) => formatCategoryName(value as any)}
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-2 space-y-3">
              {categorySummary.slice(0, 3).map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CategoryIcon category={item.category} size="sm" className="mr-2" />
                    <div>
                      <div className="font-medium">{formatCategoryName(item.category)}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.count} {item.count === 1 ? 'expense' : 'expenses'} • {item.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <MoneyAmount amount={item.totalAmount} />
                </div>
              ))}
            </div>
          </Card>
        
          {monthlyTotals.length > 1 && (
            <Card className="p-4 mb-6">
              <h3 className="text-lg font-semibold mb-4">Monthly Spending</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTotals} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis 
                      tickFormatter={(value) => (value === 0) ? '0' : `${activeCurrency} ${Math.round(value)}`}
                      width={60}
                    />
                    <Tooltip 
                      formatter={(value) => [<MoneyAmount amount={Number(value)} />, 'Total']}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Bar 
                      dataKey="total" 
                      fill="#16a34a" 
                      radius={[4, 4, 0, 0]} 
                      barSize={40} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {trendDescription && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>{trendDescription}</p>
                </div>
              )}
            </Card>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p className="mb-2">No data for the selected period</p>
          <p className="text-sm">Add some expenses to see insights</p>
        </div>
      )}
    </motion.div>
  );
};
