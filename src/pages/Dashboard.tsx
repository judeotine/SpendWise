
import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/card";
import { AnimatedProgress } from "@/components/ui/AnimatedProgress";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { getExpenses, getRecentExpenses, getCategoriesTotalSpent } from "@/lib/storage";
import { useCurrency } from "@/hooks/use-currency";
import { formatCategoryName } from "@/lib/categories";
import { MoneyAmount } from "@/components/ui/MoneyAmount";
import { fadeInAnimation, slideInAnimation, popInAnimation } from "@/lib/animations";
import { Expense, Category } from "@/lib/types";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Wallet, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast, sendFeedbackEmail } from "@/lib/notifications";

// Finance animation component
const FinanceAnimation = () => (
  <motion.div
    className="relative h-8 w-8 flex items-center justify-center"
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <motion.div
      className="absolute inset-0 bg-primary/20 rounded-full"
      animate={{ 
        scale: [1, 1.2, 1],
        opacity: [0.7, 0.3, 0.7]
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse"
      }}
    />
    <DollarSign className="h-5 w-5 text-primary" />
  </motion.div>
);

// Feedback button component
const FeedbackButton = () => {
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  
  const handleSubmit = async () => {
    if (!feedbackText.trim()) {
      toast({
        title: "Feedback cannot be empty",
        description: "Please provide some feedback before submitting",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    setFormError("");
    
    try {
      const success = await sendFeedbackEmail(feedbackText);
      
      if (!success) {
        throw new Error("Failed to send feedback");
      }
      
      setFeedbackText("");
      setShowSuccess(true);
      
      setTimeout(() => {
        setIsOpen(false);
        setShowSuccess(false);
      }, 2000);
      
      toast({
        title: "Feedback sent",
        description: "Thank you for your feedback!",
      });
    } catch (error) {
      setFormError("Unable to send feedback. Please try again later.");
      toast({
        title: "Failed to send feedback",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.button
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ y: -5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Send className="h-5 w-5" />
        </motion.button>
      </DialogTrigger>
      
      <DialogContent className="glassmorphism border border-white/20 sm:max-w-md">
        {showSuccess ? (
          <motion.div 
            className="flex flex-col items-center justify-center py-8 text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4"
              animate={{ 
                scale: [1, 1.2, 1],
                backgroundColor: ["rgba(34, 197, 94, 0.2)", "rgba(34, 197, 94, 0.4)", "rgba(34, 197, 94, 0.2)"]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <CheckCircle className="h-8 w-8 text-green-500" />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2">Feedback Sent!</h3>
            <p className="text-muted-foreground">Thank you for helping us improve SpendWise.</p>
            <p className="text-xs text-muted-foreground mt-2">Sent via Formspree</p>
          </motion.div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Send Feedback</DialogTitle>
              <DialogDescription>
                Share your thoughts about SpendWise. Your feedback will be sent via Formspree.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <Textarea 
                placeholder="Tell us what you think about the app..."
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                className="min-h-[100px] glassmorphism border border-white/20"
              />
              {formError && (
                <p className="text-sm text-destructive mt-2">{formError}</p>
              )}
            </div>
            
            <DialogFooter>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full glassmorphism hover:bg-white/20 border border-primary/20"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <motion.div
                      className="w-4 h-4 border-2 border-primary/50 border-t-transparent rounded-full mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Sending...
                  </div>
                ) : "Send Feedback"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

const Dashboard = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [categorySpending, setCategorySpending] = useState<{
    category: Category;
    amount: number;
    percentage: number;
  }[]>([]);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const { activeCurrency, convertAmount } = useCurrency();

  useEffect(() => {
    const loadedExpenses = getExpenses();
    setExpenses(loadedExpenses);

    const recent = getRecentExpenses(5);
    setRecentExpenses(recent);

    const calculateCategorySpending = async () => {
      try {
        const categories = await getCategoriesTotalSpent();
        const total = categories.reduce((sum, cat) => sum + cat.amount, 0);
        
        setCategorySpending(categories);
        setTotalSpent(total);
      } catch (error) {
        console.error("Error calculating category spending:", error);
      }
    };
    
    calculateCategorySpending();
  }, [activeCurrency]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const getWeeklyExpenses = () => {
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    
    const weeklyData: { [key: string]: number } = {};
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dayName = dayNames[date.getDay()];
      weeklyData[dayName] = 0;
    }
    
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      if (expenseDate >= oneWeekAgo && expenseDate <= now) {
        const dayName = dayNames[expenseDate.getDay()];
        weeklyData[dayName] = (weeklyData[dayName] || 0) + expense.amount;
      }
    });
    
    const orderedDays = [...dayNames];
    return orderedDays.map(name => ({ name, value: weeklyData[name] || 0 }));
  };

  return (
    <div className="p-4 pb-20">
      <PageHeader 
        title={
          <div className="flex items-center gap-2">
            SpendWise
            <FinanceAnimation />
          </div>
        }
        rightContent={<FeedbackButton />}
      />
      
      <motion.div 
        className="space-y-6 mt-4"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={fadeInAnimation}>
          <Card className="p-4 glassmorphism overflow-hidden border border-white/20 shadow-xl">
            <h2 className="text-lg font-medium mb-2 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              Weekly Spending
            </h2>
            <div className="h-60 overflow-hidden">
              <div className="overflow-x-auto pb-2 -mx-4 px-4 h-full flex flex-col justify-center" style={{ maxWidth: '100%' }}>
                {getWeeklyExpenses().map((item, index) => (
                  <motion.div 
                    key={item.name} 
                    className="flex items-center mb-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 + 0.1 }}
                  >
                    <span className="w-8 text-xs font-medium">{item.name}</span>
                    <div className="flex-1 mx-2">
                      <motion.div 
                        className="h-6 bg-primary/10 rounded-full overflow-hidden"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: "100%",
                          transition: { duration: 0.5, delay: index * 0.05 }
                        }}
                      >
                        <motion.div 
                          className="h-full bg-gradient-to-r from-primary/70 to-primary"
                          initial={{ width: 0 }}
                          animate={{ 
                            width: `${Math.min(100, (item.value / (Math.max(...getWeeklyExpenses().map(d => d.value)) || 1)) * 100)}%`,
                            transition: { duration: 0.7, delay: 0.3 + index * 0.05 }
                          }}
                        />
                      </motion.div>
                    </div>
                    <span className="w-20 text-right text-xs font-medium">
                      <MoneyAmount 
                        amount={item.value} 
                        size="sm" 
                        showSymbol={true}
                      />
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
        
        <motion.div variants={slideInAnimation}>
          <Card className="p-4 glassmorphism border border-white/20 shadow-lg">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <Wallet className="h-5 w-5 mr-2 text-primary" />
              Top Categories
            </h2>
            <div className="space-y-3">
              {categorySpending.slice(0, 3).map((category, index) => (
                <motion.div 
                  key={category.category} 
                  className="space-y-1"
                  variants={popInAnimation}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {formatCategoryName(category.category)}
                    </span>
                    <span className="text-sm">
                      <MoneyAmount 
                        amount={category.amount} 
                        size="sm" 
                        showSymbol={true}
                      />
                    </span>
                  </div>
                  <AnimatedProgress 
                    value={category.percentage} 
                    showAnimation={true}
                  />
                </motion.div>
              ))}
              {categorySpending.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No spending data yet
                </p>
              )}
            </div>
          </Card>
        </motion.div>
        
        <motion.div variants={fadeInAnimation}>
          <Card className="p-4 glassmorphism border border-white/20 shadow-lg">
            <h2 className="text-lg font-medium mb-3">Recent Expenses</h2>
            <ExpenseList 
              expenses={recentExpenses} 
            />
            {recentExpenses.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">
                  No recent expenses
                </p>
                <Link to="/add-expense">
                  <Button size="sm" className="bg-primary/80 hover:bg-primary">
                    Add Your First Expense
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
