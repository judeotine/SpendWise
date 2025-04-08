
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { 
  Camera, Upload, X, Check, ArrowRight, Download, 
  FileSpreadsheet, FileText, Trash, Plus, Gift
} from "lucide-react";
import { 
  processReceiptImage, 
  convertReceiptToExpense, 
  exportReceiptsToCSV, 
  exportReceiptsToExcel,
  getReceipts,
  Receipt,
  deleteReceipt
} from "@/lib/receipt-processing";
import { CameraComponent } from "@/components/ui/Camera";
import { triggerHapticFeedback, launchConfetti, receiptUploadAnimation, receiptStackAnimation } from "@/lib/animations";
import { Category, getCategories, mapToExpenseCategory } from "@/lib/categories";
import { saveExpense } from "@/lib/storage";
import { detectTextFromImage, enhanceImageForOCR } from "@/lib/ocr";
import { format } from "date-fns";

export default function ReceiptScanner() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>("groceries");
  const [scanResults, setScanResults] = useState<Receipt | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>(getReceipts());
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchImages, setBatchImages] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchInputRef = useRef<HTMLInputElement>(null);
  
  // Get categories from the categories file
  const categories = getCategories();
  
  // Capture image from camera
  const handleCameraCapture = (imageDataUrl: string) => {
    triggerHapticFeedback('success');
    setShowCamera(false);
    
    // Process the image with enhancement
    enhanceImageForOCR(imageDataUrl).then(enhancedImage => {
      setCapturedImage(enhancedImage);
    });
  };
  
  // Show camera component
  const openCamera = useCallback(() => {
    setShowCamera(true);
  }, []);
  
  // Upload image from device
  const uploadImage = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);
  
  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerHapticFeedback('success');
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageDataUrl = event.target?.result as string;
        const enhancedImage = await enhanceImageForOCR(imageDataUrl);
        setCapturedImage(enhancedImage);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle batch upload
  const uploadBatch = useCallback(() => {
    if (batchInputRef.current) {
      batchInputRef.current.click();
    }
  }, []);
  
  // Handle batch file upload
  const handleBatchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      triggerHapticFeedback('success');
      setIsBatchProcessing(true);
      
      // Convert FileList to array
      const fileArray = Array.from(files);
      const imagePromises: Promise<string>[] = [];
      
      fileArray.forEach(file => {
        const promise = new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const imageDataUrl = event.target?.result as string;
            const enhancedImage = await enhanceImageForOCR(imageDataUrl);
            resolve(enhancedImage);
          };
          reader.readAsDataURL(file);
        });
        
        imagePromises.push(promise);
      });
      
      // Process all images
      Promise.all(imagePromises)
        .then(images => {
          setBatchImages(images);
          toast({
            title: "Batch Upload Ready",
            description: `${images.length} receipts ready for processing.`,
          });
        });
    }
  };
  
  // Process batch images
  const processBatchImages = async () => {
    if (batchImages.length === 0) return;
    
    setIsProcessing(true);
    let processedCount = 0;
    
    for (const imageDataUrl of batchImages) {
      try {
        setProcessingProgress(Math.floor((processedCount / batchImages.length) * 100));
        
        // Process the receipt image
        const receipt = await processReceiptImage(imageDataUrl);
        
        // Update receipts state
        setReceipts(prev => [...prev, receipt]);
        
        processedCount++;
      } catch (error) {
        console.error('Error processing batch image:', error);
      }
    }
    
    // Complete processing
    setProcessingProgress(100);
    triggerHapticFeedback('success');
    toast({
      title: "Batch Processing Complete",
      description: `Processed ${processedCount} out of ${batchImages.length} receipts.`,
    });
    
    // Reset state
    setTimeout(() => {
      setIsProcessing(false);
      setBatchImages([]);
      setIsBatchProcessing(false);
      launchConfetti();
    }, 1000);
  };
  
  // Process captured image
  const processImage = async () => {
    if (!capturedImage) return;
    
    setIsProcessing(true);
    setProcessingProgress(0);
    
    try {
      // Start progress animation
      const interval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);
      
      // Process the image
      const receipt = await processReceiptImage(capturedImage);
      
      clearInterval(interval);
      setProcessingProgress(100);
      
      // Set scan results
      setScanResults(receipt);
      
      // Add to receipts list
      setReceipts(prev => [receipt, ...prev]);
      
      // Reset processing state
      setTimeout(() => {
        setIsProcessing(false);
        triggerHapticFeedback('success');
      }, 500);
      
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Processing Failed",
        description: "Could not process the receipt image. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };
  
  // Clear captured image
  const clearImage = () => {
    setCapturedImage(null);
    setScanResults(null);
    triggerHapticFeedback('info');
  };
  
  // Save as expense
  const saveAsExpense = () => {
    if (!scanResults) return;
    
    // Convert to expense using the mapper
    const expenseCategory = mapToExpenseCategory(selectedCategory);
    const expense = convertReceiptToExpense(scanResults, expenseCategory);
    
    // Save the expense
    saveExpense(expense);
    
    // Show success toast
    toast({
      title: "Expense Saved",
      description: `Added ${expense.amount} ${scanResults.currency} for ${selectedCategory}.`,
    });
    
    // Launch confetti
    launchConfetti();
    
    // Trigger haptic feedback
    triggerHapticFeedback('success');
    
    // Navigate to dashboard
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };
  
  // Export receipts as CSV
  const handleExportCSV = () => {
    const csv = exportReceiptsToCSV(receipts);
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipts-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Cleanup
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: "Receipts exported as CSV."
    });
    
    triggerHapticFeedback('success');
  };
  
  // Export receipts as Excel
  const handleExportExcel = () => {
    const excel = exportReceiptsToExcel(receipts);
    
    // Create download link
    const blob = new Blob([excel], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipts-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Cleanup
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: "Receipts exported as Excel."
    });
    
    triggerHapticFeedback('success');
  };

  return (
    <div className="container p-4 max-w-md mx-auto">
      <PageHeader title="Receipt Scanner" />
      
      <Tabs defaultValue="scan" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="scan">Scan</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="batch">Batch</TabsTrigger>
        </TabsList>
        
        {/* SCAN TAB */}
        <TabsContent value="scan" className="space-y-4">
          {!capturedImage ? (
            <Card className="p-6">
              <div className="flex flex-col gap-4">
                <Button 
                  className="w-full py-8 bg-primary/10 hover:bg-primary/20 text-primary border border-dashed border-primary/30"
                  variant="outline"
                  onClick={openCamera}
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Take Photo
                </Button>
                
                <Button 
                  className="w-full py-8 bg-muted/50 hover:bg-muted text-muted-foreground border border-dashed border-muted-foreground/30"
                  variant="outline"
                  onClick={uploadImage}
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Image
                </Button>
                
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </div>
            </Card>
          ) : (
            <>
              <AnimatePresence>
                <motion.div 
                  className="relative rounded-lg overflow-hidden border border-border"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <img 
                    src={capturedImage} 
                    alt="Receipt" 
                    className="w-full h-auto object-contain bg-black/5" 
                  />
                  
                  <motion.div 
                    className="absolute top-2 right-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button 
                      size="icon" 
                      variant="destructive" 
                      className="rounded-full h-8 w-8"
                      onClick={clearImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                  
                  {isProcessing && (
                    <motion.div 
                      className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="w-32 h-2 bg-muted rounded-full mb-4 overflow-hidden">
                        <motion.div 
                          className="h-full bg-primary"
                          initial={{ width: "0%" }}
                          animate={{ width: `${processingProgress}%` }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Scanning receipt...
                      </p>
                    </motion.div>
                  )}
                </motion.div>
                
                {!scanResults ? (
                  <Button 
                    className="w-full"
                    disabled={isProcessing}
                    onClick={processImage}
                  >
                    {isProcessing ? "Processing..." : "Process Receipt"}
                  </Button>
                ) : (
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="p-4 space-y-3">
                      <h3 className="font-medium">Scan Results</h3>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">Merchant</span>
                          <span className="font-medium truncate">{scanResults.merchantName}</span>
                        </div>
                        
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">Amount</span>
                          <span className="font-medium">{scanResults.total} {scanResults.currency}</span>
                        </div>
                        
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">Date</span>
                          <span className="font-medium">{scanResults.date}</span>
                        </div>
                        
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">Items</span>
                          <span className="font-medium">{scanResults.items.length}</span>
                        </div>
                      </div>
                      
                      {scanResults.items.length > 0 && (
                        <div className="mt-2">
                          <h4 className="text-sm font-medium mb-1">Items:</h4>
                          <div className="max-h-32 overflow-y-auto text-xs space-y-1">
                            {scanResults.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between p-1 odd:bg-muted/30 rounded">
                                <span>{item.name}</span>
                                <span>{item.price}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                    
                    <div className="space-y-3">
                      <Label htmlFor="category">Expense Category</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {categories.map((category) => (
                          <motion.button
                            key={category}
                            className={`p-2 rounded-md text-xs flex flex-col items-center justify-center ${
                              selectedCategory === category 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                            }`}
                            onClick={() => {
                              setSelectedCategory(category);
                              triggerHapticFeedback('info');
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <span className="capitalize">{category}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full"
                      onClick={saveAsExpense}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Save as Expense
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </TabsContent>
        
        {/* HISTORY TAB */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Receipt History</h3>
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                className="flex gap-1 items-center text-xs h-8"
                onClick={handleExportCSV}
                disabled={receipts.length === 0}
              >
                <FileText className="h-3 w-3" />
                CSV
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                className="flex gap-1 items-center text-xs h-8"
                onClick={handleExportExcel}
                disabled={receipts.length === 0}
              >
                <FileSpreadsheet className="h-3 w-3" />
                Excel
              </Button>
            </div>
          </div>
          
          {receipts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No receipt history yet</p>
              <p className="text-sm mt-1">Scan receipts to build your history</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              <AnimatePresence>
                {receipts.map((receipt, index) => (
                  <motion.div
                    key={receipt.id}
                    className="p-3 border border-border rounded-lg bg-card relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                    {...receiptStackAnimation(index)}
                  >
                    <div className="flex gap-3">
                      {receipt.imageUrl && (
                        <div className="w-14 h-14 rounded bg-muted flex-shrink-0 overflow-hidden">
                          <img 
                            src={receipt.imageUrl} 
                            alt="Receipt" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{receipt.merchantName}</h4>
                        <p className="text-muted-foreground text-xs">{receipt.date}</p>
                        <p className="font-medium text-sm mt-1">
                          {receipt.total} {receipt.currency}
                        </p>
                      </div>
                      
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          deleteReceipt(receipt.id);
                          setReceipts(prev => prev.filter(r => r.id !== receipt.id));
                          triggerHapticFeedback('warning');
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
        
        {/* BATCH TAB */}
        <TabsContent value="batch" className="space-y-4">
          <Card className="p-6">
            <div className="flex flex-col gap-4">
              <h3 className="font-medium">Batch Receipt Processing</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Upload multiple receipts and process them in one go.
              </p>
              
              {isBatchProcessing ? (
                <>
                  <div className="flex flex-wrap gap-2">
                    {batchImages.map((image, idx) => (
                      <div 
                        key={idx} 
                        className="w-16 h-16 rounded bg-muted relative overflow-hidden"
                      >
                        <img 
                          src={image} 
                          alt={`Batch ${idx}`} 
                          className="w-full h-full object-cover"
                        />
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-0 right-0 h-6 w-6 rounded-full"
                          onClick={() => {
                            setBatchImages(prev => prev.filter((_, i) => i !== idx));
                            triggerHapticFeedback('warning');
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    
                    <Button
                      className="w-16 h-16 bg-muted hover:bg-muted/80 text-muted-foreground"
                      variant="ghost"
                      onClick={uploadBatch}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  {isProcessing ? (
                    <div className="w-full space-y-2">
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-primary"
                          initial={{ width: "0%" }}
                          animate={{ width: `${processingProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-center text-muted-foreground">
                        Processing {processingProgress}%
                      </p>
                    </div>
                  ) : (
                    <>
                      <Button
                        className="w-full"
                        onClick={processBatchImages}
                        disabled={batchImages.length === 0}
                      >
                        Process {batchImages.length} Receipt{batchImages.length !== 1 ? 's' : ''}
                      </Button>
                      
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => {
                          setIsBatchProcessing(false);
                          setBatchImages([]);
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Button 
                    className="w-full py-8 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-900 dark:text-amber-200 border border-dashed border-amber-200 dark:border-amber-800"
                    variant="outline"
                    onClick={uploadBatch}
                  >
                    <Gift className="mr-2 h-5 w-5" />
                    Select Multiple Receipts
                  </Button>
                  
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple
                    ref={batchInputRef} 
                    onChange={handleBatchUpload} 
                    className="hidden" 
                  />
                </>
              )}
            </div>
          </Card>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Batch processing allows you to process up to 10 receipts at once.
            </p>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Camera Component */}
      <AnimatePresence>
        {showCamera && (
          <CameraComponent 
            onCapture={handleCameraCapture} 
            onClose={() => setShowCamera(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
