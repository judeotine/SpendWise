
import { NavLink } from "react-router-dom";
import { Home, PieChart, Plus, Settings, PiggyBank } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { triggerHapticFeedback } from "@/lib/animations";

const navItems = [
  {
    icon: Home,
    to: "/dashboard",
    label: "Dashboard"
  }, 
  {
    icon: PieChart,
    to: "/insights",
    label: "Insights"
  }, 
  {
    icon: Plus,
    to: "/add-expense",
    label: "Add",
    highlight: true
  }, 
  {
    icon: PiggyBank,
    to: "/budget",
    label: "Budget"
  }, 
  {
    icon: Settings,
    to: "/settings",
    label: "Settings"
  }
];

export function BottomNavigation() {
  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-3 pb-3 z-50" 
      initial={{ y: 100 }} 
      animate={{ y: 0 }} 
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <nav className="glassmorphism flex items-center justify-around rounded-2xl shadow-xl border border-white/20 dark:border-white/10 backdrop-blur-xl py-2 px-1 relative">
        {navItems.map((item, index) => {
          if (item.highlight) {
            return (
              <NavLink 
                key={item.to} 
                to={item.to} 
                className={({isActive}) => cn("absolute -top-8 left-1/2 -translate-x-1/2 flex items-center justify-center z-10", {
                  "text-primary": isActive,
                  "text-white": !isActive
                })}
                onClick={() => triggerHapticFeedback('submit')}
              >
                {({isActive}) => (
                  <motion.div 
                    className="flex items-center justify-center" 
                    whileHover={{ scale: 1.1 }} 
                    whileTap={{ scale: 0.95, rotateZ: 5 }}
                  >
                    <motion.div 
                      className="bg-gradient-to-br from-primary to-primary/80 rounded-full p-4 shadow-lg border-4 border-background" 
                      whileTap={{ scale: 0.9 }} 
                      transition={{ type: "spring", stiffness: 500, damping: 15 }} 
                      style={{ boxShadow: "0 4px 15px rgba(34, 197, 94, 0.4)" }}
                    >
                      <item.icon className="h-6 w-6 text-white" />
                    </motion.div>
                  </motion.div>
                )}
              </NavLink>
            );
          }
          
          return (
            <NavLink 
              key={item.to} 
              to={item.to} 
              end={item.to === "/dashboard"} 
              className={({isActive}) => cn("flex items-center justify-center p-2 rounded-xl transition-all", {
                "text-primary": isActive,
                "text-muted-foreground hover:text-foreground": !isActive
              })}
              onClick={() => triggerHapticFeedback('info')}
            >
              {({isActive}) => (
                <motion.div 
                  className="flex items-center justify-center" 
                  initial={{ scale: 0.8 }} 
                  animate={{ scale: 1 }} 
                  transition={{ delay: index * 0.1 }} 
                  whileHover={{ y: -2 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className={cn("h-5 w-5", {
                    "text-primary": isActive
                  })} />
                  
                  {isActive && (
                    <motion.div 
                      className="h-1 w-1 rounded-full bg-primary mt-1 absolute bottom-1" 
                      layoutId="activeIndicator" 
                    />
                  )}
                </motion.div>
              )}
            </NavLink>
          );
        })}
      </nav>
    </motion.div>
  );
}
