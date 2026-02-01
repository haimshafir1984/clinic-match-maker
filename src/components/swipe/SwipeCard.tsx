import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Tables } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Calendar, MapPin, Banknote, Clock, Building2, UserRound } from "lucide-react";

type Profile = Tables<"profiles">;

interface SwipeCardProps {
  profile: Profile;
  direction: "left" | "right" | null;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

const jobTypeLabels: Record<string, string> = {
  daily: "יומי",
  temporary: "זמני",
  permanent: "קבוע",
};

const dayLabels: Record<string, string> = {
  sunday: "ראשון",
  monday: "שני",
  tuesday: "שלישי",
  wednesday: "רביעי",
  thursday: "חמישי",
  friday: "שישי",
  saturday: "שבת",
};

export function SwipeCard({ profile, direction, onSwipeLeft, onSwipeRight }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSwipeRight();
    } else if (info.offset.x < -100) {
      onSwipeLeft();
    }
  };

  const variants = {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: direction === "right" 
      ? { x: 300, rotate: 20, opacity: 0 }
      : direction === "left"
      ? { x: -300, rotate: -20, opacity: 0 }
      : { opacity: 0 },
  };

  const isClinic = profile.role === "clinic";
  const RoleIcon = isClinic ? Building2 : UserRound;

  // Format availability days
  const availabilityDays = profile.availability_days
    ?.map((day) => dayLabels[day] || day)
    .join(", ");

  return (
    <motion.div
      className="absolute inset-0"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Like/Pass Overlays */}
      <motion.div
        className="absolute top-8 right-8 z-10 bg-success text-success-foreground px-6 py-2 rounded-lg rotate-12 border-4 border-success font-bold text-xl"
        style={{ opacity: likeOpacity }}
      >
        לייק! ❤️
      </motion.div>
      <motion.div
        className="absolute top-8 left-8 z-10 bg-destructive text-destructive-foreground px-6 py-2 rounded-lg -rotate-12 border-4 border-destructive font-bold text-xl"
        style={{ opacity: passOpacity }}
      >
        דלג ✕
      </motion.div>

      <Card className="h-full overflow-hidden border-0 shadow-2xl">
        {/* Avatar / Image */}
        <div className="relative h-48 bg-gradient-to-br from-primary/20 via-accent to-primary/10 flex items-center justify-center">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
              <RoleIcon className="w-12 h-12 text-primary" />
            </div>
          )}
          
          {/* Role Badge */}
          <Badge 
            className="absolute top-4 right-4"
            variant={isClinic ? "default" : "secondary"}
          >
            {isClinic ? "מרפאה" : "עובד/ת"}
          </Badge>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Name & Position */}
          <div>
            <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
            {(profile.position || profile.required_position) && (
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <Briefcase className="w-4 h-4" />
                <span>{isClinic ? profile.required_position : profile.position}</span>
              </div>
            )}
          </div>

          {/* Key Highlights - 3 Main Points */}
          <div className="grid gap-3">
            {/* Location */}
            {(profile.city || profile.preferred_area) && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">
                    {profile.city || profile.preferred_area}
                  </p>
                  {profile.radius_km && (
                    <p className="text-xs text-muted-foreground">
                      רדיוס {profile.radius_km} ק"מ
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Availability */}
            {(profile.availability_date || availabilityDays) && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">
                    {profile.availability_date 
                      ? new Date(profile.availability_date).toLocaleDateString("he-IL")
                      : availabilityDays}
                  </p>
                  {profile.availability_hours && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {profile.availability_hours}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Salary */}
            {(profile.salary_min || profile.salary_max) && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Banknote className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">
                    {profile.salary_min && profile.salary_max
                      ? `₪${profile.salary_min.toLocaleString()} - ₪${profile.salary_max.toLocaleString()}`
                      : profile.salary_min
                      ? `מ-₪${profile.salary_min.toLocaleString()}`
                      : `עד ₪${profile.salary_max?.toLocaleString()}`}
                  </p>
                  {profile.job_type && (
                    <p className="text-xs text-muted-foreground">
                      {jobTypeLabels[profile.job_type]}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {profile.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {profile.description}
            </p>
          )}

          {/* Experience */}
          {profile.experience_years && profile.experience_years > 0 && (
            <Badge variant="outline" className="text-xs">
              {profile.experience_years} שנות ניסיון
            </Badge>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
