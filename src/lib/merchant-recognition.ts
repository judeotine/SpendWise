
// If this file already exists, add these exported functions to it

// Type for merchant frequency data
export interface MerchantFrequency {
  name: string;
  frequency: number;
  lastUsed: string;
  logo?: string;
}

const MERCHANT_STORAGE_KEY = 'spendwise-merchant-frequencies';

/**
 * Update merchant frequency when a receipt is processed
 * @param merchantName Name of the merchant
 */
export async function updateMerchantFrequency(merchantName: string): Promise<void> {
  const merchants = getMerchantFrequencies();
  const now = new Date().toISOString();
  
  // Find existing merchant
  const existingMerchant = merchants.find(m => 
    m.name.toLowerCase() === merchantName.toLowerCase()
  );
  
  if (existingMerchant) {
    // Update frequency and last used date
    existingMerchant.frequency += 1;
    existingMerchant.lastUsed = now;
  } else {
    // Add new merchant
    merchants.push({
      name: merchantName,
      frequency: 1,
      lastUsed: now
    });
  }
  
  // Save to storage
  localStorage.setItem(MERCHANT_STORAGE_KEY, JSON.stringify(merchants));
  
  // Try to fetch merchant logo if not already available
  await fetchMerchantLogo(merchantName);
}

/**
 * Get all merchant frequencies
 * @returns Array of merchant frequencies
 */
export function getMerchantFrequencies(): MerchantFrequency[] {
  const merchants = localStorage.getItem(MERCHANT_STORAGE_KEY);
  return merchants ? JSON.parse(merchants) : [];
}

/**
 * Find merchants by name (partial match)
 * @param partialName Partial name to search for
 * @returns Matching merchants sorted by frequency
 */
export function findMerchantsByName(partialName: string): MerchantFrequency[] {
  const merchants = getMerchantFrequencies();
  const searchTerm = partialName.toLowerCase();
  
  // Find merchants that match the partial name
  const matches = merchants.filter(merchant => 
    merchant.name.toLowerCase().includes(searchTerm)
  );
  
  // Sort by frequency (highest first)
  return matches.sort((a, b) => b.frequency - a.frequency);
}

/**
 * Fetch merchant logo from Clearbit API
 * @param merchantName Merchant name
 * @returns Logo URL if available
 */
export async function fetchMerchantLogo(merchantName: string): Promise<string | null> {
  try {
    // Clean up the merchant name for API use
    const cleanName = merchantName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove special characters
      .trim();
    
    if (!cleanName) return null;
    
    // In a real implementation, you would call the Clearbit API
    // For demo purposes, we'll just check if we have the logo cached
    const merchants = getMerchantFrequencies();
    const merchant = merchants.find(m => 
      m.name.toLowerCase() === merchantName.toLowerCase()
    );
    
    if (merchant && merchant.logo) {
      return merchant.logo;
    }
    
    // For demonstration, generate a color based on the merchant name
    // In a real app, you would call Clearbit API:
    // const response = await fetch(`https://logo.clearbit.com/${cleanName}.com`);
    
    // Fake logo URL (a colored square based on first letter)
    const charCode = cleanName.charCodeAt(0) || 97; // Default to 'a' if empty
    const hue = (charCode - 97) * 15; // Map a-z to different hues
    const logoUrl = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Crect width='50' height='50' fill='hsl(${hue}, 70%25, 60%25)' /%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='24' fill='white'%3E${merchantName.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E`;
    
    // Update the merchant's logo in storage
    if (merchant) {
      merchant.logo = logoUrl;
      localStorage.setItem(MERCHANT_STORAGE_KEY, JSON.stringify(merchants));
    }
    
    return logoUrl;
  } catch (error) {
    console.error("Error fetching merchant logo:", error);
    return null;
  }
}
