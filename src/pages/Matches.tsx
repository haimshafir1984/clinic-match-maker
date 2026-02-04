import { AppLayout } from "@/components/layout/AppLayout";
import { useMatches } from "@/hooks/useMatches";
import { MatchCard } from "@/components/matches/MatchCard";
import { LoadingState } from "@/components/ui/loading-state";
import { Heart, Users, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Matches() {
  const { matches, isLoading } = useMatches();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <LoadingState message="טוען התאמות..." />
        </div>
      </AppLayout>
    );
  }

  const activeMatches = matches.filter((m) => !m.isClosed);
  const closedMatches = matches.filter((m) => m.isClosed);

  return (
    <AppLayout>
      <div className="p-4 max-w-md mx-auto pb-24">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">ההתאמות שלי</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activeMatches.length > 0 
              ? `יש לכם ${activeMatches.length} התאמות פעילות – צרו קשר!`
              : "עדיין אין התאמות – המשיכו לגלוש"}
          </p>
        </div>

        {activeMatches.length === 0 && closedMatches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <motion.div 
              className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <Heart className="w-12 h-12 text-primary" />
            </motion.div>
            
            <h3 className="text-xl font-semibold mb-2">עוד לא נוצרו התאמות</h3>
            <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
              גלשו בפרופילים וסמנו עניין – כשגם הצד השני יסמן, תיווצר התאמה!
            </p>
            
            <Link to="/swipe">
              <Button className="gap-2">
                גלו התאמות חדשות
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Active Matches */}
            {activeMatches.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-medium text-muted-foreground">
                    התאמות פעילות ({activeMatches.length})
                  </h2>
                </div>
                <div className="space-y-3">
                  {activeMatches.map((match, index) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
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
