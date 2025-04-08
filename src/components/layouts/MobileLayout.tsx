
import { Outlet, useLocation } from "react-router-dom";
import { BottomNavigation } from "../ui/BottomNavigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ScannerButton } from "../ui/ScannerButton";

export function MobileLayout() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate content loading
  useEffect(() => {
    // Reset loading state on route change
    setIsLoading(true);
    
    // Simulate content loading with a short timeout
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);
  
  return (
    <motion.div 
      className="flex flex-col h-[100dvh] w-full max-w-md mx-auto bg-gradient-to-br from-background to-background/95 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.main 
        className="flex-1 overflow-y-auto pb-20 relative"
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {/* Decorative elements with improved animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div 
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div 
            className="absolute top-1/3 -left-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.4, 0.6, 0.4],
              y: [0, -20, 0]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div 
            className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-secondary/10 blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 2
            }}
          />
        </div>
        
        {/* Loading animation */}
        {isLoading && (
          <motion.div 
            className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <motion.div 
              className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full"
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 1, 
                repeat: Infinity, 
                ease: "linear" 
              }}
            />
          </motion.div>
        )}
        
        {/* Content with relative positioning to appear above the decorative elements */}
        <div className="relative z-10">
          <Outlet />
        </div>
      </motion.main>
      
      {/* Add ScannerButton here */}
      <ScannerButton />
      
      <BottomNavigation />
    </motion.div>
  );
}
