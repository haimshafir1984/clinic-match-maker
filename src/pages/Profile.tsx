import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ProfileView } from "@/components/profile/ProfileView";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, Edit2 } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const { signOut, refreshCurrentUser } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success("להתראות!");
    navigate("/login");
  };

  const handleProfileSuccess = async () => {
    setIsEditing(false);
    // Refresh the current user context after profile changes
    await refreshCurrentUser();
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  // No profile yet - show creation form
  if (!profile) {
    return (
      <AppLayout>
        <div className="p-4 max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-2">יצירת פרופיל</h1>
          <p className="text-muted-foreground mb-6">
            מלא את הפרטים כדי להתחיל למצוא התאמות
          </p>
          <ProfileForm onSuccess={handleProfileSuccess} />
        </div>
      </AppLayout>
    );
  }

  // Editing existing profile
  if (isEditing) {
    return (
      <AppLayout>
        <div className="p-4 max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground">עריכת פרופיל</h1>
            <Button variant="ghost" onClick={() => setIsEditing(false)}>
              ביטול
            </Button>
          </div>
          <ProfileForm 
            initialData={profile} 
            onSuccess={handleProfileSuccess} 
          />
        </div>
      </AppLayout>
    );
  }

  // View profile
  return (
    <AppLayout>
      <div className="p-4 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">הפרופיל שלי</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => setIsEditing(true)}>
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleSignOut}
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <ProfileView profile={profile} />
      </div>
    </AppLayout>
  );
}
