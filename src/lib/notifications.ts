
import { toast as baseToast } from "@/components/ui/use-toast";
import { type ToastActionElement } from "@/components/ui/toast";

// Create the proper toast props type that matches the expected type in use-toast
export interface ToastProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: "default" | "destructive";
}

// Enhanced toast function that plays a sound
export const toast = (props: ToastProps) => {
  // Play notification sound if available
  try {
    if (window && (window as any).playNotificationSound) {
      (window as any).playNotificationSound();
    }
  } catch (e) {
    console.error("Failed to play notification sound:", e);
  }
  
  // Call the original toast function with the correct typing
  // We need to properly handle the ReactNode to string conversion
  return baseToast({
    ...props,
    // Convert ReactNode to string if it's not already a string
    title: props.title ? 
      (typeof props.title === 'string' ? props.title : String(props.title)) : 
      undefined,
    description: props.description ? 
      (typeof props.description === 'string' ? props.description : String(props.description)) : 
      undefined,
  });
};

// Send feedback using formspree
export const sendFeedbackEmail = async (feedback: string): Promise<boolean> => {
  try {
    const formspreeEndpoint = "https://formspree.io/f/mnnpggee";
    
    // Send data to formspree
    const response = await fetch(formspreeEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        message: feedback,
        email: "form submission via SpendWise app"
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Formspree submission failed with status: ${response.status}`);
    }
    
    console.log("Feedback successfully sent via Formspree");
    return true;
  } catch (error) {
    console.error("Error sending feedback via Formspree:", error);
    return false;
  }
};

// Provide all the same exports as the original toast
export * from "@/components/ui/use-toast";
