
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { triggerHapticFeedback } from "@/lib/animations";
import { Receipt } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export function ScannerButton() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const handleClick = () => {
    triggerHapticFeedback('success');
    navigate('/receipt-scanner');
  };
  
  // Determine gradient based on theme
  const gradient = theme === 'dark' 
    ? 'from-primary via-primary/90 to-primary/80'
    : 'from-primary to-primary/70';
  
  // Shadow effect based on theme
  const shadow = theme === 'dark' 
    ? 'shadow-[0_0_15px_rgba(124,58,237,0.5)]'  
    : 'shadow-[0_0_15px_rgba(124,58,237,0.3)]';
  
  return (
    <motion.div 
      className="fixed right-0 top-1/3 z-50"
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 500, 
        damping: 30,
        delay: 0.3
      }}
    >
      <motion.button
        className="relative flex items-center justify-center h-14 pl-4 pr-7"
        whileHover={{ 
          scale: 1.05,
          filter: "brightness(1.1)"
        }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
      >
        {/* Fluid pill connection to sidebar */}
        <div className="absolute inset-0 right-[28px] rounded-l-full bg-gradient-to-r from-[#1e293b]/80 to-primary/10"></div>
        
        {/* Circular button that's partially embedded */}
        <div className={`absolute right-0 w-14 h-14 rounded-full ${shadow} flex items-center justify-center overflow-hidden`}>
          {/* Gradient background with depth effect */}
          <div className="absolute inset-0 bg-gradient-to-br shadow-inner rounded-full border border-white/10">
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}></div>
          </div>
          
          {/* White outline receipt icon */}
          <Receipt className="w-6 h-6 text-white relative z-10" strokeWidth={1.5} />
          
          {/* Glow effect on hover */}
          <motion.div 
            className="absolute inset-0 bg-white/20 opacity-0 rounded-full"
            whileHover={{ opacity: 0.3 }}
            transition={{ duration: 0.2 }}
          />
        </div>
        
        {/* Light effect to create depth */}
        <div className="absolute top-1 right-2 w-2 h-2 rounded-full bg-white/30 blur-sm"></div>
        
        {/* Shadow underneath */}
        <div className="absolute -bottom-2 -right-1 w-9 h-2 bg-black/20 blur-md rounded-full"></div>
      </motion.button>
    </motion.div>
  );
}
