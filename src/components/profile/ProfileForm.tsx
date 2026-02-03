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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CityCombobox } from "@/components/ui/city-combobox";
import { toast } from "sonner";
import { Loader2, Building2, UserRound, User, MapPin, Calendar, Banknote, CheckCircle2, ArrowLeft } from "lucide-react";
import { ProfileFormInput } from "@/hooks/useProfile";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
  name: z.string().min(2, "שם חייב להכיל לפחות 2 תווים").max(50, "שם ארוך מדי"),
  role: z.enum(["clinic", "worker"]),
  position: z.string().optional(),
  required_position: z.string().optional(),
  description: z.string().max(500, "תיאור ארוך מדי (מקסימום 500 תווים)").optional(),
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
}).refine((data) => {
  // Validate salary range
  if (data.salary_min && data.salary_max && data.salary_min > data.salary_max) {
    return false;
  }
  return true;
}, {
  message: "שכר מינימום חייב להיות קטן משכר מקסימום",
  path: ["salary_min"],
});

type FormData = z.infer<typeof profileSchema>;

// Profile type for initial data (matches what API returns)
interface Profile {
  id: string;
  user_id: string;
  name: string;
  role: "clinic" | "worker";
  position?: string | null;
  required_position?: string | null;
  description?: string | null;
  city?: string | null;
  preferred_area?: string | null;
  radius_km?: number | null;
  experience_years?: number | null;
  availability_date?: string | null;
  availability_days?: string[] | null;
  availability_hours?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  job_type?: "daily" | "temporary" | "permanent" | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface ProfileFormProps {
  initialData?: Profile | null;
  onSuccess: () => void;
}

interface FormSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function FormSection({ title, icon, children }: FormSectionProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 bg-muted/30">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {children}
      </CardContent>
    </Card>
  );
}

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

function FormField({ label, required, error, hint, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive mr-1">*</span>}
      </Label>
      {children}
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-destructive flex items-center gap-1"
        >
          {error}
        </motion.p>
      )}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

