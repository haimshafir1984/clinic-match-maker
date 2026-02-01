import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SwipeCard } from "@/components/swipe/SwipeCard";
import { SwipeActions } from "@/components/swipe/SwipeActions";
import { EmptyState } from "@/components/swipe/EmptyState";
import { useSwipeProfiles } from "@/hooks/useSwipeProfiles";
import { useLike } from "@/hooks/useLike";
import { Loader2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function Swipe() {
  const { profiles, isLoading, refetch } = useSwipeProfiles();
  const { like, pass, isLiking } = useLike();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);

  const currentProfile = profiles?.[currentIndex];
  const hasMoreProfiles = profiles && currentIndex < profiles.length;

  const handleLike = async () => {
    if (!currentProfile || isLiking) return;
    
    setDirection("right");
    const isMatch = await like(currentProfile.id);
    
    setTimeout(() => {
      setDirection(null);
      setCurrentIndex((prev) => prev + 1);
      
      if (isMatch) {
        toast.success("🎉 יש התאמה!", {
          description: `התאמת עם ${currentProfile.name}!`,
        });
      }
    }, 300);
  };

  const handlePass = async () => {
    if (!currentProfile || isLiking) return;
    
    setDirection("left");
    await pass(currentProfile.id);
    
    setTimeout(() => {
      setDirection(null);
      setCurrentIndex((prev) => prev + 1);
    }, 300);
  };

  const handleRefresh = () => {
    setCurrentIndex(0);
    refetch();
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
            disabled={isLiking}
          />
        )}
      </div>
    </AppLayout>
  );
}
