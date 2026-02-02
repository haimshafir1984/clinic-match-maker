import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateProfile, useUpdateProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Building2, UserRound } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Profile = Tables<"profiles">;
type UserRole = "clinic" | "worker";
type JobType = "daily" | "temporary" | "permanent";

const days = [
  { value: "sunday", label: "ראשון" },
  { value: "monday", label: "שני" },
  { value: "tuesday", label: "שלישי" },
  { value: "wednesday", label: "רביעי" },
  { value: "thursday", label: "חמישי" },
  { value: "friday", label: "שישי" },
  { value: "saturday", label: "שבת" },
];

const professionOptions = [
  "רופא שיניים",
  "רופא עיניים",
  "אופטומטריסט",
  "שיננית",
  "פלסטיקאי",
  "רופא מזריק",
  "קלינאי תקשורת",
  "מזכירה רפואית",
];

const businessTypeOptions = [
  "מרפאת שיניים",
  "מרפאת עיניים",
  "מרפאת אסתטיקה",
  "קלינאי תקשורת",
  "אחר",
];

const profileSchema = z.object({
  name: z.string().min(2, "שם חייב להכיל לפחות 2 תווים"),
  role: z.enum(["clinic", "worker"]),
  position: z.string().optional(),
  required_position: z.string().optional(),
  description: z.string().optional(),
  city: z.string().optional(),
  preferred_area: z.string().optional(),
  radius_km: z.number().min(1).max(100).optional(),
  experience_years: z.number().min(0).max(50).optional(),
  availability_date: z.string().optional(),
  availability_days: z.array(z.string()).optional(),
  availability_hours: z.string().optional(),
  salary_min: z.number().min(0).optional(),
  salary_max: z.number().min(0).optional(),
  job_type: z.enum(["daily", "temporary", "permanent"]).optional(),
});

type FormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData?: Profile | null;
  onSuccess: () => void;
}

