
import { v4 as uuidv4 } from "uuid";
import { detectTextFromImage } from "./ocr";
import { updateMerchantFrequency, findMerchantsByName } from "./merchant-recognition";
import { Expense, Category } from "./types";
import { detectUserCurrency } from "./currency";

// Storage key for receipts
const RECEIPTS_STORAGE_KEY = "spendwise-receipts";

// Receipt interface
export interface Receipt {
  id: string;
  merchantName: string;
  total: number;
  date: string;
  currency: string;
  items: ReceiptItem[];
  imageUrl?: string;
  processed: boolean;
  created: string;
}

// Receipt item interface
export interface ReceiptItem {
  name: string;
  price: number;
  quantity?: number;
}

/**
 * Process a receipt image and extract information
 * @param imageDataUrl Base64 encoded image
 * @returns Extracted receipt data
 */
export async function processReceiptImage(imageDataUrl: string): Promise<Receipt> {
  // Run OCR on the image to extract text
  const extractedText = await detectTextFromImage(imageDataUrl);
  console.log("Extracted text:", extractedText);
  
  // Extract merchant name
  const merchantName = extractMerchantName(extractedText);
  
  // Update merchant frequency for learning
  if (merchantName) {
    await updateMerchantFrequency(merchantName);
  }
  
  // Extract total amount
  const total = extractTotalAmount(extractedText);
  
  // Extract date
  const date = extractDate(extractedText);
  
  // Detect currency
  const currency = detectCurrency(extractedText);
  
  // Extract individual items
  const items = extractItems(extractedText);
  
  // Create receipt object
  const receipt: Receipt = {
    id: uuidv4(),
    merchantName: merchantName || "Unknown Merchant",
    total: total || 0,
    date: date || new Date().toISOString().split('T')[0],
    currency: currency || detectUserCurrency(),
    items: items.length > 0 ? items : [],
    imageUrl: imageDataUrl,
    processed: true,
    created: new Date().toISOString()
  };
  
  // Save receipt to storage
  saveReceipt(receipt);
  
  return receipt;
}

/**
 * Convert receipt data to an expense object
 * @param receipt Receipt data
 * @param category Expense category
 * @returns Expense object
 */
export function convertReceiptToExpense(
  receipt: Receipt,
  category: Category
): Expense {
  return {
    id: uuidv4(),
    amount: receipt.total,
    category,
    date: receipt.date,
    description: `Purchase at ${receipt.merchantName}`,
    receiptImage: receipt.imageUrl || null,
    currency: receipt.currency,
    items: receipt.items
  } as Expense;
}

/**
 * Extract merchant name from receipt text
 * @param text Extracted text from receipt
 * @returns Merchant name
 */
function extractMerchantName(text: string): string | null {
  // First line often contains the merchant name
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  if (lines.length === 0) return null;
  
  // Try to find common merchant name patterns
  const merchantPatterns = [
    /MERCHANT:\s*([A-Za-z0-9\s&]+)/i,
    /STORE:\s*([A-Za-z0-9\s&]+)/i,
    /RESTAURANT:\s*([A-Za-z0-9\s&]+)/i
  ];
  
  for (const pattern of merchantPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // Check against known merchants in our history
  const knownMerchants = findMerchantsByName(lines[0]);
  if (knownMerchants && knownMerchants.length > 0) {
    return knownMerchants[0].name;
  }
  
  // Default to first line if no patterns match
  return lines[0].length > 30 ? lines[0].substring(0, 30) : lines[0];
}

/**
 * Extract total amount from receipt text
 * @param text Extracted text from receipt
 * @returns Total amount
 */
function extractTotalAmount(text: string): number | null {
  // Look for common patterns like "TOTAL: $42.99"
  const totalPatterns = [
    /TOTAL[:\s]*[$€£¥]?(\d+[.,]\d{2})/i,
    /AMOUNT[:\s]*[$€£¥]?(\d+[.,]\d{2})/i,
    /SUM[:\s]*[$€£¥]?(\d+[.,]\d{2})/i,
    /[$€£¥]?(\d+[.,]\d{2})\s*TOTAL/i,
    /[$€£¥](\d+[.,]\d{2})/
  ];
  
  for (const pattern of totalPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      // Replace comma with dot for proper number parsing
      return parseFloat(match[1].replace(',', '.'));
    }
  }
  
  // Find all amounts in the text and use the largest one
  const amountMatches = text.match(/[$€£¥]?(\d+[.,]\d{2})/g);
  if (amountMatches && amountMatches.length > 0) {
    const amounts = amountMatches.map(m => 
      parseFloat(m.replace(/[$€£¥]/g, '').replace(',', '.'))
    );
    return Math.max(...amounts);
  }
  
  return null;
}

/**
 * Extract date from receipt text
 * @param text Extracted text from receipt
 * @returns Date in YYYY-MM-DD format
 */
function extractDate(text: string): string | null {
  // Common date formats
  const datePatterns = [
    // MM/DD/YYYY
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/,
    // DD/MM/YYYY
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/,
    // YYYY/MM/DD
    /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/,
    // Text month format
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\-\.\/,]+(\d{1,2})[\s\-\.\/,]+(\d{4})/i
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      // Simple conversion - in a real app, this would need more sophisticated handling
      try {
        if (match[0].includes('/')) {
          const dateParts = match[0].split('/');
          // Assuming MM/DD/YYYY format for simplicity
          if (dateParts.length === 3) {
            const year = dateParts[2].length === 4 ? dateParts[2] : `20${dateParts[2]}`;
            const month = dateParts[0].padStart(2, '0');
            const day = dateParts[1].padStart(2, '0');
            return `${year}-${month}-${day}`;
          }
        }
        
        // Default to today if parsing fails
        const today = new Date();
        return today.toISOString().split('T')[0];
      } catch (e) {
        console.error("Date parsing error:", e);
        const today = new Date();
        return today.toISOString().split('T')[0];
      }
    }
  }
  
  // Default to today's date
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Detect currency from receipt text
 * @param text Extracted text from receipt
 * @returns Currency code
 */
