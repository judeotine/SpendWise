
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Category, Expense } from "@/lib/types";
import { getExpenses, saveExpense, updateExpense, deleteExpense } from "@/lib/storage";
import { getCategories, formatCategoryName, getCategoryDetails } from "@/lib/categories";
import { getCurrencySymbol } from "@/lib/currency/formatters";
import { getActiveCurrency } from "@/lib/currency/storage";
import { Trash2, Calendar } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useCurrency } from "@/hooks/use-currency";
import { motion } from "framer-motion";

const ExpenseForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const expenseId = searchParams.get("id");
  const { activeCurrency } = useCurrency();
  
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("food");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [isEditing, setIsEditing] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [currency, setCurrency] = useState(activeCurrency);
  
  // Get currency symbol
  const currencySymbol = getCurrencySymbol(currency);
  
  // Load expense if we're editing
  useEffect(() => {
    if (expenseId) {
      const expenses = getExpenses();
      const expense = expenses.find((e) => e.id === expenseId);
      
      if (expense) {
        setAmount(expense.amount.toString());
        setDescription(expense.description);
        setCategory(expense.category);
        setDate(expense.date.split('T')[0]);
        if (expense.currency) {
          setCurrency(expense.currency);
        }
        setIsEditing(true);
      }
    } else {
      // For new expenses, use the current active currency
      setCurrency(activeCurrency);
    }
  }, [expenseId, activeCurrency]);
  
  // Update currency when active currency changes (for new expenses only)
  useEffect(() => {
    if (!isEditing) {
      setCurrency(activeCurrency);
    }
  }, [activeCurrency, isEditing]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description || !category || !date) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    const expenseData: Expense = {
      id: expenseId || uuidv4(),
      amount: parseFloat(amount),
      description,
      category,
      date: new Date(date).toISOString(),
      currency: currency, // Save with the actual currency selected at creation time
    };
    
    if (isEditing) {
      updateExpense(expenseData);
      toast({
        title: "Expense updated",
        description: "Your expense has been updated successfully",
      });
    } else {
      saveExpense(expenseData);
      toast({
        title: "Expense added",
        description: "Your expense has been added successfully",
      });
    }
    
    navigate("/");
  };
  
  const handleDelete = () => {
    if (expenseId) {
      deleteExpense(expenseId);
      toast({
        title: "Expense deleted",
        description: "Your expense has been deleted successfully",
      });
      navigate("/");
    }
  };
  
  const categories = getCategories();
  
  const formVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };
  
  return (
    <div className="min-h-full pb-6">
      <PageHeader
        title={isEditing ? "Edit Expense" : "Add Expense"}
        showBackButton
        rightContent={
          isEditing && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive">
                  <Trash2 className="h-5 w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="neo-blur border-rose-500/20">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-rose-500">Delete Expense</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this expense? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )
        }
      />
      
      <motion.form 
        onSubmit={handleSubmit} 
        className="p-4"
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="mb-6" variants={itemVariants}>
          <Label htmlFor="amount" className="mb-2 block">Amount ({currency})</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg font-medium">
              {currencySymbol}
            </span>
            <Input
              id="amount"
              className="pl-8 text-lg neo-blur border-white/10"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </motion.div>
        
        <motion.div className="mb-6" variants={itemVariants}>
          <Label htmlFor="description" className="mb-2 block">Description</Label>
          <Input
            id="description"
            placeholder="What was this expense for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="neo-blur border-white/10"
          />
        </motion.div>
        
        <motion.div className="mb-6" variants={itemVariants}>
          <Label className="mb-2 block">Category</Label>
          <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-3 px-4 neo-blur border-white/10 hover:bg-white/10"
              >
                <CategoryIcon category={category} size="sm" className="mr-3" />
                <span>{formatCategoryName(category)}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md neo-blur">
              <DialogHeader>
                <DialogTitle>Select Category</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-4 py-4">
                {categories.map((cat) => {
                  const { icon } = getCategoryDetails(cat);
                  return (
                    <Card
                      key={cat}
                      className={`flex flex-col items-center p-3 cursor-pointer transition-all hover:bg-white/5 ${
                        category === cat ? "neo-blur ring-2 ring-primary" : "glassmorphism"
                      }`}
                      onClick={() => {
                        setCategory(cat);
                        setShowCategoryDialog(false);
                      }}
                    >
                      <CategoryIcon category={cat} size="sm" />
                      <span className="text-xs mt-2 text-center">
                        {formatCategoryName(cat)}
                      </span>
                    </Card>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
        
        <motion.div className="mb-8" variants={itemVariants}>
          <Label htmlFor="date" className="mb-2 block">Date</Label>
          <div className="relative">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
            </span>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="neo-blur border-white/10"
            />
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Button 
            type="submit" 
            className="w-full py-6 text-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
          >
            {isEditing ? "Update Expense" : "Add Expense"}
          </Button>
        </motion.div>
      </motion.form>
    </div>
  );
};

export default ExpenseForm;