export function ProfileForm({ initialData, onSuccess }: ProfileFormProps) {
  const [role, setRole] = useState<UserRole | null>(
    initialData?.role || (localStorage.getItem("pendingRole") as UserRole | null)
  );
  
  const createProfile = useCreateProfile();
  const updateProfile = useUpdateProfile();
  const isEditing = !!initialData;

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
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
      } else {
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
      }
      onSuccess();
    } catch (error: any) {
      toast.error("שגיאה בשמירה", { description: error.message });
    }
  };

  const isLoading = createProfile.isPending || updateProfile.isPending || isSubmitting;
  const isClinic = currentRole === "clinic";

  // Role selection for new profiles
  if (!role && !initialData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <p className="text-muted-foreground text-center">בחר את סוג המשתמש שלך:</p>
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setRole("clinic");
              setValue("role", "clinic");
            }}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <span className="font-semibold text-lg">מרפאה</span>
            <span className="text-xs text-muted-foreground text-center">מחפשים עובדים</span>
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setRole("worker");
              setValue("role", "worker");
            }}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <UserRound className="w-8 h-8 text-primary" />
            </div>
            <span className="font-semibold text-lg">עובד/ת</span>
            <span className="text-xs text-muted-foreground text-center">מחפש/ת עבודה</span>
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("role")} value={currentRole || ""} />

      {/* Basic Info */}
      <FormSection title="פרטים בסיסיים" icon={<User className="w-4 h-4 text-primary" />}>
        <FormField 
          label={isClinic ? "שם המרפאה" : "שם מלא"} 
          required 
          error={errors.name?.message}
        >
          <Input
            {...register("name")}
            placeholder={isClinic ? "מרפאת שיניים..." : "ישראל ישראלי"}
            className={cn(errors.name && "border-destructive focus-visible:ring-destructive")}
          />
        </FormField>

        <FormField 
          label={isClinic ? "איזה תפקיד אתם מגייסים?" : "מה המקצוע שלך?"}
          required
          error={isClinic ? errors.required_position?.message : errors.position?.message}
        >
          <Select
            value={watch(isClinic ? "required_position" : "position") || ""}
            onValueChange={(value) => setValue(isClinic ? "required_position" : "position", value)}
          >
            <SelectTrigger className={cn(
              (isClinic ? errors.required_position : errors.position) && "border-destructive"
            )}>
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
        </FormField>

        {isClinic && (
          <FormField label="סוג העסק">
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
          </FormField>
        )}

        {!isClinic && (
          <FormField 
            label="שנות ניסיון"
            hint="כמה שנות ניסיון יש לך בתחום?"
          >
            <Input
              type="number"
              min={0}
              max={50}
              {...register("experience_years", { valueAsNumber: true })}
              placeholder="3"
              className="w-32"
            />
          </FormField>
        )}

        <FormField 
          label="תיאור" 
          error={errors.description?.message}
          hint={`${watch("description")?.length || 0}/500 תווים`}
        >
          <Textarea
            {...register("description")}
            placeholder={isClinic 
              ? "ספר על המרפאה, האווירה, והציפיות..." 
              : "ספר על עצמך, הניסיון והיכולות שלך..."}
            rows={3}
            className={cn(errors.description && "border-destructive")}
          />
        </FormField>
      </FormSection>

      {/* Location */}
      <FormSection title="מיקום" icon={<MapPin className="w-4 h-4 text-primary" />}>
        <FormField 
          label={isClinic ? "עיר" : "עיר מועדפת"}
          required
          hint="חשוב לבחור את שם העיר המדויק להתאמה טובה יותר"
        >
          <CityCombobox
            value={watch(isClinic ? "city" : "preferred_area") || ""}
            onChange={(value) => setValue(isClinic ? "city" : "preferred_area", value)}
            placeholder={isClinic ? "בחר עיר" : "בחר עיר מועדפת"}
          />
        </FormField>

        {isClinic && (
          <FormField 
            label="רדיוס חיפוש"
            hint="כמה רחוק אתם מוכנים שהעובד יגיע?"
          >
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={100}
                {...register("radius_km", { valueAsNumber: true })}
                placeholder="10"
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">ק"מ</span>
            </div>
          </FormField>
        )}
      </FormSection>

      {/* Availability */}
      <FormSection title="זמינות" icon={<Calendar className="w-4 h-4 text-primary" />}>
        <FormField label="ימים זמינים">
          <div className="flex flex-wrap gap-2">
            {days.map((day) => (
              <label
                key={day.value}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-sm",
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
                <span>{day.label}</span>
              </label>
            ))}
          </div>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="שעות">
            <Input
              {...register("availability_hours")}
              placeholder="08:00 - 16:00"
            />
          </FormField>

          <FormField label="תאריך התחלה">
            <Input
              type="date"
              {...register("availability_date")}
            />
          </FormField>
        </div>
      </FormSection>

      {/* Salary & Job Type */}
      <FormSection 
        title={isClinic ? "תנאי העסקה" : "ציפיות שכר"} 
        icon={<Banknote className="w-4 h-4 text-primary" />}
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField 
            label={isClinic ? "שכר מינימום" : "שכר מינימלי"}
            error={errors.salary_min?.message}
          >
            <div className="relative">
              <Input
                type="number"
                min={0}
                {...register("salary_min", { valueAsNumber: true })}
                placeholder="5000"
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₪</span>
            </div>
          </FormField>
          
          <FormField 
            label={isClinic ? "שכר מקסימום" : "שכר מקסימלי"}
          >
            <div className="relative">
              <Input
                type="number"
                min={0}
                {...register("salary_max", { valueAsNumber: true })}
                placeholder="15000"
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₪</span>
            </div>
          </FormField>
        </div>

        <FormField label="סוג משרה">
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
        </FormField>
      </FormSection>

      {/* Submit Button */}
      <div className="pt-4 pb-8">
        <Button 
          type="submit" 
          className="w-full gap-2" 
          size="lg" 
          disabled={isLoading}
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                שומר...
              </motion.span>
            ) : isEditing ? (
              <motion.span
                key="update"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                עדכן פרופיל
              </motion.span>
            ) : (
              <motion.span
                key="create"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                המשך להתאמות
                <ArrowLeft className="w-4 h-4" />
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </form>
  );
}