function detectCurrency(text: string): string | null {
  const currencySymbols: { [key: string]: string } = {
    '$': 'USD',
    '€': 'EUR',
    '£': 'GBP',
    '¥': 'JPY',
    '₹': 'INR',
    '₽': 'RUB',
    'CA$': 'CAD',
    'A$': 'AUD',
    'HK$': 'HKD',
    'kr': 'SEK', // Also NOK, DKK
    'CHF': 'CHF',
    'R$': 'BRL',
    '₩': 'KRW'
  };
  
  // Check for currency symbols in the text
  for (const [symbol, code] of Object.entries(currencySymbols)) {
    if (text.includes(symbol)) {
      return code;
    }
  }
  
  // Check for explicit currency codes
  const currencyCodes = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];
  for (const code of currencyCodes) {
    if (text.includes(code)) {
      return code;
    }
  }
  
  // Default to user's currency
  return detectUserCurrency();
}

/**
 * Extract individual items from receipt text
 * @param text Extracted text from receipt
 * @returns Array of items
 */
function extractItems(text: string): ReceiptItem[] {
  const items: ReceiptItem[] = [];
  
  // Split into lines and look for patterns like "Item name 2.99"
  const lines = text.split('\n');
  
  const itemPattern = /(.+?)\s+(\d+(?:[.,]\d{2})?)$/;
  const itemWithQtyPattern = /(\d+)\s+x\s+(.+?)\s+(\d+(?:[.,]\d{2})?)$/;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip short lines or likely headers
    if (trimmedLine.length < 5 || /total|subtotal|tax|date|merchant|receipt/i.test(trimmedLine)) {
      continue;
    }
    
    // Check for item with quantity pattern
    const qtyMatch = trimmedLine.match(itemWithQtyPattern);
    if (qtyMatch) {
      items.push({
        name: qtyMatch[2].trim(),
        price: parseFloat(qtyMatch[3].replace(',', '.')),
        quantity: parseInt(qtyMatch[1])
      });
      continue;
    }
    
    // Check for simple item pattern
    const match = trimmedLine.match(itemPattern);
    if (match) {
      items.push({
        name: match[1].trim(),
        price: parseFloat(match[2].replace(',', '.'))
      });
    }
  }
  
  return items;
}

/**
 * Save receipt to local storage
 * @param receipt Receipt to save
 */
export function saveReceipt(receipt: Receipt): void {
  const receipts = getReceipts();
  receipts.push(receipt);
  localStorage.setItem(RECEIPTS_STORAGE_KEY, JSON.stringify(receipts));
}

/**
 * Get all saved receipts
 * @returns Array of receipts
 */
export function getReceipts(): Receipt[] {
  const receipts = localStorage.getItem(RECEIPTS_STORAGE_KEY);
  return receipts ? JSON.parse(receipts) : [];
}

/**
 * Get a receipt by ID
 * @param id Receipt ID
 * @returns Receipt or undefined
 */
export function getReceiptById(id: string): Receipt | undefined {
  const receipts = getReceipts();
  return receipts.find(receipt => receipt.id === id);
}

/**
 * Delete a receipt by ID
 * @param id Receipt ID
 */
export function deleteReceipt(id: string): void {
  const receipts = getReceipts();
  const filtered = receipts.filter(receipt => receipt.id !== id);
  localStorage.setItem(RECEIPTS_STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Export receipts to CSV format
 * @param receipts Receipts to export
 * @returns CSV data
 */
export function exportReceiptsToCSV(receipts: Receipt[]): string {
  // CSV header
  const header = ['Date', 'Merchant', 'Amount', 'Currency', 'Items'];
  
  // Format data rows
  const rows = receipts.map(receipt => [
    receipt.date,
    receipt.merchantName,
    receipt.total.toString(),
    receipt.currency,
    receipt.items.map(item => `${item.name} (${item.price})`).join('; ')
  ]);
  
  // Combine header and rows
  const csvData = [header, ...rows].map(row => row.join(',')).join('\n');
  
  return csvData;
}

/**
 * Export receipts to Excel format
 * @param receipts Receipts to export
 * @returns Base64 encoded Excel data
 */
export function exportReceiptsToExcel(receipts: Receipt[]): string {
  // In a real implementation, you would use a library like exceljs
  // For now, we'll just return CSV data since browser-based Excel generation is complex
  
  return exportReceiptsToCSV(receipts);
}

/**
 * Process multiple receipts (batch)
 * @param imageDataUrls Array of base64 encoded images
 * @returns Array of processed receipts
 */
export async function processBatchReceipts(imageDataUrls: string[]): Promise<Receipt[]> {
  const results: Receipt[] = [];
  
  for (const imageDataUrl of imageDataUrls) {
    try {
      const receipt = await processReceiptImage(imageDataUrl);
      results.push(receipt);
    } catch (error) {
      console.error('Error processing receipt:', error);
    }
  }
  
  return results;
}
