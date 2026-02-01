import { AppLayout } from "@/components/layout/AppLayout";
import { useMatches } from "@/hooks/useMatches";
import { MatchCard } from "@/components/matches/MatchCard";
import { Loader2, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function Matches() {
  const { matches, isLoading } = useMatches();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const activeMatches = matches?.filter((m) => !m.is_closed) || [];
  const closedMatches = matches?.filter((m) => m.is_closed) || [];

  return (
    <AppLayout>
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">ההתאמות שלי</h1>

        {activeMatches.length === 0 && closedMatches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">אין התאמות עדיין</h3>
            <p className="text-muted-foreground">
              המשך לגלוש בפרופילים כדי למצוא התאמות!
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Active Matches */}
            {activeMatches.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-muted-foreground mb-3">
                  התאמות פעילות ({activeMatches.length})
                </h2>
                <div className="space-y-3">
                  {activeMatches.map((match, index) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <MatchCard match={match} />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Closed Matches */}
            {closedMatches.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-muted-foreground mb-3">
                  התאמות שנסגרו ({closedMatches.length})
                </h2>
                <div className="space-y-3 opacity-60">
                  {closedMatches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
