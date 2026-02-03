// Profile completion logic
import { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

// Required fields for profile completion by role
// Only: name, position/required_position, city (area for workers)
const REQUIRED_FIELDS_WORKER = ["name", "position", "preferred_area"] as const;
const REQUIRED_FIELDS_CLINIC = ["name", "required_position", "city"] as const;

// All fields that contribute to profile completeness
const ALL_PROFILE_FIELDS = [
  "name",
  "position",
  "required_position",
  "description",
  "city",
  "preferred_area",
  "availability_days",
  "availability_hours",
  "availability_date",
  "salary_min",
  "salary_max",
  "job_type",
  "experience_years",
] as const;

export interface ProfileCompletionResult {
  isComplete: boolean;
  percentage: number;
  missingRequiredFields: string[];
  filledFields: string[];
  totalFields: number;
}

const FIELD_LABELS: Record<string, string> = {
  name: "שם",
  position: "מקצוע",
  required_position: "תפקיד מבוקש",
  description: "תיאור",
  city: "עיר",
  preferred_area: "עיר מועדפת",
  availability_days: "ימי זמינות",
  availability_hours: "שעות זמינות",
  availability_date: "תאריך התחלה",
  salary_min: "שכר מינימום",
  salary_max: "שכר מקסימום",
  job_type: "סוג משרה",
  experience_years: "שנות ניסיון",
};

export function getFieldLabel(field: string): string {
  return FIELD_LABELS[field] || field;
}

function isFieldFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") return true;
  return Boolean(value);
}

export function calculateProfileCompletion(
  profile: Profile | null
): ProfileCompletionResult {
  if (!profile) {
    return {
      isComplete: false,
      percentage: 0,
      missingRequiredFields: ["name", "role"],
      filledFields: [],
      totalFields: ALL_PROFILE_FIELDS.length,
    };
  }

  const isClinic = profile.role === "clinic";
  const requiredFields = isClinic ? REQUIRED_FIELDS_CLINIC : REQUIRED_FIELDS_WORKER;

  // Check required fields
  const missingRequiredFields: string[] = [];
  for (const field of requiredFields) {
    const value = profile[field as keyof Profile];
    if (!isFieldFilled(value)) {
      missingRequiredFields.push(field);
    }
  }

  // Calculate overall percentage
  const relevantFields = isClinic
    ? ALL_PROFILE_FIELDS.filter((f) => f !== "position" && f !== "experience_years")
    : ALL_PROFILE_FIELDS.filter((f) => f !== "required_position");

  const filledFields: string[] = [];
  for (const field of relevantFields) {
    const value = profile[field as keyof Profile];
    if (isFieldFilled(value)) {
      filledFields.push(field);
    }
  }

  const percentage = Math.round((filledFields.length / relevantFields.length) * 100);
  const isComplete = missingRequiredFields.length === 0;

  return {
    isComplete,
    percentage,
    missingRequiredFields,
    filledFields,
    totalFields: relevantFields.length,
  };
}
