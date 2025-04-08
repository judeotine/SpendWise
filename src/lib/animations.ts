
import confetti from 'canvas-confetti';

/**
 * Launch confetti animation
 */
export const launchConfetti = (options = {}) => {
  const defaults = {
    particleCount: 100,
    spread: 70,
    origin: { y: 0.9 },
    colors: ['#22c55e', '#10b981', '#059669', '#065f46', '#064e3b']
  };

  confetti({
    ...defaults,
    ...options
  });
};

/**
 * Launch budget celebration confetti
 * Used when user stays under budget
 */
export const launchBudgetConfetti = () => {
  const end = Date.now() + 1500;
  
  // Colorful confetti for budget celebration
  const budgetColors = ['#22c55e', '#10b981', '#fbbf24', '#fb923c', '#f59e0b'];
  
  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: budgetColors
    });
    
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: budgetColors
    });
    
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  
  frame();

  // Play celebration sound
  try {
    const audio = new Audio('/sounds/success.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => {
      console.log('Sound effect not available:', e);
    });
  } catch (error) {
    console.log('Sound effect not available');
  }
  
  // Trigger haptic feedback if available
  if (navigator.vibrate) {
    navigator.vibrate([50, 25, 50, 25, 100]);
  }
};

/**
 * Trigger device vibration for different actions
 * @param type Vibration pattern type
 */
export const triggerHapticFeedback = (type: 'success' | 'error' | 'warning' | 'info' | 'scan' | 'submit' = 'success') => {
  if (!navigator.vibrate) return;
  
  const patterns = {
    success: [50, 50, 100],
    error: [100, 50, 100, 50, 100],
    warning: [50, 30, 50],
    info: [25],
    scan: [30],
    submit: [50]
  };
  
  navigator.vibrate(patterns[type]);
};

/**
 * Fade in animation variants for Framer Motion
 */
export const fadeInAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

/**
 * Slide in animation variants for Framer Motion
 */
export const slideInAnimation = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

/**
 * Pop in animation variants for Framer Motion
 */
export const popInAnimation = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

/**
 * Scale in animation variants for Framer Motion (renamed from popInAnimation)
 * This was missing and caused errors
 */
export const scaleInAnimation = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

/**
 * Stagger animation for children elements
 */
export const staggerChildren = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

/**
 * Floating animation for elements
 * @returns Animation properties
 */
export const floatingAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 3,
    ease: "easeInOut",
    repeat: Infinity,
    repeatType: "loop" as const
  }
};

/**
 * Pulse animation for elements
 * @returns Animation properties
 */
export const pulseAnimation = {
  scale: [1, 1.05, 1],
  opacity: [0.9, 1, 0.9],
  transition: {
    duration: 2,
    ease: "easeInOut",
    repeat: Infinity,
    repeatType: "loop" as const
  }
};

/**
 * Drag animation variants for categories
 */
export const dragAnimation = {
  drag: {
    scale: 1.02,
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
    transition: {
      duration: 0.2
    }
  },
  dragConstraints: {
    left: 0,
    right: 0
  }
};

/**
 * Magnetic snap animation
 */
export const magneticSnapAnimation = {
  x: 0,
  transition: {
    type: "spring",
    stiffness: 300,
    damping: 20
  }
};

/**
 * Receipt upload animation variants
 */
export const receiptUploadAnimation = {
  initial: { y: 0, opacity: 0, scale: 0.8 },
  animate: { 
    y: -20, 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15
    }
  },
  exit: { 
    y: -50, 
    opacity: 0,
    transition: {
      duration: 0.3
    }
  }
};

/**
 * Receipt stack animation 
 */
export const receiptStackAnimation = (index: number) => ({
  initial: { 
    rotateZ: Math.random() * 6 - 3,
    y: 20,
    opacity: 0 
  },
  animate: { 
    rotateZ: Math.random() * 6 - 3,
    y: 0,
    opacity: 1,
    transition: {
      delay: index * 0.1,
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }
});
