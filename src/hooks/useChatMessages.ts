import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";
import { Tables } from "@/integrations/supabase/types";

type Message = Tables<"messages">;

export function useChatMessages(matchId: string) {
  const queryClient = useQueryClient();
  const { data: myProfile } = useProfile();

  const query = useQuery({
    queryKey: ["messages", matchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!matchId,
  });

  // Real-time subscription
  useEffect(() => {
    if (!matchId) return;

    const channel = supabase
      .channel(`messages:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          queryClient.setQueryData(
            ["messages", matchId],
            (old: Message[] | undefined) => {
              if (!old) return [payload.new as Message];
              // Avoid duplicates
              const exists = old.some((m) => m.id === (payload.new as Message).id);
              if (exists) return old;
              return [...old, payload.new as Message];
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, queryClient]);

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!myProfile) throw new Error("No profile");

      const { error } = await supabase.from("messages").insert({
        match_id: matchId,
        sender_id: myProfile.id,
        content,
      });

      if (error) throw error;
    },
  });

  return {
    messages: query.data,
    isLoading: query.isLoading,
    sendMessage: sendMutation.mutateAsync,
  };
}
