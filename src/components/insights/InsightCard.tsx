
import { Insight } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { formatCategoryName } from "@/lib/categories";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { memo } from "react";

interface InsightCardProps {
  insight: Insight;
  index: number;
}

export const InsightCard = memo(function InsightCard({ insight, index }: InsightCardProps) {
  const borderColor = 
    insight.type === 'warning' ? 'rgb(239, 68, 68)' 
    : insight.type === 'success' ? 'rgb(34, 197, 94)' 
    : 'rgb(59, 130, 246)';
  
  return (
    <motion.div
      key={insight.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.5) }} // Cap delay to avoid long waits
    >
      <Card 
        className="p-4 border-l-4"
        style={{ borderLeftColor: borderColor }}
      >
        <h3 className="font-medium">{insight.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
        
        {insight.category && (
          <div className="flex items-center mt-2 text-xs text-muted-foreground">
            <CategoryIcon 
              category={insight.category} 
              size="sm" 
              className="mr-2"
            />
            <span>{formatCategoryName(insight.category)}</span>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground mt-2">
          {format(new Date(insight.date), 'MMM d, yyyy')}
        </div>
      </Card>
    </motion.div>
  );
});
