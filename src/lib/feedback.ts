
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/components/ui/use-toast";
import { launchConfetti } from "./animations";

/**
 * Saves feedback to the database and sends email notification
 * @param message Feedback message
 * @returns Promise<boolean> indicating success or failure
 */
export const sendFeedback = async (message: string): Promise<boolean> => {
  try {
    // Get the current user or generate a guest ID
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id || 'guest-' + Math.random().toString(36).substring(2, 15);
    const userEmail = sessionData.session?.user?.email || 'anonymous@user.com';
    
    if (!message) {
      return false;
    }
    
    // Insert feedback into database
    const { error } = await supabase
      .from('feedback')
      .insert({
        user_id: userId,
        message,
        email: userEmail
      });
      
    if (error) {
      console.error("Error saving feedback:", error);
      // Try to save to local storage as fallback
      const feedback = {
        id: Date.now().toString(),
        user_id: userId,
        message,
        email: userEmail,
        created_at: new Date().toISOString()
      };
      
      const storedFeedback = localStorage.getItem('spendwise-feedback') || '[]';
      const feedbackItems = JSON.parse(storedFeedback);
      feedbackItems.push(feedback);
      localStorage.setItem('spendwise-feedback', JSON.stringify(feedbackItems));
    }
    
    // Send email notification using Supabase edge function
    try {
      const { error: emailError } = await supabase.functions.invoke('send-feedback-email', {
        body: { 
          message,
          userEmail,
          recipientEmail: 'judextine28@gmail.com'
        }
      });
      
      if (emailError) {
        console.error("Error sending email notification:", emailError);
        // Fallback to direct server email (would require server endpoint in real app)
        console.log("Would send direct email to judextine28@gmail.com in production");
      }
    } catch (emailError) {
      console.error("Failed to invoke edge function:", emailError);
    }
    
    // Show confetti animation
    launchConfetti();
    
    // Play notification sound
    try {
      const audio = new Audio('/sounds/success.mp3');
      audio.volume = 0.5;
      audio.play().catch(error => {
        console.log('Sound effect not available:', error);
      });
    } catch (error) {
      console.log('Sound effect not available:', error);
    }
    
    // Trigger haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
    
    return true;
  } catch (error) {
    console.error("Error sending feedback:", error);
    return false;
  }
};

/**
 * Hook to provide feedback functionality
 */
export const useFeedback = () => {
  const { user } = useAuth();
  
  const submitFeedback = async (message: string): Promise<boolean> => {
    // We accept feedback from anyone, even if not authenticated
    return sendFeedback(message);
  };
  
  return {
    submitFeedback,
    isAuthenticated: !!user
  };
};
