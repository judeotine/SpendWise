
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun, Mail, Github, Loader2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SignUp: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  
  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };
  
  // Handle email signup
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Account created successfully",
        description: "Please check your email to confirm your account",
      });
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error: any) {
      console.error("Signup error:", error);
      setErrorMsg(error.message || "Failed to sign up. Please try again.");
      toast({
        title: "Sign up failed",
        description: error.message || "Please check your details and try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle GitHub OAuth
  const handleGithubSignUp = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      console.error("GitHub auth error:", error);
      toast({
        title: "Authentication failed",
        description: error.message || "Could not sign in with GitHub",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-background relative overflow-hidden">
      {/* Background animated elements */}
      <motion.div 
        className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 20, 0],
          y: [0, -30, 0]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      <motion.div 
        className="absolute bottom-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, -20, 0],
          y: [0, 30, 0]
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          repeatType: "reverse",
          delay: 2
        }}
      />
      
      <Card className="w-full max-w-md mx-4 glassmorphism border border-white/20 shadow-xl">
        <CardHeader className="space-y-1">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl text-center">Create Account</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === "light" ? <Moon className="h-[1.2rem] w-[1.2rem]" /> : <Sun className="h-[1.2rem] w-[1.2rem]" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
          <CardDescription className="text-center">
            Enter your details to create your account
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {errorMsg && (
            <motion.div 
              className="bg-destructive/10 text-destructive p-3 rounded-md text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errorMsg}
            </motion.div>
          )}
          
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                type="text" 
                placeholder="Enter your full name" 
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                disabled={isLoading}
                className="glassmorphism border border-white/20"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="glassmorphism border border-white/20"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Create password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="glassmorphism border border-white/20"
              />
            </div>
            
            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full glassmorphism hover:bg-white/20 border border-primary/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : "Sign Up with Email"}
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            type="button" 
            onClick={handleGithubSignUp}
            disabled={isLoading}
            className="glassmorphism border border-white/20"
          >
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Button 
              variant="link" 
              className="p-0 h-auto font-medium text-primary" 
              onClick={() => navigate("/auth/signin")}
            >
              Sign In
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignUp;
