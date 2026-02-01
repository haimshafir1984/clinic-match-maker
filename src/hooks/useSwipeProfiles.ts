import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getFeed, postSwipe } from "@/lib/api";
import { MatchCardData, SwipeType } from "@/types";

export function useSwipeProfiles() {
  const { currentUser } = useAuth();

  const query = useQuery({
    queryKey: ["swipe-profiles", currentUser?.profileId, currentUser?.role],
    queryFn: async () => {
      if (!currentUser) return [];
      return getFeed(currentUser);
    },
    enabled: !!currentUser?.profileId,
  });

  return {
    profiles: query.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useSwipe() {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  const swipeMutation = useMutation({
    mutationFn: async ({ targetId, type }: { targetId: string; type: SwipeType }) => {
      if (!currentUser?.profileId) throw new Error("No profile");

      return postSwipe({
        swiperId: currentUser.profileId,
        swipedId: targetId,
        type,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["swipe-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });

  const like = async (targetId: string) => {
    const result = await swipeMutation.mutateAsync({ targetId, type: "LIKE" });
    return {
      isMatch: result.isMatch,
      matchId: result.matchId,
    };
  };

  const pass = async (targetId: string) => {
    await swipeMutation.mutateAsync({ targetId, type: "PASS" });
  };

  return {
    like,
    pass,
    isLoading: swipeMutation.isPending,
  };
}
