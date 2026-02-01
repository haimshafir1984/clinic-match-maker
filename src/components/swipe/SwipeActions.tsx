import { motion } from "framer-motion";
import { X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SwipeActionsProps {
  onPass: () => void;
  onLike: () => void;
  disabled?: boolean;
}

export function SwipeActions({ onPass, onLike, disabled }: SwipeActionsProps) {
  return (
    <div className="flex items-center justify-center gap-6 py-4">
      <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}>
        <Button
          size="lg"
          variant="outline"
          className="w-16 h-16 rounded-full border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={onPass}
          disabled={disabled}
        >
          <X className="w-8 h-8" />
        </Button>
      </motion.div>

      <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}>
        <Button
          size="lg"
          className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90"
          onClick={onLike}
          disabled={disabled}
        >
          <Heart className="w-10 h-10 fill-current" />
        </Button>
      </motion.div>
    </div>
  );
}
