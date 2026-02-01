import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";

interface MatchWithProfile {
  id: string;
  created_at: string;
  is_closed: boolean;
  user1_id: string;
  user2_id: string;
  other_profile: {
    id: string;
    name: string;
    avatar_url: string | null;
    role: string;
    position: string | null;
    required_position: string | null;
    city: string | null;
  };
}

export function useMatchDetails(matchId: string) {
  const queryClient = useQueryClient();
  const { data: myProfile } = useProfile();

  const query = useQuery({
    queryKey: ["match", matchId],
    queryFn: async () => {
      if (!myProfile) return null;

      const { data: match, error } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchId)
        .single();

      if (error) throw error;
      if (!match) return null;

      const otherId = match.user1_id === myProfile.id ? match.user2_id : match.user1_id;

      const { data: otherProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, role, position, required_position, city")
        .eq("id", otherId)
        .single();

      if (profileError) throw profileError;

      return {
        ...match,
        other_profile: otherProfile,
      } as MatchWithProfile;
    },
    enabled: !!matchId && !!myProfile,
  });

  const closeMutation = useMutation({
    mutationFn: async () => {
      if (!myProfile) throw new Error("No profile");

      const { error } = await supabase
        .from("matches")
        .update({ is_closed: true, closed_by: myProfile.id })
        .eq("id", matchId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });

  return {
    match: query.data,
    isLoading: query.isLoading,
    closeMatch: closeMutation.mutateAsync,
  };
}
