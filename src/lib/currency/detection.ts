
// Detect user's currency based on their locale
export const detectUserCurrency = (): string => {
  try {
    const userLocale = navigator.language;
    const formatter = new Intl.NumberFormat(userLocale, { style: 'currency', currency: 'USD' });
    const parts = formatter.formatToParts(0);
    
    // Extract currency from format
    const currencyPart = parts.find(part => part.type === 'currency');
    if (currencyPart) {
      return currencyPart.value;
    }
    
    // Fallback to mapping common locales to currencies
    const localeCurrencyMap: {[key: string]: string} = {
      'en-US': 'USD',
      'en-GB': 'GBP',
      'de': 'EUR',
      'fr': 'EUR',
      'jp': 'JPY',
      'zh-CN': 'CNY',
      'ng': 'NGN',
      'in': 'INR',
    };
    
    // Try matching the language part
    const language = userLocale.split('-')[0];
    if (localeCurrencyMap[language]) {
      return localeCurrencyMap[language];
    }
    
    return 'USD'; // Default fallback
  } catch (error) {
    console.error('Error detecting user currency:', error);
    return 'USD';
  }
};
