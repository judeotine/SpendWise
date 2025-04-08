
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { CurrencyProvider } from "@/hooks/use-currency";
import { AuthProvider } from "@/hooks/use-auth";
import { MobileLayout } from "./components/layouts/MobileLayout";
import { lazy, Suspense, useEffect, useState } from "react";
import { detectUserCurrency, setActiveCurrency, getActiveCurrency } from "@/lib/currency";
import { AnimatePresence } from "framer-motion";
import { Skeleton } from "./components/ui/skeleton";

// Lazy load pages for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ExpenseForm = lazy(() => import("./pages/ExpenseForm"));
const Insights = lazy(() => import("./pages/Insights"));
const BudgetPlanner = lazy(() => import("./pages/BudgetPlanner"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Welcome = lazy(() => import("./pages/Welcome"));
const ReceiptScanner = lazy(() => import("./pages/ReceiptScanner"));

// Loading component for Suspense fallback with improved loading animation
const PageLoader = () => (
  <div className="flex flex-col space-y-3 p-4 animate-pulse">
    <Skeleton className="h-10 w-3/4 bg-gradient-to-r from-background/60 to-background/40" />
    <Skeleton className="h-32 w-full bg-gradient-to-r from-background/60 to-background/40" />
    <Skeleton className="h-24 w-full bg-gradient-to-r from-background/60 to-background/40" />
    <Skeleton className="h-24 w-full bg-gradient-to-r from-background/60 to-background/40" />
    <Skeleton className="h-16 w-1/2 bg-gradient-to-r from-background/60 to-background/40" />
  </div>
);

// Initialize query client with reduced stale time for faster refreshes
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 2, // 2 minutes
    },
  },
});

// Check if it's the first time opening the app
const hasSeenWelcome = () => {
  const seen = localStorage.getItem('welcomeSeen');
  return !!seen;
};

// Mark welcome as seen
const markWelcomeSeen = () => {
  localStorage.setItem('welcomeSeen', 'true');
};

// Initialize currency based on user's locale if not already set
const initializeCurrency = () => {
  if (!getActiveCurrency()) {
    const detectedCurrency = detectUserCurrency();
    setActiveCurrency(detectedCurrency);
  }
};

// Wrapper for the Welcome page to mark as seen after visiting
const WelcomeWrapper = () => {
  useEffect(() => {
    markWelcomeSeen();
  }, []);
  
  return (
    <Suspense fallback={<PageLoader />}>
      <Welcome />
    </Suspense>
  );
};

// Setup audio for toast notifications
const setupNotificationSound = () => {
  // Preload notification sound
  const audio = new Audio("/sounds/notification.mp3");
  audio.volume = 0.5;
  audio.load();
  
  // Override toast method to play sound
  (window as any).playNotificationSound = () => {
    audio.currentTime = 0;
    audio.play().catch(e => console.log("Failed to play sound:", e));
  };
  
  // Request notification permission for push notifications
  if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
    // Wait for user interaction before requesting permission
    const requestPermission = () => {
      Notification.requestPermission().then(permission => {
        console.log("Notification permission:", permission);
      });
      // Remove the event listeners after first interaction
      document.removeEventListener("click", requestPermission);
      document.removeEventListener("touchstart", requestPermission);
    };
    
    document.addEventListener("click", requestPermission);
    document.addEventListener("touchstart", requestPermission);
  }
};

// Setup haptic feedback for supported devices
const setupHapticFeedback = () => {
  // Check if vibration API is available
  if ('vibrate' in navigator) {
    (window as any).triggerHapticFeedback = (pattern: number | number[] = 50) => {
      navigator.vibrate(pattern);
    };
  }
};

const App = () => {
  const [hasSeenWelcomePage, setHasSeenWelcomePage] = useState(hasSeenWelcome());
  
  useEffect(() => {
    // Initialize currency on app load
    initializeCurrency();
    
    // Setup notification sounds and haptic feedback
    setupNotificationSound();
    setupHapticFeedback();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CurrencyProvider>
          <AuthProvider>
            <TooltipProvider>
              <BrowserRouter>
                <Toaster />
                <Sonner />
                <AnimatePresence mode="wait">
                  <Routes>
                    {/* Welcome page - only shown first time */}
                    <Route path="/" element={
                      !hasSeenWelcomePage ? (
                        <WelcomeWrapper />
                      ) : (
                        <Navigate to="/dashboard" replace />
                      )
                    } />
                    
                    {/* Main application routes */}
                    <Route path="/dashboard" element={<MobileLayout />}>
                      <Route index element={
                        <Suspense fallback={<PageLoader />}>
                          <Dashboard />
                        </Suspense>
                      } />
                    </Route>
                    
                    {/* Insights route */}
                    <Route path="/insights" element={<MobileLayout />}>
                      <Route index element={
                        <Suspense fallback={<PageLoader />}>
                          <Insights />
                        </Suspense>
                      } />
                    </Route>
                    
                    {/* Receipt scanner routes */}
                    <Route path="/receipt-scanner" element={<MobileLayout />}>
                      <Route index element={
                        <Suspense fallback={<PageLoader />}>
                          <ReceiptScanner />
                        </Suspense>
                      } />
                    </Route>
                    
                    <Route path="/" element={<MobileLayout />}>
                      <Route path="add-expense" element={
                        <Suspense fallback={<PageLoader />}>
                          <ExpenseForm />
                        </Suspense>
                      } />
                      <Route path="budget" element={
                        <Suspense fallback={<PageLoader />}>
                          <BudgetPlanner />
                        </Suspense>
                      } />
                      <Route path="settings" element={
                        <Suspense fallback={<PageLoader />}>
                          <Settings />
                        </Suspense>
                      } />
                    </Route>
                    
                    {/* Fallback routes */}
                    <Route path="/not-found" element={
                      <Suspense fallback={<PageLoader />}>
                        <NotFound />
                      </Suspense>
                    } />
                    <Route path="*" element={<Navigate to="/not-found" replace />} />
                  </Routes>
                </AnimatePresence>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
