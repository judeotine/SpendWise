
import { useState, useEffect } from "react";
import { Budget } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { formatCategoryName } from "@/lib/categories";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { motion } from "framer-motion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { memo } from "react";
import { useCurrency } from "@/hooks/use-currency";

interface BudgetListProps {
  budgets: Budget[];
  getBudgetProgress: (budget: Budget) => Promise<{
    spent: number;
    budgetAmount: number;
    percentage: number;
    isOverBudget: boolean;
  }>;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

export const BudgetList = memo(function BudgetList({ 
  budgets, 
  getBudgetProgress, 
  onEdit, 
  onDelete 
}: BudgetListProps) {
  const [budgetProgresses, setBudgetProgresses] = useState<Record<string, {
    spent: number;
    budgetAmount: number;
    percentage: number;
    isOverBudget: boolean;
    loading: boolean;
  }>>({});
  
  const { activeCurrency } = useCurrency();

  useEffect(() => {
    let isMounted = true;
    
    const fetchProgressData = async () => {
      const newProgressData: Record<string, any> = {};
      
      for (const budget of budgets) {
        if (!isMounted) return;
        
        newProgressData[budget.id] = { loading: true };
        setBudgetProgresses(prev => ({
          ...prev,
          [budget.id]: { ...prev[budget.id], loading: true }
        }));
        
        try {
          const progress = await getBudgetProgress(budget);
          
          if (!isMounted) return;
          
          newProgressData[budget.id] = { ...progress, loading: false };
          setBudgetProgresses(prev => ({
            ...prev,
            [budget.id]: { ...progress, loading: false }
          }));
        } catch (error) {
          console.error(`Error getting budget progress for ${budget.id}:`, error);
          
          if (!isMounted) return;
          
          newProgressData[budget.id] = { 
            spent: 0, 
            budgetAmount: budget.amount,
            percentage: 0, 
            isOverBudget: false,
            loading: false
          };
          
          setBudgetProgresses(prev => ({
            ...prev,
            [budget.id]: { 
              spent: 0, 
              budgetAmount: budget.amount,
              percentage: 0, 
              isOverBudget: false,
              loading: false
            }
          }));
        }
      }
    };
    
    fetchProgressData();
    
    return () => {
      isMounted = false;
    };
  }, [budgets, getBudgetProgress, activeCurrency]);

  if (budgets.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {budgets.map((budget, index) => {
        const progress = budgetProgresses[budget.id] || { 
          spent: 0, 
          budgetAmount: budget.amount,
          percentage: 0, 
          isOverBudget: false,
          loading: true
        };
        
        return (
          <motion.div
            key={budget.id}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: { delay: index * 0.1, duration: 0.3 }
              }
            }}
          >
            <Card key={budget.id} className="p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <CategoryIcon 
                    category={budget.category} 
                    className="mr-3"
                  />
                  <div>
                    <h3 className="font-medium">
                      {formatCategoryName(budget.category)}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} budget
                      {budget.currency && budget.currency !== activeCurrency && 
                        <span> • Original: {budget.currency}</span>}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit(budget)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Budget</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this budget? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onDelete(budget.id)}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              
              {progress.loading ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="animate-pulse bg-muted w-20 h-4 rounded"></span>
                    <span className="animate-pulse bg-muted w-24 h-4 rounded"></span>
                  </div>
                  <div className="h-2 bg-muted rounded"></div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-sm mb-1">
                    <span>
                      <MoneyAmount 
                        amount={progress.spent} 
                        originalCurrency={budget.currency} 
                      /> spent
                    </span>
                    <span>
                      Budget: <MoneyAmount 
                        amount={progress.budgetAmount}
                        originalCurrency={budget.currency}
                      />
                    </span>
                  </div>
                  
                  <Progress 
                    value={progress.percentage} 
                    className={progress.isOverBudget ? "bg-red-100" : ""}
                  />
                  
                  <div className="text-xs mt-1 text-right">
                    {progress.isOverBudget ? (
                      <span className="text-destructive font-medium">
                        Over budget by <MoneyAmount 
                          amount={progress.spent - progress.budgetAmount}
                          originalCurrency={budget.currency}
                        />
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        <MoneyAmount 
                          amount={progress.budgetAmount - progress.spent}
                          originalCurrency={budget.currency}
                        /> remaining
                      </span>
                    )}
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
});
