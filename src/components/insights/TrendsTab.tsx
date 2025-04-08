
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ExpenseSummary, MonthlyTotal } from "@/lib/types";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { formatCategoryName } from "@/lib/categories";
import { motion } from "framer-motion";
import { useCurrency } from "@/hooks/use-currency";

interface TrendsTabProps {
  monthlyTotals: MonthlyTotal[];
  categorySummary: ExpenseSummary[];
  trendDescription: string | null;
}

export const TrendsTab = ({ 
  monthlyTotals, 
  categorySummary, 
  trendDescription 
}: TrendsTabProps) => {
  const { activeCurrency } = useCurrency();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {monthlyTotals.length > 1 ? (
        <Card className="p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Spending Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyTotals}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  tickFormatter={(value) => (value === 0) ? '0' : `${activeCurrency} ${Math.round(value)}`}
                  width={60}
                />
                <Tooltip 
                  formatter={(value) => [<MoneyAmount amount={Number(value)} />, 'Total']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 bg-green-50 p-3 rounded-lg border border-green-100">
            <h4 className="font-medium text-green-800 mb-1">Analysis</h4>
            <p className="text-sm text-green-700">
              {trendDescription || "Not enough data to analyze spending trends. Add more expenses over time to see trends."}
            </p>
          </div>
        </Card>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p className="mb-2">Not enough data to show trends</p>
          <p className="text-sm">Add expenses across multiple months to see trends</p>
        </div>
      )}
      
      {categorySummary.length > 0 && (
        <Card className="p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Top Spending Categories</h3>
          <div className="space-y-4">
            {categorySummary.slice(0, 5).map((category, index) => (
              <div key={category.category} className="space-y-1">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <CategoryIcon category={category.category} size="sm" className="mr-2" />
                    <span>{formatCategoryName(category.category)}</span>
                  </div>
                  <MoneyAmount amount={category.totalAmount} />
                </div>
                <Progress value={category.percentage} className="h-2" />
                <p className="text-xs text-muted-foreground text-right">
                  {category.percentage.toFixed(1)}% of total
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </motion.div>
  );
};
