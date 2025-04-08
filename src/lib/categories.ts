
import { CategoryDetails } from "./types";
import { Category as ExpenseCategory } from "./types";

// Export the Category type so it can be used elsewhere
export type Category = 
  | "food" 
  | "transportation" 
  | "housing" 
  | "entertainment" 
  | "utilities" 
  | "shopping" 
  | "health" 
  | "education" 
  | "clothing" 
  | "savings" 
  | "debt" 
  | "travel" 
  | "groceries"
  | "other";

// Map from Categories to ExpenseCategory
export function mapToExpenseCategory(category: Category): ExpenseCategory {
  // Since "groceries" doesn't exist in ExpenseCategory, map it to "food"
  if (category === "groceries") {
    return "food";
  }
  
  // For other categories, check if they exist in ExpenseCategory
  if (["food", "transportation", "housing", "entertainment", 
       "utilities", "shopping", "health", "education",
       "clothing", "savings", "debt", "travel", "other"].includes(category)) {
    return category as ExpenseCategory;
  }
  
  // Default fallback
  return "other";
}

// Define all categories with their details
export const CATEGORIES: Record<Category, CategoryDetails> = {
  food: {
    name: "Food & Dining",
    icon: "🍔",
    color: "bg-green-500",
  },
  transportation: {
    name: "Transportation",
    icon: "🚗",
    color: "bg-blue-500",
  },
  housing: {
    name: "Housing",
    icon: "🏠",
    color: "bg-purple-500",
  },
  entertainment: {
    name: "Entertainment",
    icon: "🎬",
    color: "bg-amber-500",
  },
  utilities: {
    name: "Utilities",
    icon: "⚡",
    color: "bg-red-500",
  },
  shopping: {
    name: "Shopping",
    icon: "🛍️",
    color: "bg-violet-500",
  },
  health: {
    name: "Health",
    icon: "❤️",
    color: "bg-pink-500",
  },
  education: {
    name: "Education",
    icon: "📚",
    color: "bg-teal-500",
  },
  clothing: {
    name: "Clothing",
    icon: "👕",
    color: "bg-indigo-500",
  },
  groceries: {
    name: "Groceries",
    icon: "🥕",
    color: "bg-emerald-500",
  },
  savings: {
    name: "Savings",
    icon: "🐖",
    color: "bg-lime-500",
  },
  debt: {
    name: "Debt",
    icon: "💳",
    color: "bg-slate-500",
  },
  travel: {
    name: "Travel",
    icon: "🌎",
    color: "bg-orange-500",
  },
  other: {
    name: "Other",
    icon: "⋯",
    color: "bg-neutral-500",
  },
};

// Get all category keys
export const getCategories = (): Category[] => {
  return Object.keys(CATEGORIES) as Category[];
};

// Format category display name
export const formatCategoryName = (category: Category): string => {
  return CATEGORIES[category]?.name || category;
};

// Get details for a category
export const getCategoryDetails = (category: Category): CategoryDetails => {
  return CATEGORIES[category] || CATEGORIES.other;
};

// Get category color
export const getCategoryColor = (category: Category): string => {
  return CATEGORIES[category]?.color || CATEGORIES.other.color;
};

// Get category icon name
export const getCategoryIcon = (category: Category): string => {
  return CATEGORIES[category]?.icon || "help-circle";
};
