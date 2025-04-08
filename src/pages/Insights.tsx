
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getExpenses, getInsights, markInsightAsRead, getBudgets } from "@/lib/storage";
import { AlertTriangle } from "lucide-react";
import { Expense, ExpenseSummary, Insight, MonthlyTotal, Budget } from "@/lib/types";
import { generateInsights, analyzeSpendingTrends } from "@/lib/ai-insights";
import { useCurrency } from "@/hooks/use-currency";
import { motion, AnimatePresence } from "framer-motion";

// Import refactored components
import { SummaryCard } from "@/components/insights/SummaryCard";
import { InsightCard } from "@/components/insights/InsightCard";
import { SpendingTab } from "@/components/insights/SpendingTab";
import { TrendsTab } from "@/components/insights/TrendsTab";
import { StorageUsageTab } from "@/components/insights/StorageUsageTab";

const Insights = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [categorySummary, setCategorySummary] = useState<ExpenseSummary[]>([]);
  const [monthlyTotals, setMonthlyTotals] = useState<MonthlyTotal[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("1month");
  const [trendDescription, setTrendDescription] = useState<string | null>(null);
  const [totalSpent, setTotalSpent] = useState(0);
  const [topCategory, setTopCategory] = useState<string>("");
  const [spendingChange, setSpendingChange] = useState<{percentage: number, increased: boolean}>({
    percentage: 0,
    increased: false
  });
  const [budgetProgress, setBudgetProgress] = useState<{used: number, total: number}>({
    used: 0,
    total: 0
  });
  
  const { activeCurrency, convertAmount } = useCurrency();
  
  // Load all data on component mount
  useEffect(() => {
    const loadData = async () => {
      // Load data
      const loadedExpenses = getExpenses();
      const loadedInsights = getInsights();
      const loadedBudgets = getBudgets();
      
      setExpenses(loadedExpenses);
      setBudgets(loadedBudgets);
      
      // Generate new insights if needed and combine with existing
      const newInsights = generateInsights();
      
      // Sort insights by date (newest first) and mark as read
      const allInsights = [...newInsights, ...loadedInsights]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setInsights(allInsights);
      
      // Mark all insights as read
      allInsights.forEach(insight => {
        if (!insight.read) {
          markInsightAsRead(insight.id);
        }
      });
      
      // Process the trend data
      const trendData = analyzeSpendingTrends();
      if (trendData) {
        const { trend } = trendData;
        
        if (trend.isIncreasing) {
          setTrendDescription(`Your spending is trending upward by approximately ${trend.percentChange.toFixed(1)}% per month.`);
          setSpendingChange({
            percentage: Number(trend.percentChange.toFixed(1)),
            increased: true
          });
        } else {
          setTrendDescription(`Your spending is trending downward by approximately ${Math.abs(trend.percentChange).toFixed(1)}% per month.`);
          setSpendingChange({
            percentage: Number(Math.abs(trend.percentChange).toFixed(1)),
            increased: false
          });
        }
      }
      
      // Calculate budget usage
      calculateBudgetProgress(loadedExpenses, loadedBudgets);
    };
    
    loadData();
  }, []);
  
  // Calculate budget progress
  const calculateBudgetProgress = async (expenses: Expense[], budgets: Budget[]) => {
    if (!budgets.length) return;
    
    let totalBudgetAmount = 0;
    let totalUsed = 0;
    
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Consider only monthly budgets for the summary
    const monthlyBudgets = budgets.filter(b => b.period === "monthly");
    
    for (const budget of monthlyBudgets) {
      // Convert budget amount to active currency
      let budgetAmount = budget.amount;
      if (budget.currency !== activeCurrency) {
        try {
          budgetAmount = await convertAmount(budget.amount, budget.currency);
        } catch (error) {
          console.error("Error converting budget amount:", error);
        }
      }
      
      totalBudgetAmount += budgetAmount;
      
      // Find expenses for this category this month
      const categoryExpenses = expenses.filter(e => {
        return e.category === budget.category && 
               new Date(e.date) >= startOfCurrentMonth;
      });
      
      // Sum expenses
      for (const expense of categoryExpenses) {
        let amount = expense.amount;
        if (expense.currency && expense.currency !== activeCurrency) {
          try {
            amount = await convertAmount(amount, expense.currency);
          } catch (error) {
            console.error("Error converting expense amount:", error);
          }
        }
        totalUsed += amount;
      }
    }
    
    setBudgetProgress({
      used: totalUsed,
      total: totalBudgetAmount
    });
  };
  
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
      
      // Create the category summary
      const summary: ExpenseSummary[] = Object.keys(categoryAmounts).map(category => ({
        category: category as any,
        totalAmount: categoryAmounts[category],
        percentage: (categoryAmounts[category] / totalAmount) * 100,
        count: categoryCount[category]
      }));
      
      // Sort by amount descending
      summary.sort((a, b) => b.totalAmount - a.totalAmount);
      
      setCategorySummary(summary);
      
      // Calculate monthly totals with currency conversion
      calculateMonthlyTotals(expenses);
    };
    
    processExpenseData();
  }, [expenses, selectedPeriod, activeCurrency]);
  
  // Calculate monthly spending totals
  const calculateMonthlyTotals = async (expenses: Expense[]) => {
    if (expenses.length === 0) return;
    
    const now = new Date();
    const monthlyData: Record<string, number> = {};
    
    // Initialize the last 6 months
    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = format(monthDate, "yyyy-MM");
      monthlyData[monthKey] = 0;
    }
    
    // Add expense amounts with currency conversion
    for (const expense of expenses) {
      const expenseDate = new Date(expense.date);
      const monthKey = format(expenseDate, "yyyy-MM");
      
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
    
    // Convert to array and sort by date
    const monthlyArray = Object.entries(monthlyData).map(([month, total]) => ({
      month: format(new Date(month + "-01"), "MMM yy"),
      total
    }));
    
    monthlyArray.sort((a, b) => {
      return new Date(a.month).getTime() - new Date(b.month).getTime();
    });
    
    setMonthlyTotals(monthlyArray);
  };
  
  // Helper function to format dates
  const format = (date: Date, formatString: string): string => {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    if (formatString === "yyyy-MM") {
      return `${year}-${month}`;
    }
    
    if (formatString === "MMM yy") {
      const shortMonth = date.toLocaleString('default', { month: 'short' });
      return `${shortMonth} ${year.substr(2)}`;
    }
    
    return `${year}-${month}-${day}`;
  };
  
  return (
    <div className="pb-6">
      <PageHeader title="Insights" className="mb-4" />
      
      <SummaryCard 
        totalSpent={totalSpent} 
        topCategory={topCategory} 
        spendingChange={spendingChange}
        budgetProgress={budgetProgress}
      />
      
      <Tabs defaultValue="spending" className="w-full">
        <div className="px-4">
          <TabsList className="w-full">
            <TabsTrigger value="spending" className="flex-1">Spending</TabsTrigger>
            <TabsTrigger value="ai" className="flex-1">AI Insights</TabsTrigger>
            <TabsTrigger value="trends" className="flex-1">Trends</TabsTrigger>
            <TabsTrigger value="storage" className="flex-1">Storage</TabsTrigger>
          </TabsList>
        </div>
        
        <AnimatePresence mode="wait">
          <TabsContent value="spending" className="mt-4 px-4">
            <SpendingTab 
              expenses={expenses}
              selectedPeriod={selectedPeriod}
              setTotalSpent={setTotalSpent}
              setTopCategory={setTopCategory}
              trendDescription={trendDescription}
            />
          </TabsContent>
          
          <TabsContent value="ai" className="mt-4 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {insights.length > 0 ? (
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <InsightCard 
                      key={insight.id} 
                      insight={insight} 
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="mb-2">No AI insights available yet</p>
                  <p className="text-sm">Add more expenses to generate insights</p>
                </div>
              )}
            </motion.div>
          </TabsContent>
          
          <TabsContent value="trends" className="mt-4 px-4">
            <TrendsTab 
              monthlyTotals={monthlyTotals}
              categorySummary={categorySummary}
              trendDescription={trendDescription}
            />
          </TabsContent>
          
          <TabsContent value="storage" className="mt-4 px-4">
            <StorageUsageTab />
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
};

export default Insights;
