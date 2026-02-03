import { motion } from "framer-motion";
import { SearchX, RefreshCw, Sparkles, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onRefresh: () => void;
}

export function EmptyState({ onRefresh }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full flex flex-col items-center justify-center text-center p-8"
    >
      {/* Animated Icon */}
      <motion.div 
        className="relative mb-6"
        initial={{ y: 0 }}
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <Coffee className="w-12 h-12 text-primary" />
        </div>
        <motion.div 
          className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Sparkles className="w-4 h-4 text-primary" />
        </motion.div>
      </motion.div>
      
      <h3 className="text-xl font-semibold text-foreground mb-2">
        הספקת לעבור על כולם! ☕
      </h3>
      <p className="text-muted-foreground mb-6 max-w-xs leading-relaxed">
        כל הכבוד! עברת על כל הפרופילים הזמינים כרגע. 
        חזור מאוחר יותר לגלות התאמות חדשות.
      </p>
      
      <div className="space-y-3">
        <Button onClick={onRefresh} className="gap-2 w-full">
          <RefreshCw className="w-4 h-4" />
          בדוק פרופילים חדשים
        </Button>
        
        <p className="text-xs text-muted-foreground">
          💡 טיפ: עדכון הפרופיל שלך יכול לשפר את ההתאמות
        </p>
      </div>
    </motion.div>
  );
}
