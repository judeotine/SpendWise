
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AnimatedProgressProps {
  value: number;
  max?: number;
  className?: string;
  indicatorClassName?: string;
  showValue?: boolean;
  label?: string;
  size?: "sm" | "md" | "lg";
  showAnimation?: boolean;
}

export function AnimatedProgress({
  value,
  max = 100,
  className,
  indicatorClassName,
  showValue = false,
  label,
  size = "md",
  showAnimation = true,
}: AnimatedProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const sizeClasses = {
    sm: "h-2",
    md: "h-4",
    lg: "h-6",
  };
  
  // Determine color based on percentage
  const getColorClass = () => {
    if (percentage < 30) return "bg-gradient-to-r from-red-400 to-red-500";
    if (percentage < 70) return "bg-gradient-to-r from-yellow-400 to-yellow-500";
    return "bg-gradient-to-r from-primary/80 to-primary";
  };
  
  return (
    <div className="w-full space-y-1">
      {(label || showValue) && (
        <div className="flex justify-between text-xs">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showValue && (
            <span className="font-medium">
              {value.toLocaleString()} / {max.toLocaleString()}
              <span className="ml-1 text-muted-foreground">
                ({percentage.toFixed(0)}%)
              </span>
            </span>
          )}
        </div>
      )}
      <div className={cn(
        "relative overflow-hidden rounded-full bg-secondary/30", 
        sizeClasses[size], 
        className
      )}>
        <motion.div
          className={cn("h-full relative overflow-hidden rounded-full", indicatorClassName || getColorClass())}
          initial={{ width: showAnimation ? "0%" : `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* Add shimmer effect */}
          {percentage > 0 && (
            <motion.div 
              className="absolute inset-0 w-full h-full"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                backgroundSize: "200% 100%",
              }}
              animate={{
                backgroundPosition: ["0% 0%", "200% 0%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
