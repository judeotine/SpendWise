
// Cache exchange rates to minimize API requests
interface ExchangeRateCache {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
  expiry: number; // Time in milliseconds when cache expires
}

// Default to a 6-hour cache validity
const CACHE_DURATION = 6 * 60 * 60 * 1000; 

// Store exchange rate cache
let rateCache: ExchangeRateCache | null = null;

// Fallback exchange rates in case API is unavailable
export const exchangeRates = {
  USD: {
    EUR: 0.91, GBP: 0.79, JPY: 150.23, CAD: 1.36, AUD: 1.51, NGN: 1504.50, 
    INR: 83.12, CNY: 7.23, BRL: 5.09, ZAR: 18.51, MXN: 16.79, TRY: 32.34
  },
  EUR: {
    USD: 1.10, GBP: 0.86, JPY: 164.86, CAD: 1.49, AUD: 1.66, NGN: 1654.95,
    INR: 91.37, CNY: 7.94, BRL: 5.60, ZAR: 20.35, MXN: 18.46, TRY: 35.58
  },
  GBP: {
    USD: 1.27, EUR: 1.16, JPY: 191.42, CAD: 1.73, AUD: 1.92, NGN: 1915.94,
    INR: 105.76, CNY: 9.20, BRL: 6.49, ZAR: 23.55, MXN: 21.39, TRY: 41.19
  }
};

// Fetch latest exchange rates
export const fetchExchangeRates = async (baseCurrency: string): Promise<Record<string, number>> => {
  // Check if we have valid cached rates
  const now = Date.now();
  if (
    rateCache && 
    rateCache.base === baseCurrency && 
    rateCache.expiry > now
  ) {
    console.log('Using cached exchange rates for', baseCurrency);
    return rateCache.rates;
  }

  try {
    console.log('Fetching fresh exchange rates for', baseCurrency);
    // Using open exchange rates API
    const response = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`);
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.rates) {
      // Cache the results
      rateCache = {
        base: baseCurrency,
        rates: data.rates,
        timestamp: now,
        expiry: now + CACHE_DURATION
      };
      
      // Also store in localStorage as fallback
      localStorage.setItem('spendwise-exchange-rates', JSON.stringify(rateCache));
      
      return data.rates;
    }
    throw new Error('Invalid response from exchange rate API');
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    
    // Try to use cached rates from localStorage if available
    const storedRates = localStorage.getItem('spendwise-exchange-rates');
    if (storedRates) {
      const parsedRates = JSON.parse(storedRates) as ExchangeRateCache;
      console.log('Using localStorage cached rates for', baseCurrency);
      return parsedRates.rates;
    }
    
    // If all else fails, use our fallback rates
    console.warn('Using fallback exchange rates');
    return exchangeRates[baseCurrency as keyof typeof exchangeRates] || { [baseCurrency]: 1 };
  }
};

// Convert amount between currencies with proper error handling
export const convertCurrency = async (
  amount: number, 
  fromCurrency: string, 
  toCurrency: string
): Promise<number> => {
  // If same currency, no conversion needed
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  try {
    // Get rates with fromCurrency as base
    const rates = await fetchExchangeRates(fromCurrency);
    
    // Convert amount using rate
    if (rates[toCurrency]) {
      const convertedAmount = amount * rates[toCurrency];
      console.log(`Converted ${amount} ${fromCurrency} to ${convertedAmount} ${toCurrency}`);
      return convertedAmount;
    }
    
    throw new Error(`Conversion rate not found for ${toCurrency}`);
  } catch (error) {
    console.error('Error converting currency:', error);
    
    // Try alternative conversion approach using an intermediary currency if available in cache
    try {
      console.log('Attempting alternative conversion via intermediary currency');
      
      // Look for any cached rates we can use
      const storedRates = localStorage.getItem('spendwise-exchange-rates');
      if (storedRates) {
        const parsedRates = JSON.parse(storedRates) as ExchangeRateCache;
        const intermediateCurrency = parsedRates.base;
        
        // If we have rates with a different base currency, try to use those
        if (intermediateCurrency !== fromCurrency && parsedRates.rates[fromCurrency] && parsedRates.rates[toCurrency]) {
          // Convert through the intermediate currency
          const fromRate = 1 / parsedRates.rates[fromCurrency]; // Rate to convert from source to intermediate
          const toRate = parsedRates.rates[toCurrency]; // Rate to convert from intermediate to target
          const result = amount * fromRate * toRate;
          
          console.log(`Alternative conversion via ${intermediateCurrency}: ${amount} ${fromCurrency} → ${result} ${toCurrency}`);
          return result;
        }
      }
      
      // If no suitable cached rates found, try using USD as a fallback only if needed
      if (fromCurrency !== 'USD' && toCurrency !== 'USD') {
        console.log('Attempting fallback conversion via USD');
        const usdRates = await fetchExchangeRates('USD');
        
        if (usdRates[fromCurrency] && usdRates[toCurrency]) {
          const amountInUsd = amount / usdRates[fromCurrency];
          const result = amountInUsd * usdRates[toCurrency];
          
          console.log(`USD fallback conversion: ${amount} ${fromCurrency} → ${result} ${toCurrency}`);
          return result;
        }
      }
      
      // Last resort: check our static fallback rates
      if (exchangeRates[fromCurrency as keyof typeof exchangeRates]?.[toCurrency]) {
        const rate = exchangeRates[fromCurrency as keyof typeof exchangeRates][toCurrency];
        const result = amount * rate;
        console.log(`Static fallback conversion: ${amount} ${fromCurrency} → ${result} ${toCurrency}`);
        return result;
      }
      
      throw new Error('No conversion path found');
    } catch (secondError) {
      console.error('All conversion attempts failed:', secondError);
      return amount; // Return original amount as last resort
    }
  }
};
