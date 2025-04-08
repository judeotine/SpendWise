
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Logo } from "./Logo";

type PageHeaderProps = {
  title: string | React.ReactNode;
  showBackButton?: boolean;
  showLogo?: boolean;
  className?: string;
  rightContent?: React.ReactNode;
};

export function PageHeader({ 
  title, 
  showBackButton = false,
  showLogo = false,
  className,
  rightContent
}: PageHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <motion.header 
      className={cn(
        "sticky top-0 z-20 glassmorphism text-foreground backdrop-blur-xl px-4 py-4 flex items-center rounded-b-2xl shadow-lg border-b border-white/10",
        className
      )}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, type: "spring", damping: 15 }}
    >
      <div className="flex-1 flex items-center">
        {showBackButton && (
          <motion.button 
            onClick={() => navigate(-1)}
            className="mr-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
          >
            <ChevronLeft className="h-5 w-5" />
          </motion.button>
        )}
        
        {showLogo ? (
          <Logo withText size="sm" variant="white" />
        ) : (
          <motion.div 
            className="text-xl font-bold"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, type: "spring" }}
          >
            {title}
          </motion.div>
        )}
      </div>
      
      {rightContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {rightContent}
        </motion.div>
      )}
    </motion.header>
  );
}
