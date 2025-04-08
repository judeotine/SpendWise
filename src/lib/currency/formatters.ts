
import { getActiveCurrency } from './storage';

// Format amount with currency symbol based on the provided currency code
export const formatCurrency = (amount: number, currencyCode?: string): string => {
  const code = currencyCode || getActiveCurrency();
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    console.error(`Error formatting currency ${code}:`, error);
    // Fallback: just prepend symbol
    return `${getCurrencySymbol(code)} ${formatAmount(amount)}`;
  }
};

// Format amount without currency symbol
export const formatAmount = (amount: number, currencyCode?: string): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    console.error('Error formatting amount:', error);
    // Simple fallback
    return amount.toFixed(2);
  }
};

// Get currency symbol for a given currency code
export const getCurrencySymbol = (currencyCode: string): string => {
  try {
    // Use formatter just to get the symbol
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    const parts = formatter.formatToParts(0);
    const symbol = parts.find(part => part.type === 'currency')?.value || currencyCode;
    return symbol;
  } catch (error) {
    console.error(`Error getting symbol for ${currencyCode}:`, error);
    return currencyCode; // Fallback to currency code
  }
};
