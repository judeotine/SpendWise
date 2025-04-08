
import { formatCurrency, formatAmount } from "@/lib/currency/formatters";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/use-currency";
import { useEffect, useState, memo } from "react";

interface MoneyAmountProps {
  amount: number;
  className?: string;
  showSymbol?: boolean;
  showSign?: boolean;
  showCurrencyCode?: boolean;
  currencyCode?: string;
  size?: "sm" | "md" | "lg" | "xl";
  isExpense?: boolean;
  originalCurrency?: string; // Used to track original currency
}

export const MoneyAmount = memo(function MoneyAmount({
  amount,
  className,
  showSymbol = true,
  showSign = false,
  showCurrencyCode = false,
  currencyCode,
  size = "md",
  isExpense,
  originalCurrency,
}: MoneyAmountProps) {
  const { activeCurrency, convertAmount } = useCurrency();
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [isConverting, setIsConverting] = useState(true);

  // Convert amount when currency changes or component mounts
  useEffect(() => {
    let isMounted = true;
    
    const doConversion = async () => {
      setIsConverting(true);
      
      // Skip conversion if amount is 0
      if (amount === 0) {
        if (isMounted) {
          setConvertedAmount(0);
          setIsConverting(false);
        }
        return;
      }
      
      // Use the original currency if provided, otherwise use the current currency code or active currency
      const sourceCurrency = originalCurrency || currencyCode || activeCurrency;
      
      // Skip conversion if displayed currency matches active currency
      if (sourceCurrency === activeCurrency) {
        if (isMounted) {
          setConvertedAmount(amount);
          setIsConverting(false);
        }
        return;
      }
      
      try {
        const converted = await convertAmount(amount, sourceCurrency);
        if (isMounted) {
          setConvertedAmount(converted);
        }
      } catch (error) {
        console.error("Error converting amount:", error);
        // Fallback to original amount
        if (isMounted) {
          setConvertedAmount(amount);
        }
      } finally {
        if (isMounted) {
          setIsConverting(false);
        }
      }
    };
    
    doConversion();
    
    return () => {
      isMounted = false;
    };
  }, [amount, currencyCode, originalCurrency, activeCurrency, convertAmount]);
  
  // Format the amount according to preferences
  const displayAmount = convertedAmount !== null ? convertedAmount : amount;
  let formattedAmount = showSymbol 
    ? formatCurrency(Math.abs(displayAmount), currencyCode || activeCurrency)
    : formatAmount(Math.abs(displayAmount), currencyCode || activeCurrency);
  
  // Add sign if needed
  if (showSign && displayAmount !== 0) {
    formattedAmount = `${displayAmount > 0 ? '+' : '-'} ${formattedAmount}`;
  } else if (displayAmount < 0) {
    formattedAmount = `- ${formattedAmount}`;
  }
  
  // Add currency code if requested
  if (showCurrencyCode) {
    formattedAmount = `${formattedAmount} ${currencyCode || activeCurrency}`;
  }
  
  // Size classes
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg font-medium",
    xl: "text-2xl font-semibold",
  };
  
  // Show small original currency indicator if conversion happened
  const showOriginalIndicator = originalCurrency && 
                               originalCurrency !== activeCurrency && 
                               convertedAmount !== null;
  
  if (isConverting) {
    return (
      <span 
        className={cn(
          sizeClasses[size],
          "animate-pulse text-muted-foreground",
          className
        )}
        data-testid="money-amount-loading"
      >
        {formattedAmount}
      </span>
    );
  }
  
  return (
    <span 
      className={cn(
        sizeClasses[size],
        displayAmount < 0 ? "text-destructive" : displayAmount > 0 ? "text-primary" : "",
        className
      )}
      data-testid="money-amount"
    >
      {formattedAmount}
      {showOriginalIndicator && (
        <span className="text-xs text-muted-foreground ml-1">
          ({originalCurrency})
        </span>
      )}
    </span>
  );
});
