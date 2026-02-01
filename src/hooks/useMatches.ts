import { useQuery } from "@tanstack/react-query";
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

export function useMatches() {
  const { data: myProfile } = useProfile();

  const query = useQuery({
    queryKey: ["matches", myProfile?.id],
    queryFn: async () => {
      if (!myProfile) return [];

      // Get matches where I'm either user1 or user2
      const { data: matches, error } = await supabase
        .from("matches")
        .select("*")
        .or(`user1_id.eq.${myProfile.id},user2_id.eq.${myProfile.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!matches) return [];

      // Get other user's profiles
      const otherUserIds = matches.map((m) =>
        m.user1_id === myProfile.id ? m.user2_id : m.user1_id
      );

      if (otherUserIds.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, role, position, required_position, city")
        .in("id", otherUserIds);

      if (profilesError) throw profilesError;

      const profilesMap = new Map(profiles?.map((p) => [p.id, p]));

      return matches.map((m) => {
        const otherId = m.user1_id === myProfile.id ? m.user2_id : m.user1_id;
        return {
          ...m,
          other_profile: profilesMap.get(otherId)!,
        };
      }) as MatchWithProfile[];
    },
    enabled: !!myProfile,
  });

  return {
    matches: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
