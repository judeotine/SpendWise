
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { sendFeedback } from "@/lib/feedback";
import { toast } from "@/components/ui/use-toast";

interface FeedbackFormProps {
  className?: string;
}

export function FeedbackForm({ className }: FeedbackFormProps) {
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
      const success = await sendFeedback(feedbackText);
      
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
    } catch (error: any) {
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
          className={`p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors ${className}`}
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
          </motion.div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Send Feedback</DialogTitle>
              <DialogDescription>
                Share your thoughts about SpendWise. Your feedback will be sent to our team.
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
}
