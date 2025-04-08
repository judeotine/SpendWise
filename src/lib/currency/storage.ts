
// Get stored currency preference
export const getActiveCurrency = (): string => {
  return localStorage.getItem("spendwise-currency") || "USD";
};

// Set currency preference
export const setActiveCurrency = (currency: string): void => {
  localStorage.setItem("spendwise-currency", currency);
};

// Track when currency was last changed
export const getCurrencyChangeTimestamp = (): number => {
  const timestamp = localStorage.getItem("spendwise-currency-timestamp");
  return timestamp ? parseInt(timestamp) : Date.now();
};

// Update timestamp when currency changes
export const setCurrencyChangeTimestamp = (): void => {
  localStorage.setItem("spendwise-currency-timestamp", Date.now().toString());
};
