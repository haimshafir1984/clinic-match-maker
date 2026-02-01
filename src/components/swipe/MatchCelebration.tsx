import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, PartyPopper, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatchCardData } from "@/types";

interface MatchCelebrationProps {
  isOpen: boolean;
  matchedProfile: MatchCardData | null;
  onClose: () => void;
  onChat: () => void;
}

export function MatchCelebration({ isOpen, matchedProfile, onClose, onChat }: MatchCelebrationProps) {
  if (!isOpen || !matchedProfile) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-card rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Celebration Icon */}
          <motion.div
            animate={{ 
              rotate: [0, -10, 10, -10, 10, 0],
              scale: [1, 1.1, 1, 1.1, 1]
            }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mb-4"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-success flex items-center justify-center mx-auto">
              <PartyPopper className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          {/* Hearts Animation */}
          <div className="relative">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 0, x: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  y: -100 - Math.random() * 50,
                  x: (Math.random() - 0.5) * 100
                }}
                transition={{ 
                  duration: 1.5,
                  delay: 0.3 + i * 0.1,
                  ease: "easeOut"
                }}
                className="absolute top-0 left-1/2 -translate-x-1/2"
              >
                <Heart className="w-6 h-6 text-destructive fill-destructive" />
              </motion.div>
            ))}
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-2">
            יש התאמה! 🎉
          </h2>
          
          <p className="text-muted-foreground mb-6">
            התאמת עם <span className="font-semibold text-foreground">{matchedProfile.name}</span>!
            <br />
            עכשיו אתם יכולים להתחיל לדבר
          </p>

          <div className="flex flex-col gap-3">
            <Button 
              size="lg" 
              className="w-full gap-2"
              onClick={onChat}
            >
              <Heart className="w-5 h-5" />
              שלח הודעה
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full"
              onClick={onClose}
            >
              המשך לגלוש
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
