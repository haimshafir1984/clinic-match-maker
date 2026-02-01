import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Building2, UserRound, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";

interface MatchCardProps {
  match: {
    id: string;
    created_at: string;
    is_closed: boolean;
    other_profile: {
      id: string;
      name: string;
      avatar_url: string | null;
      role: string;
      position?: string | null;
      required_position?: string | null;
      city?: string | null;
    };
  };
}

export function MatchCard({ match }: MatchCardProps) {
  const { other_profile } = match;
  const isClinic = other_profile.role === "clinic";
  const RoleIcon = isClinic ? Building2 : UserRound;

  return (
    <Link to={`/chat/${match.id}`}>
      <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
        <div className="flex items-center gap-4">
          <Avatar className="w-14 h-14">
            <AvatarImage src={other_profile.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10">
              <RoleIcon className="w-6 h-6 text-primary" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground truncate">
                {other_profile.name}
              </h3>
              <Badge variant={isClinic ? "default" : "secondary"} className="text-xs">
                {isClinic ? "מרפאה" : "עובד/ת"}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground truncate">
              {isClinic ? other_profile.required_position : other_profile.position}
              {other_profile.city && ` • ${other_profile.city}`}
            </p>

            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Calendar className="w-3 h-3" />
              <span>
                התאמה {formatDistanceToNow(new Date(match.created_at), { 
                  addSuffix: true, 
                  locale: he 
                })}
              </span>
            </div>
          </div>

          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
