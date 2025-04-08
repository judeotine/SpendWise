
import { Button } from "@/components/ui/button";
import { PiggyBank } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { scaleInAnimation } from "@/lib/animations";

interface EmptyBudgetStateProps {
  onCreateClick: () => void;
}

export const EmptyBudgetState = ({ onCreateClick }: EmptyBudgetStateProps) => (
  <motion.div 
    className="text-center py-8 flex flex-col items-center"
    variants={scaleInAnimation}
  >
    <div className="bg-secondary rounded-full p-6 inline-block mb-4">
      <PiggyBank className="h-10 w-10 text-primary" />
    </div>
    <h2 className="text-xl font-medium mb-2">No Budgets Yet</h2>
    <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
      Create your first budget to start tracking your spending goals
    </p>
    <Dialog>
      <DialogTrigger asChild>
        <Button onClick={onCreateClick}>
          Create Your First Budget
        </Button>
      </DialogTrigger>
    </Dialog>
  </motion.div>
);
