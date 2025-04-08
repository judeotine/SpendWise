
import { Expense } from "@/lib/types";
import { ExpenseItem } from "./ExpenseItem";
import { format, isSameDay } from "date-fns";
import { useCurrency } from "@/hooks/use-currency";
import { useEffect, useState, memo } from "react";
import { MoneyAmount } from "../ui/MoneyAmount";

type DayGroup = {
  date: string;
  expenses: Expense[];
};

type ExpenseListProps = {
  expenses: Expense[];
  onExpenseClick?: (expense: Expense) => void;
  className?: string;
};

export const ExpenseList = memo(function ExpenseList({ 
  expenses, 
  onExpenseClick,
  className
}: ExpenseListProps) {
  const { convertAmount, activeCurrency } = useCurrency();
  const [dailyTotals, setDailyTotals] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const calculateDailyTotals = async () => {
      if (expenses.length === 0) {
        if (isMounted) {
          setDailyTotals({});
          setIsLoading(false);
        }
        return;
      }
      
      const totals: Record<string, number> = {};
      
      // Group expenses by date
      const groupedByDay: Record<string, Expense[]> = {};
      
      expenses.forEach(expense => {
        const dateKey = new Date(expense.date).toISOString().split('T')[0];
        if (!groupedByDay[dateKey]) {
          groupedByDay[dateKey] = [];
        }
        groupedByDay[dateKey].push(expense);
      });
      
      // Calculate converted totals for each day
      for (const [date, dayExpenses] of Object.entries(groupedByDay)) {
        let dayTotal = 0;
        
        for (const expense of dayExpenses) {
          const expCurrency = expense.currency || 'USD';
          
          if (expCurrency === activeCurrency) {
            dayTotal += expense.amount;
          } else {
            try {
              const convertedAmount = await convertAmount(expense.amount, expCurrency);
              dayTotal += convertedAmount;
            } catch (error) {
              console.error(`Error converting amount for expense ${expense.id}:`, error);
              dayTotal += expense.amount; // Fallback
            }
          }
        }
        
        totals[date] = dayTotal;
      }
      
      if (isMounted) {
        setDailyTotals(totals);
        setIsLoading(false);
      }
    };
    
    setIsLoading(true);
    calculateDailyTotals();
    
    return () => {
      isMounted = false;
    };
  }, [expenses, activeCurrency, convertAmount]);

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No expenses found
      </div>
    );
  }

  // Group expenses by day
  const groupedByDay: DayGroup[] = [];
  
  // Sort expenses by date (newest first)
  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  sortedExpenses.forEach(expense => {
    const expenseDate = new Date(expense.date);
    
    // Find if we already have a group for this day
    const existingGroup = groupedByDay.find(group => 
      isSameDay(new Date(group.date), expenseDate)
    );
    
    if (existingGroup) {
      existingGroup.expenses.push(expense);
    } else {
      groupedByDay.push({
        date: expense.date,
        expenses: [expense]
      });
    }
  });

  return (
    <div className={className}>
      {groupedByDay.map((group) => {
        const dateKey = new Date(group.date).toISOString().split('T')[0];
        const total = dailyTotals[dateKey] || 0;
        
        return (
          <div key={group.date} className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                {format(new Date(group.date), 'EEEE, MMMM d, yyyy')}
              </h3>
              <span className="text-sm font-medium">
                {isLoading ? (
                  <span className="inline-block w-20 h-4 bg-muted animate-pulse rounded"></span>
                ) : (
                  <MoneyAmount amount={total} />
                )}
              </span>
            </div>
            
            <div className="space-y-2">
              {group.expenses.map(expense => (
                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  onClick={() => onExpenseClick?.(expense)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
});
