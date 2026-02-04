import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { SwipeCard } from "@/components/swipe/SwipeCard";
import { SwipeActions } from "@/components/swipe/SwipeActions";
import { EmptyState } from "@/components/swipe/EmptyState";
import { MatchCelebration } from "@/components/swipe/MatchCelebration";
import { useSwipeProfiles, useSwipe } from "@/hooks/useSwipeProfiles";
import { useAuth } from "@/contexts/AuthContext";
import { MatchCardData } from "@/types";
import { Loader2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function Swipe() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { profiles, isLoading, isError, error, refetch } = useSwipeProfiles();
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

  if (isError) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="flex flex-col items-center gap-4 text-center px-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">שגיאה בטעינת הפרופילים</h2>
            <p className="text-muted-foreground max-w-sm">
              {error instanceof Error ? error.message : "לא הצלחנו לטעון את הפרופילים. נסה שוב."}
            </p>
            <button
              onClick={() => refetch()}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              נסה שוב
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-9rem)] max-w-md mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-foreground">גלו התאמות</h1>
          <p className="text-sm text-muted-foreground">
            החליקו ימינה לסימון עניין, שמאלה לדילוג
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
        currentUser={currentUser}
        onClose={() => setShowMatchCelebration(false)}
        onChat={handleChatWithMatch}
      />
    </AppLayout>
  );
}
