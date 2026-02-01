import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";
import { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

export function useSwipeProfiles() {
  const { data: myProfile } = useProfile();

  const query = useQuery({
    queryKey: ["swipe-profiles", myProfile?.id, myProfile?.role],
    queryFn: async () => {
      if (!myProfile) return [];

      // Get profiles that I haven't liked/passed yet
      const { data: likedProfiles } = await supabase
        .from("likes")
        .select("to_user_id")
        .eq("from_user_id", myProfile.id);

      const likedIds = likedProfiles?.map((l) => l.to_user_id) || [];

      // Get opposite role profiles
      const oppositeRole = myProfile.role === "clinic" ? "worker" : "clinic";

      let query = supabase
        .from("profiles")
        .select("*")
        .eq("role", oppositeRole)
        .neq("id", myProfile.id);

      // Exclude already liked/passed profiles
      if (likedIds.length > 0) {
        query = query.not("id", "in", `(${likedIds.join(",")})`);
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;
      return data as Profile[];
    },
    enabled: !!myProfile,
  });

  return {
    profiles: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
