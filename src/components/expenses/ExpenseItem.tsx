
import { Expense } from "@/lib/types";
import { MoneyAmount } from "../ui/MoneyAmount";
import { CategoryIcon } from "../ui/CategoryIcon";
import { formatCategoryName } from "@/lib/categories";
import { format } from "date-fns";
import { memo } from "react";
import { useCurrency } from "@/hooks/use-currency";

type ExpenseItemProps = {
  expense: Expense;
  onClick?: () => void;
  className?: string;
};

export const ExpenseItem = memo(function ExpenseItem({ expense, onClick, className }: ExpenseItemProps) {
  const { amount, category, description, date, currency } = expense;
  const { activeCurrency } = useCurrency();
  
  return (
    <div 
      className={`flex items-center p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer ${className || ''}`}
      onClick={onClick}
    >
      <CategoryIcon category={category} />
      
      <div className="ml-3 flex-1">
        <div className="font-medium">{description}</div>
        <div className="text-xs text-muted-foreground flex">
          <span>{formatCategoryName(category)}</span>
          <span className="mx-1">•</span>
          <span>{format(new Date(date), 'MMM d')}</span>
          {currency && currency !== activeCurrency && (
            <>
              <span className="mx-1">•</span>
              <span>Original: {currency}</span>
            </>
          )}
        </div>
      </div>
      
      <MoneyAmount 
        amount={amount} 
        originalCurrency={currency} 
        isExpense 
      />
    </div>
  );
});
