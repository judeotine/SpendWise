import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Moon, Sun, Laptop, Trash2, Github, LogOut, ChevronRight, Settings as SettingsIcon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useCurrency } from "@/hooks/use-currency";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { fadeInAnimation, slideInAnimation } from "@/lib/animations";
import { getStorageUsage } from "@/lib/storage";
import { CURRENCIES } from "@/lib/currency";

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { activeCurrency, changeCurrency, isChangingCurrency } = useCurrency();
  const [storageUsed, setStorageUsed] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredCurrencies = CURRENCIES.filter(currency => 
    currency.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    currency.code.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  useEffect(() => {
    const storage = getStorageUsage();
    const usedPercent = (storage.used / storage.total) * 100;
    setStorageUsed(usedPercent);
  }, []);

  const handleCurrencyChange = (value: string) => {
    changeCurrency(value);
  };

  const handleResetData = () => {
    localStorage.clear();
    
    toast({
      title: "Data reset successful",
      description: "All your data has been cleared.",
    });
    
    window.location.reload();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  const settingsSections = [
    {
      title: "Appearance",
      icon: <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-full">
              <Sun className="h-5 w-5 text-white" />
            </div>,
      items: [
        {
          name: "Theme",
          description: "Select your preferred theme",
          control: (
            <div className="flex space-x-2">
              <Button 
                variant={theme === 'light' ? 'default' : 'outline'} 
                size="icon"
                onClick={() => setTheme('light')}
                className="transition-all"
              >
                <Sun className="h-[1.2rem] w-[1.2rem]" />
              </Button>
              <Button 
                variant={theme === 'dark' ? 'default' : 'outline'} 
                size="icon"
                onClick={() => setTheme('dark')}
                className="transition-all"
              >
                <Moon className="h-[1.2rem] w-[1.2rem]" />
              </Button>
              <Button 
                variant={theme === 'system' ? 'default' : 'outline'} 
                size="icon"
                onClick={() => setTheme('system')}
                className="transition-all"
              >
                <Laptop className="h-[1.2rem] w-[1.2rem]" />
              </Button>
            </div>
          ),
        }
      ],
    },
    {
      title: "Regional",
      icon: <div className="bg-gradient-to-br from-blue-400 to-indigo-500 p-2 rounded-full">
              <span className="text-base font-bold text-white flex items-center justify-center">$€</span>
            </div>,
      items: [
        {
          name: "Currency",
          description: "Set your preferred currency",
          control: (
            <Select value={activeCurrency} onValueChange={handleCurrencyChange} disabled={isChangingCurrency}>
              <SelectTrigger className="w-[120px] glassmorphism border border-white/20">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent className="glassmorphism border border-white/20 max-h-[300px]">
                <div className="px-3 py-2 mb-2">
                  <input
                    type="text"
                    placeholder="Search currencies..."
                    className="w-full px-2 py-1 text-sm rounded border border-white/20 bg-background/60 focus:outline-none focus:ring-1 focus:ring-primary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {filteredCurrencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <div className="flex items-center justify-between w-full">
                      <span>{currency.code}</span>
                      <span className="text-muted-foreground text-xs">{currency.symbol}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ),
        }
      ],
    },
    {
      title: "Links",
      icon: <div className="bg-gradient-to-br from-purple-400 to-pink-500 p-2 rounded-full">
              <Github className="h-5 w-5 text-white" />
            </div>,
      items: [
        {
          name: "GitHub",
          description: "Check out my GitHub",
          control: (
            <Button variant="outline" size="sm" asChild className="group glassmorphism hover:bg-white/20 border border-white/20">
              <a href="https://github.com/judeotine" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                View
                <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          ),
        }
      ],
    },
    {
      title: "Data",
      icon: <div className="bg-gradient-to-br from-red-400 to-rose-500 p-2 rounded-full">
              <Trash2 className="h-5 w-5 text-white" />
            </div>,
      items: [
        {
          name: "App Storage",
          description: `${storageUsed.toFixed(1)}% of local storage used`,
          control: (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="group glassmorphism hover:bg-white/20 border border-white/20">
                  Manage
                  <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md glassmorphism border border-white/20">
                <DialogHeader>
                  <DialogTitle>Storage Management</DialogTitle>
                  <DialogDescription>
                    View and manage your app data storage
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-3 bg-gradient-to-r from-primary/80 to-primary rounded-full" 
                      style={{ width: `${Math.min(storageUsed, 100)}%` }}
                    ></div>
                  </div>
                  <div className="mt-4 flex justify-between text-sm">
                    <span>Usage: {storageUsed.toFixed(1)}%</span>
                    <span>5MB limit</span>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ),
        },
        {
          name: "Reset Data",
          description: "Delete all your data and start fresh",
          control: (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="shadow-lg shadow-rose-500/20">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glassmorphism border-rose-500/20">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-rose-500">Reset all data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your expenses, budgets, and settings. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="glassmorphism hover:bg-white/20 border border-white/20">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetData} className="bg-destructive hover:bg-destructive/90">
                    Reset All Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ),
        }
      ],
    },
  ];

  return (
    <div className="pb-20">
      <PageHeader 
        title={
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-primary" />
            Settings
          </div>
        } 
      />
      
      <motion.div 
        className="px-4 space-y-8 pb-4"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {settingsSections.map((section, i) => (
          <motion.div 
            key={section.title}
            variants={itemVariants}
            custom={i}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 flex items-center justify-center shadow-lg rounded-full">
                {section.icon}
              </div>
              <h2 className="text-lg font-medium">{section.title}</h2>
            </div>
            
            <Card className="overflow-hidden glassmorphism border border-white/20 shadow-lg">
              <div className="divide-y divide-white/10">
                {section.items.map((item, j) => (
                  <div key={item.name} className="flex items-center justify-between p-4 hover:bg-white/5 transition-all">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <div>{item.control}</div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
        
        <motion.div 
          className="text-center py-8"
          variants={fadeInAnimation}
        >
          <div className="glassmorphism py-3 px-6 rounded-full inline-block text-sm">
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent font-medium">
              SpendWise v1.0.0
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Settings;
