import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { SwipeCard } from "@/components/swipe/SwipeCard";
import { SwipeActions } from "@/components/swipe/SwipeActions";
import { EmptyState } from "@/components/swipe/EmptyState";
import { MatchCelebration } from "@/components/swipe/MatchCelebration";
import { useSwipeProfiles, useSwipe } from "@/hooks/useSwipeProfiles";
import { MatchCardData } from "@/types";
import { Loader2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function Swipe() {
  const navigate = useNavigate();
  const { profiles, isLoading, refetch } = useSwipeProfiles();
  const { like, pass, isLoading: isSwipeLoading } = useSwipe();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [showMatchCelebration, setShowMatchCelebration] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<MatchCardData | null>(null);
  const [lastMatchId, setLastMatchId] = useState<string | null>(null);

  const currentProfile = profiles[currentIndex];
  const hasMoreProfiles = currentIndex < profiles.length;

  const handleLike = async () => {
    if (!currentProfile || isSwipeLoading) return;
    
    setDirection("right");
    
    try {
      const result = await like(currentProfile.id);
      
      setTimeout(() => {
        setDirection(null);
        setCurrentIndex((prev) => prev + 1);
        
        if (result.isMatch) {
          // Show Match Celebration overlay
          setMatchedProfile(currentProfile);
          setLastMatchId(result.matchId || null);
          setShowMatchCelebration(true);
        }
      }, 300);
    } catch (error) {
      toast.error("שגיאה בשליחת הלייק");
      setDirection(null);
    }
  };

  const handlePass = async () => {
    if (!currentProfile || isSwipeLoading) return;
    
    setDirection("left");
    
    try {
      await pass(currentProfile.id);
      
      setTimeout(() => {
        setDirection(null);
        setCurrentIndex((prev) => prev + 1);
      }, 300);
    } catch (error) {
      toast.error("שגיאה");
      setDirection(null);
    }
  };

  const handleRefresh = () => {
    setCurrentIndex(0);
    refetch();
  };

  const handleChatWithMatch = () => {
    setShowMatchCelebration(false);
    if (lastMatchId) {
      navigate(`/chat/${lastMatchId}`);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">מחפש פרופילים...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-5rem)] max-w-md mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-foreground">גלישה</h1>
          <p className="text-sm text-muted-foreground">
            החלק ימינה ללייק, שמאלה לדלג
          </p>
        </div>

        {/* Card Stack */}
        <div className="flex-1 relative">
          <AnimatePresence mode="popLayout">
            {hasMoreProfiles && currentProfile ? (
              <SwipeCard
                key={currentProfile.id}
                profile={currentProfile}
                direction={direction}
                onSwipeLeft={handlePass}
                onSwipeRight={handleLike}
              />
            ) : (
              <EmptyState onRefresh={handleRefresh} />
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        {hasMoreProfiles && (
          <SwipeActions
            onPass={handlePass}
            onLike={handleLike}
            disabled={isSwipeLoading}
          />
        )}
      </div>

      {/* Match Celebration Overlay */}
      <MatchCelebration
        isOpen={showMatchCelebration}
        matchedProfile={matchedProfile}
        onClose={() => setShowMatchCelebration(false)}
        onChat={handleChatWithMatch}
      />
    </AppLayout>
  );
}
