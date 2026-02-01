import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";

export function useLike() {
  const queryClient = useQueryClient();
  const { data: myProfile } = useProfile();

  const likeMutation = useMutation({
    mutationFn: async ({ toUserId, isLike }: { toUserId: string; isLike: boolean }) => {
      if (!myProfile) throw new Error("No profile");

      const { error } = await supabase.from("likes").insert({
        from_user_id: myProfile.id,
        to_user_id: toUserId,
        is_like: isLike,
      });

      if (error) throw error;

      // Check if there's a match (mutual like)
      if (isLike) {
        const { data: match } = await supabase
          .from("matches")
          .select("id")
          .or(
            `and(user1_id.eq.${myProfile.id},user2_id.eq.${toUserId}),and(user1_id.eq.${toUserId},user2_id.eq.${myProfile.id})`
          )
          .maybeSingle();

        return { isMatch: !!match };
      }

      return { isMatch: false };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["swipe-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });

  const like = async (toUserId: string) => {
    const result = await likeMutation.mutateAsync({ toUserId, isLike: true });
    return result.isMatch;
  };

  const pass = async (toUserId: string) => {
    await likeMutation.mutateAsync({ toUserId, isLike: false });
  };

  return {
    like,
    pass,
    isLiking: likeMutation.isPending,
  };
}
