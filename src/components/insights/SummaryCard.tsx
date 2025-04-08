
import { Card } from "@/components/ui/card";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { Progress } from "@/components/ui/progress";
import { DollarSign, ArrowUp, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";

interface SummaryCardProps {
  totalSpent: number;
  topCategory: string;
  spendingChange: {
    percentage: number;
    increased: boolean;
  };
  budgetProgress: {
    used: number;
    total: number;
  };
}

export const SummaryCard = ({ 
  totalSpent, 
  topCategory, 
  spendingChange, 
  budgetProgress 
}: SummaryCardProps) => {
  return (
    <motion.div
      className="px-4 mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Spent</p>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-green-600 mr-1" />
              <p className="text-lg font-semibold">
                <MoneyAmount amount={totalSpent} size="lg" />
              </p>
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Top Category</p>
            <p className="text-lg font-semibold">{topCategory || "None"}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Spending Trend</p>
            <div className="flex items-center">
              {spendingChange.increased ? (
                <ArrowUp className="h-4 w-4 text-red-500 mr-1" />
              ) : (
                <ArrowDown className="h-4 w-4 text-green-600 mr-1" />
              )}
              <p className={`text-lg font-semibold ${spendingChange.increased ? 'text-red-500' : 'text-green-600'}`}>
                {spendingChange.percentage}%
              </p>
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Budget Used</p>
            <div className="space-y-1">
              <p className="text-lg font-semibold">
                {budgetProgress.total > 0 ? 
                  `${Math.round((budgetProgress.used / budgetProgress.total) * 100)}%` : 
                  "N/A"}
              </p>
              {budgetProgress.total > 0 && (
                <Progress 
                  value={(budgetProgress.used / budgetProgress.total) * 100}
                  className={budgetProgress.used > budgetProgress.total ? "bg-red-100" : ""}
                />
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