export function ProfileForm({ initialData, onSuccess }: ProfileFormProps) {
  const [role, setRole] = useState<UserRole | null>(
    initialData?.role || (localStorage.getItem("pendingRole") as UserRole | null)
  );
  
  const createProfile = useCreateProfile();
  const updateProfile = useUpdateProfile();
  const isEditing = !!initialData;

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialData?.name || "",
      role: initialData?.role || role || undefined,
      position: initialData?.position || "",
      required_position: initialData?.required_position || "",
      description: initialData?.description || "",
      city: initialData?.city || "",
      preferred_area: initialData?.preferred_area || "",
      radius_km: initialData?.radius_km || 10,
      experience_years: initialData?.experience_years || 0,
      availability_date: initialData?.availability_date || "",
      availability_days: initialData?.availability_days || [],
      availability_hours: initialData?.availability_hours || "",
      salary_min: initialData?.salary_min || undefined,
      salary_max: initialData?.salary_max || undefined,
      job_type: initialData?.job_type || undefined,
    },
  });

  const selectedDays = watch("availability_days") || [];
  const currentRole = watch("role") || role;

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing) {
        await updateProfile.mutateAsync(data);
        toast.success("הפרופיל עודכן בהצלחה!");
      } else {
        // Ensure required fields are present for create
        if (!data.name || !data.role) {
          toast.error("נא למלא את כל השדות הנדרשים");
          return;
        }
        await createProfile.mutateAsync({
          name: data.name,
          role: data.role,
          position: data.position || null,
          required_position: data.required_position || null,
          description: data.description || null,
          city: data.city || null,
          preferred_area: data.preferred_area || null,
          radius_km: data.radius_km || null,
          experience_years: data.experience_years || null,
          availability_date: data.availability_date || null,
          availability_days: data.availability_days || null,
          availability_hours: data.availability_hours || null,
          salary_min: data.salary_min || null,
          salary_max: data.salary_max || null,
          job_type: data.job_type || null,
        });
        localStorage.removeItem("pendingRole");
        toast.success("הפרופיל נוצר בהצלחה!");
      }
      onSuccess();
    } catch (error: any) {
      toast.error("שגיאה", { description: error.message });
    }
  };

  const isLoading = createProfile.isPending || updateProfile.isPending;
  const isClinic = currentRole === "clinic";

  // Role selection for new profiles
  if (!role && !initialData) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">בחר את סוג המשתמש שלך:</p>
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setRole("clinic");
              setValue("role", "clinic");
            }}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-primary/50 transition-all"
          >
            <Building2 className="w-12 h-12 text-primary" />
            <span className="font-semibold">מרפאה</span>
            <span className="text-xs text-muted-foreground text-center">מחפשים עובדים</span>
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setRole("worker");
              setValue("role", "worker");
            }}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-primary/50 transition-all"
          >
            <UserRound className="w-12 h-12 text-primary" />
            <span className="font-semibold">עובד/ת</span>
            <span className="text-xs text-muted-foreground text-center">מחפש/ת עבודה</span>
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <input type="hidden" {...register("role")} value={currentRole || ""} />

      {/* Basic Info */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{isClinic ? "שם המרפאה" : "שם מלא"} *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder={isClinic ? "מרפאת שיניים..." : "ישראל ישראלי"}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={isClinic ? "required_position" : "position"}>
              {isClinic ? "איזה תפקיד אתם מגייסים?" : "מה המקצוע שלך?"}
            </Label>
            <Select
              value={watch(isClinic ? "required_position" : "position") || ""}
              onValueChange={(value) => setValue(isClinic ? "required_position" : "position", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={isClinic ? "בחר תפקיד מבוקש" : "בחר מקצוע"} />
              </SelectTrigger>
              <SelectContent>
                {professionOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isClinic && (
            <div className="space-y-2">
              <Label htmlFor="position">סוג העסק</Label>
              <Select
                value={watch("position") || ""}
                onValueChange={(value) => setValue("position", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר סוג עסק" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {!isClinic && (
            <div className="space-y-2">
              <Label htmlFor="experience_years">שנות ניסיון</Label>
              <Input
                id="experience_years"
                type="number"
                min={0}
                {...register("experience_years", { valueAsNumber: true })}
                placeholder="3"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">תיאור</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder={isClinic 
                ? "ספר על המרפאה, האווירה, והציפיות..." 
                : "ספר על עצמך, הניסיון והיכולות שלך..."}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold">מיקום</h3>
          
          <div className="space-y-2">
            <Label htmlFor={isClinic ? "city" : "preferred_area"}>
              {isClinic ? "עיר" : "אזור מועדף"}
            </Label>
            <Input
              id={isClinic ? "city" : "preferred_area"}
              {...register(isClinic ? "city" : "preferred_area")}
              placeholder={isClinic ? "תל אביב" : "מרכז הארץ"}
            />
          </div>

          {isClinic && (
            <div className="space-y-2">
              <Label htmlFor="radius_km">רדיוס חיפוש (ק"מ)</Label>
              <Input
                id="radius_km"
                type="number"
                min={1}
                max={100}
                {...register("radius_km", { valueAsNumber: true })}
                placeholder="10"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold">זמינות</h3>
          
          <div className="space-y-2">
            <Label>ימים זמינים</Label>
            <div className="flex flex-wrap gap-2">
              {days.map((day) => (
                <label
                  key={day.value}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors",
                    selectedDays.includes(day.value)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:border-primary/50"
                  )}
                >
                  <Checkbox
                    checked={selectedDays.includes(day.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setValue("availability_days", [...selectedDays, day.value]);
                      } else {
                        setValue("availability_days", selectedDays.filter((d) => d !== day.value));
                      }
                    }}
                    className="sr-only"
                  />
                  <span className="text-sm">{day.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability_hours">שעות</Label>
            <Input
              id="availability_hours"
              {...register("availability_hours")}
              placeholder="08:00 - 16:00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability_date">תאריך התחלה</Label>
            <Input
              id="availability_date"
              type="date"
              {...register("availability_date")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Salary & Job Type */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold">{isClinic ? "תנאי העסקה" : "ציפיות שכר"}</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary_min">
                {isClinic ? "שכר מינימום (₪)" : "שכר מינימלי (₪)"}
              </Label>
              <Input
                id="salary_min"
                type="number"
                min={0}
                {...register("salary_min", { valueAsNumber: true })}
                placeholder="5000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary_max">
                {isClinic ? "שכר מקסימום (₪)" : "שכר מקסימלי (₪)"}
              </Label>
              <Input
                id="salary_max"
                type="number"
                min={0}
                {...register("salary_max", { valueAsNumber: true })}
                placeholder="15000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>סוג משרה</Label>
            <Select
              value={watch("job_type") || ""}
              onValueChange={(value) => setValue("job_type", value as JobType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר סוג משרה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">יומי</SelectItem>
                <SelectItem value="temporary">זמני</SelectItem>
                <SelectItem value="permanent">קבוע</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin ml-2" />
            שומר...
          </>
        ) : isEditing ? (
          "עדכן פרופיל"
        ) : (
          "צור פרופיל"
        )}
      </Button>
    </form>
  );
}
