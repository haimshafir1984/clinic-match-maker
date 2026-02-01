import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, UserRound, Briefcase, MapPin, Calendar, Banknote, Clock } from "lucide-react";

type Profile = Tables<"profiles">;

interface ProfileViewProps {
  profile: Profile;
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

export function ProfileView({ profile }: ProfileViewProps) {
  const isClinic = profile.role === "clinic";
  const RoleIcon = isClinic ? Building2 : UserRound;

  const availabilityDays = profile.availability_days
    ?.map((day) => dayLabels[day] || day)
    .join(", ");

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10">
                <RoleIcon className="w-10 h-10 text-primary" />
              </AvatarFallback>
            </Avatar>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold">{profile.name}</h2>
                <Badge variant={isClinic ? "default" : "secondary"}>
                  {isClinic ? "מרפאה" : "עובד/ת"}
                </Badge>
              </div>
              
              {(profile.position || profile.required_position) && (
                <p className="text-muted-foreground flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {isClinic ? profile.required_position : profile.position}
                </p>
              )}
              
              {profile.experience_years && profile.experience_years > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {profile.experience_years} שנות ניסיון
                </p>
              )}
            </div>
          </div>

          {profile.description && (
            <p className="text-muted-foreground mt-4 text-sm">
              {profile.description}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Location */}
      {(profile.city || profile.preferred_area) && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              מיקום
            </h3>
            <p>{profile.city || profile.preferred_area}</p>
            {profile.radius_km && (
              <p className="text-sm text-muted-foreground">
                רדיוס חיפוש: {profile.radius_km} ק"מ
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Availability */}
      {(availabilityDays || profile.availability_date || profile.availability_hours) && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              זמינות
            </h3>
            
            {availabilityDays && (
              <p className="mb-2">{availabilityDays}</p>
            )}
            
            {profile.availability_hours && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {profile.availability_hours}
              </p>
            )}
            
            {profile.availability_date && (
              <p className="text-sm text-muted-foreground mt-2">
                תאריך התחלה: {new Date(profile.availability_date).toLocaleDateString("he-IL")}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Salary */}
      {(profile.salary_min || profile.salary_max || profile.job_type) && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Banknote className="w-4 h-4 text-primary" />
              {isClinic ? "תנאי העסקה" : "ציפיות שכר"}
            </h3>
            
            {(profile.salary_min || profile.salary_max) && (
              <p className="mb-2">
                {profile.salary_min && profile.salary_max
                  ? `₪${profile.salary_min.toLocaleString()} - ₪${profile.salary_max.toLocaleString()}`
                  : profile.salary_min
                  ? `מ-₪${profile.salary_min.toLocaleString()}`
                  : `עד ₪${profile.salary_max?.toLocaleString()}`}
              </p>
            )}
            
            {profile.job_type && (
              <Badge variant="outline">
                {jobTypeLabels[profile.job_type]}
              </Badge>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
