
import { motion } from "framer-motion";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "white";
  withText?: boolean;
  className?: string;
}

export function Logo({ 
  size = "md", 
  variant = "default", 
  withText = false,
  className = ""
}: LogoProps) {
  const sizeMap = {
    sm: { logo: 24, text: "text-lg" },
    md: { logo: 36, text: "text-xl" },
    lg: { logo: 48, text: "text-2xl" }
  };
  
  const colorMap = {
    default: { stroke: "#22C55E", text: "text-primary" },
    white: { stroke: "#FFFFFF", text: "text-white" }
  };
  
  return (
    <motion.div 
      className={`flex items-center ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative">
        <motion.svg 
          width={sizeMap[size].logo} 
          height={sizeMap[size].logo} 
          viewBox="0 0 48 48" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.8 }}
        >
          <motion.path 
            d="M24 4C12.954 4 4 12.954 4 24C4 35.046 12.954 44 24 44C35.046 44 44 35.046 44 24" 
            stroke={colorMap[variant].stroke} 
            strokeWidth="5" 
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          <motion.path 
            d="M24 12V24L32 28" 
            stroke={colorMap[variant].stroke} 
            strokeWidth="5" 
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          />
          <motion.path 
            d="M36 6L44 14" 
            stroke={colorMap[variant].stroke} 
            strokeWidth="5" 
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          />
          <motion.path 
            d="M44 6L36 14" 
            stroke={colorMap[variant].stroke} 
            strokeWidth="5" 
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          />
        </motion.svg>
      </div>
      
      {withText && (
        <motion.span 
          className={`font-bold ml-2 ${sizeMap[size].text} ${colorMap[variant].text}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          SpendWise
        </motion.span>
      )}
    </motion.div>
  );
}
