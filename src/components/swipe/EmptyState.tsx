import { motion } from "framer-motion";
import { SearchX, RefreshCw } from "lucide-react";
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
      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
        <SearchX className="w-12 h-12 text-muted-foreground" />
      </div>
      
      <h3 className="text-xl font-semibold text-foreground mb-2">
        אין פרופילים נוספים
      </h3>
      <p className="text-muted-foreground mb-6 max-w-xs">
        עברת על כל הפרופילים הזמינים. חזור מאוחר יותר לבדוק אם יש חדשים!
      </p>
      
      <Button onClick={onRefresh} variant="outline" className="gap-2">
        <RefreshCw className="w-4 h-4" />
        רענן פרופילים
      </Button>
    </motion.div>
  );
}
