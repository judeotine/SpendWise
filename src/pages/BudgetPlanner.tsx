
import { useEffect, useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Budget, Expense } from "@/lib/types";
import { getBudgets, saveBudget, deleteBudget, getExpenses } from "@/lib/storage";
import { Plus, PiggyBank } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCurrency } from "@/hooks/use-currency";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fadeInAnimation, slideInAnimation } from "@/lib/animations";
import { v4 as uuidv4 } from "uuid";

// Import our refactored budget components
import { BudgetList } from "@/components/budget/BudgetList";
import { EmptyBudgetState } from "@/components/budget/EmptyBudgetState";
import { BudgetForm } from "@/components/budget/BudgetForm";

const BudgetPlanner = () => {
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const { activeCurrency, convertAmount } = useCurrency();
  const [activeTab, setActiveTab] = useState("current");
  
  useEffect(() => {
    // Load budgets and expenses
    const loadedBudgets = getBudgets();
    const loadedExpenses = getExpenses();
    
    setBudgets(loadedBudgets);
    setExpenses(loadedExpenses);
  }, [activeCurrency]);
  
  const handleSaveBudget = (newBudget: Budget) => {
    // Make sure we have an ID
    if (!newBudget.id) {
      newBudget.id = uuidv4();
    }
    
    // Ensure the budget has the current currency if not specified
    if (!newBudget.currency) {
      newBudget.currency = activeCurrency;
    }
    
    saveBudget(newBudget);
    
    // Update state
    setBudgets(prev => {
      const existingIndex = prev.findIndex(b => b.id === newBudget.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newBudget;
        return updated;
      } else {
        return [...prev, newBudget];
      }
    });
    
    // Reset form
    setSelectedBudget(null);
    setShowBudgetDialog(false);
    
    toast({
      title: "Budget saved",
      description: `Your budget has been ${selectedBudget ? 'updated' : 'created'}`,
    });
  };
  
  const handleDeleteBudget = (id: string) => {
    deleteBudget(id);
    setBudgets(prev => prev.filter(b => b.id !== id));
    
    toast({
      title: "Budget deleted",
      description: "Your budget has been deleted",
    });
  };
  
  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setShowBudgetDialog(true);
  };
  
  // Calculate spending progress for each budget
  const getBudgetProgress = async (budget: Budget) => {
    const now = new Date();
    let startDate: Date;
    
    // Determine the start date based on the budget period
    if (budget.period === "daily") {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
    } else if (budget.period === "weekly") {
      startDate = new Date(now);
      const day = startDate.getDay();
      startDate.setDate(startDate.getDate() - day);
      startDate.setHours(0, 0, 0, 0);
    } else if (budget.period === "monthly") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      // yearly
      startDate = new Date(now.getFullYear(), 0, 1);
    }
    
    // Filter expenses by category and time period
    const relevantExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expense.category === budget.category && expenseDate >= startDate && expenseDate <= now;
    });
    
    // Calculate total spent in the current currency
    let spent = 0;
    for (const expense of relevantExpenses) {
      const expenseCurrency = expense.currency || activeCurrency;
      if (expenseCurrency === activeCurrency) {
        spent += expense.amount;
      } else {
        try {
          const convertedAmount = await convertAmount(expense.amount, expenseCurrency);
          spent += convertedAmount;
        } catch (error) {
          console.error("Error converting expense amount:", error);
          spent += expense.amount; // Fallback to original amount
        }
      }
    }
    
    // Convert budget amount to current currency if needed
    let budgetAmount = budget.amount;
    if (budget.currency && budget.currency !== activeCurrency) {
      try {
        budgetAmount = await convertAmount(budget.amount, budget.currency);
      } catch (error) {
        console.error("Error converting budget amount:", error);
      }
    }
    
    const percentage = (spent / budgetAmount) * 100;
    
    return {
      spent,
      budgetAmount,
      percentage: Math.min(percentage, 100), // Cap at 100% for the progress bar
      isOverBudget: percentage > 100,
    };
  };
  
  // Group budgets by their period for the tabs
  const groupBudgetsByPeriod = useMemo(() => {
    const currentDate = new Date();
    // Show all budgets
    return {
      current: budgets,
      all: budgets,
    };
  }, [budgets]);
  
  return (
    <div className="pb-6">
      <PageHeader 
        title={
          <div className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-primary" />
            Budget Planner
          </div>
        }
        rightContent={
          <Dialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" className="hover:bg-white/10">
                <Plus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="glassmorphism border border-white/20 max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {selectedBudget ? "Edit Budget" : "Create New Budget"}
                </DialogTitle>
              </DialogHeader>
              
              <BudgetForm 
                selectedBudget={selectedBudget}
                onSave={handleSaveBudget}
              />
            </DialogContent>
          </Dialog>
        }
      />
      
      <div className="px-4 pt-2 pb-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInAnimation}
          className="mb-4"
        >
          <Tabs 
            defaultValue="current" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full glassmorphism shadow-md border border-white/10 mb-2">
              <TabsTrigger value="current" className="data-[state=active]:text-primary data-[state=active]:shadow-md">Current Budgets</TabsTrigger>
              <TabsTrigger value="all" className="data-[state=active]:text-primary data-[state=active]:shadow-md">All Budgets</TabsTrigger>
            </TabsList>
            
            <TabsContent 
              value="current"
              className="mt-4"
              asChild
            >
              <motion.div
                key="current-budgets"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={slideInAnimation}
              >
                {groupBudgetsByPeriod.current.length > 0 ? (
                  <BudgetList 
                    budgets={groupBudgetsByPeriod.current} 
                    getBudgetProgress={getBudgetProgress}
                    onEdit={handleEditBudget}
                    onDelete={handleDeleteBudget}
                  />
                ) : (
                  <EmptyBudgetState onCreateClick={() => setShowBudgetDialog(true)} />
                )}
              </motion.div>
            </TabsContent>
            
            <TabsContent 
              value="all"
              className="mt-4"
              asChild
            >
              <motion.div
                key="all-budgets"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={slideInAnimation}
              >
                {groupBudgetsByPeriod.all.length > 0 ? (
                  <BudgetList 
                    budgets={groupBudgetsByPeriod.all} 
                    getBudgetProgress={getBudgetProgress}
                    onEdit={handleEditBudget}
                    onDelete={handleDeleteBudget}
                  />
                ) : (
                  <EmptyBudgetState onCreateClick={() => setShowBudgetDialog(true)} />
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default BudgetPlanner;
