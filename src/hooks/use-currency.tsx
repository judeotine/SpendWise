
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getActiveCurrency, setActiveCurrency, setCurrencyChangeTimestamp } from '@/lib/currency/storage';
import { convertCurrency } from '@/lib/exchangeRates';
import { toast } from '@/components/ui/use-toast';

interface CurrencyContextType {
  activeCurrency: string;
  changeCurrency: (currency: string) => Promise<void>;
  convertAmount: (amount: number, fromCurrency?: string) => Promise<number>;
  isChangingCurrency: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [activeCurrency, setActive] = useState(getActiveCurrency());
  const [isChangingCurrency, setIsChangingCurrency] = useState(false);

  // Convert an amount to active currency
  const convertAmount = useCallback(async (amount: number, fromCurrency: string = activeCurrency): Promise<number> => {
    // If the currencies are the same, return the original amount
    if (fromCurrency === activeCurrency) return amount;
    
    // If amount is zero, return zero (no need to convert)
    if (amount === 0) return 0;
    
    try {
      const convertedAmount = await convertCurrency(amount, fromCurrency, activeCurrency);
      return convertedAmount;
    } catch (error) {
      console.error(`Conversion failed from ${fromCurrency} to ${activeCurrency}:`, error);
      // In case of error, return original amount as fallback
      console.warn(`Fallback: Using original amount ${amount} ${fromCurrency} without conversion`);
      return amount;
    }
  }, [activeCurrency]);

  // Change active currency
  const changeCurrency = async (newCurrency: string): Promise<void> => {
    if (newCurrency === activeCurrency) return;

    setIsChangingCurrency(true);
    try {
      // Check if exchange rates are available by performing a test conversion
      await convertCurrency(1, activeCurrency, newCurrency);
      
      // Update currency in localStorage
      setActiveCurrency(newCurrency);
      setCurrencyChangeTimestamp(); // Track when the currency was changed
      setActive(newCurrency);
      
      toast({
        title: "Currency changed",
        description: `Currency has been updated to ${newCurrency}`,
      });
    } catch (error) {
      console.error("Failed to change currency:", error);
      toast({
        title: "Currency change failed",
        description: "Could not fetch exchange rates. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsChangingCurrency(false);
    }
  };

  return (
    <CurrencyContext.Provider value={{
      activeCurrency,
      changeCurrency,
      convertAmount,
      isChangingCurrency
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
