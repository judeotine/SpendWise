
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getStorageUsage } from "@/lib/storage";
import { motion } from "framer-motion";

export const StorageUsageTab = () => {
  const [storageUsage, setStorageUsage] = useState<{
    used: number;
    total: number;
    items: Record<string, number>;
  }>({
    used: 0,
    total: 5 * 1024 * 1024, // 5MB default
    items: {}
  });
  
  useEffect(() => {
    const usage = getStorageUsage();
    setStorageUsage(usage);
  }, []);
  
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    else return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };
  
  // Calculate percentages for visualization
  const usedPercentage = (storageUsage.used / storageUsage.total) * 100;
  const freePercentage = 100 - usedPercentage;
  
  // Prepare item data for display
  const itemDetails = Object.entries(storageUsage.items).map(([key, size]) => ({
    key: key.replace('spendwise-', ''),
    size,
    percentage: (size / storageUsage.used) * 100
  }));
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">Storage Usage</h3>
        
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span>Used: {formatSize(storageUsage.used)}</span>
            <span>Free: {formatSize(storageUsage.total - storageUsage.used)}</span>
          </div>
          <Progress value={usedPercentage} />
          <div className="text-xs text-muted-foreground">
            {usedPercentage.toFixed(1)}% of {formatSize(storageUsage.total)} used
          </div>
        </div>
        
        <h4 className="font-medium mb-2">Storage Breakdown</h4>
        <div className="space-y-3">
          {itemDetails.map((item) => (
            <div key={item.key} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="capitalize">{item.key}</span>
                <span>{formatSize(item.size)}</span>
              </div>
              <Progress value={item.percentage} className="h-1.5" />
            </div>
          ))}
        </div>
      </Card>
      
      <div className="text-sm text-muted-foreground mb-4">
        <p>Storage usage shows the amount of local storage being used by the app on your device.</p>
        <p className="mt-2">Data is stored only on your device and is not transferred to any server.</p>
      </div>
    </motion.div>
  );
};
