
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
  | "other";

export interface CategoryDetails {
  name: string;
  icon: string;
  color: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: Category;
  date: string;
  currency?: string; // Currency code when expense was created
  tags?: string[];
}

export interface Budget {
  id: string;
  category: Category;
  amount: number;
  period: "daily" | "weekly" | "monthly" | "yearly";
  startDate: string;
  endDate?: string;
  currency?: string; // Currency code when budget was created
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: "info" | "warning" | "success";
  date: string;
  read: boolean;
  category?: Category;
  relatedCategory?: Category; // Added this field to fix the type error
}

export type ExpenseSummary = {
  category: Category;
  totalAmount: number;
  percentage: number;
  count: number;
};

export type MonthlyTotal = {
  month: string;
  total: number;
};
