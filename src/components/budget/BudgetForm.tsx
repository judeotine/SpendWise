
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Budget, Category } from "@/lib/types";
import { formatCategoryName, getCategories } from "@/lib/categories";
import { useCurrency } from "@/hooks/use-currency";
import { toast } from "@/components/ui/use-toast";
import { predictBudget } from "@/lib/ai-insights";

interface BudgetFormProps {
  selectedBudget: Budget | null;
  onSave: (budget: Budget) => void;
}

export const BudgetForm = ({ selectedBudget, onSave }: BudgetFormProps) => {
  const [budgetCategory, setBudgetCategory] = useState<Category>(selectedBudget?.category || "food");
  const [budgetAmount, setBudgetAmount] = useState(selectedBudget?.amount.toString() || "");
  const [budgetPeriod, setBudgetPeriod] = useState<Budget["period"]>(selectedBudget?.period || "monthly");
  const [currencyAtCreation, setCurrencyAtCreation] = useState(selectedBudget?.currency || "");
  const [isLoading, setIsLoading] = useState(false);
  
  const { activeCurrency, convertAmount } = useCurrency();
  
  // Update form when selected budget changes
  useEffect(() => {
    if (selectedBudget) {
      setBudgetCategory(selectedBudget.category);
      setBudgetPeriod(selectedBudget.period);
      setCurrencyAtCreation(selectedBudget.currency || activeCurrency);
      
      // Convert budget amount to current currency if needed
      const updateAmount = async () => {
        if (selectedBudget.currency && selectedBudget.currency !== activeCurrency) {
          setIsLoading(true);
          try {
            const convertedAmount = await convertAmount(selectedBudget.amount, selectedBudget.currency);
            setBudgetAmount(convertedAmount.toString());
          } catch (error) {
            console.error("Error converting budget amount:", error);
            setBudgetAmount(selectedBudget.amount.toString());
            toast({
              title: "Conversion error",
              description: "Could not convert budget amount. Using original value.",
              variant: "destructive",
            });
          } finally {
            setIsLoading(false);
          }
        } else {
          setBudgetAmount(selectedBudget.amount.toString());
        }
      };
      
      updateAmount();
    } else {
      setBudgetCategory("food");
      setBudgetAmount("");
      setBudgetPeriod("monthly");
      setCurrencyAtCreation(activeCurrency);
    }
  }, [selectedBudget, activeCurrency]);
  
  const handleUseAISuggestion = () => {
    if (!budgetCategory) return;
    
    const suggestedAmount = predictBudget(budgetCategory);
    
    if (suggestedAmount > 0) {
      setBudgetAmount(suggestedAmount.toString());
      
      toast({
        title: "AI Suggestion Applied",
        description: `Based on your spending history, we suggest ${suggestedAmount} for ${formatCategoryName(budgetCategory)}`,
      });
    } else {
      toast({
        title: "Not enough data",
        description: "We need more spending history to make a suggestion",
      });
    }
  };
  
  const handleSubmit = () => {
    if (!budgetCategory || !budgetAmount || parseFloat(budgetAmount) <= 0) {
      toast({
        title: "Invalid budget",
        description: "Please enter a valid category and amount",
        variant: "destructive",
      });
      return;
    }
    
    const budget: Budget = {
      id: selectedBudget?.id || Date.now().toString(),
      category: budgetCategory,
      amount: parseFloat(budgetAmount),
      period: budgetPeriod,
      startDate: selectedBudget?.startDate || new Date().toISOString(),
      currency: activeCurrency, // Always store with current active currency
    };
    
    onSave(budget);
  };
  
  return (
    <div className="space-y-4 py-4">
      <div>
        <Label className="mb-2 block">Category</Label>
        <select
          className="w-full p-2 rounded-md border border-input bg-background"
          value={budgetCategory}
          onChange={(e) => setBudgetCategory(e.target.value as Category)}
        >
          {getCategories().map((cat) => (
            <option key={cat} value={cat}>
              {formatCategoryName(cat)}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label htmlFor="budgetAmount">Amount ({activeCurrency})</Label>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleUseAISuggestion}
            type="button"
            disabled={isLoading}
          >
            AI Suggest
          </Button>
        </div>
        <div className="relative">
          {isLoading ? (
            <Input
              value="Converting..."
              disabled
              className="pl-16"
            />
          ) : (
            <>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {activeCurrency}
              </span>
              <Input
                id="budgetAmount"
                className="pl-16"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
              />
            </>
          )}
        </div>
        
        {selectedBudget?.currency && selectedBudget.currency !== activeCurrency && (
          <p className="text-xs text-muted-foreground mt-1">
            Original: {selectedBudget.amount} {selectedBudget.currency}
          </p>
        )}
      </div>
      
      <div>
        <Label className="mb-2 block">Time Period</Label>
        <select
          className="w-full p-2 rounded-md border border-input bg-background"
          value={budgetPeriod}
          onChange={(e) => setBudgetPeriod(e.target.value as Budget["period"])}
        >
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
          <option value="yearly">Yearly</option>
          <option value="daily">Daily</option>
        </select>
      </div>
      
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Converting..." : selectedBudget ? "Update" : "Create"} Budget
        </Button>
      </DialogFooter>
    </div>
  );
};
