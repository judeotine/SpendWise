
import { Category } from "@/lib/types";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { memo } from "react";

type CategoryIconProps = {
  category: Category;
  className?: string;
  size?: "sm" | "md" | "lg";
  withBackground?: boolean;
};

export const CategoryIcon = memo(function CategoryIcon({ 
  category, 
  className,
  size = "md",
  withBackground = true 
}: CategoryIconProps) {
  const { icon, color } = CATEGORIES[category];
  
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
  };
  
  return (
    <div 
      className={cn(
        "flex items-center justify-center rounded-full",
        withBackground && color,
        withBackground && "bg-opacity-90",
        sizeClasses[size],
        className
      )}
    >
      <span role="img" aria-label={category}>
        {icon}
      </span>
    </div>
  );
});
