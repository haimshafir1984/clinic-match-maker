import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { ProfileCompletionResult, getFieldLabel } from "@/lib/profileCompletion";
import { cn } from "@/lib/utils";

interface ProfileProgressProps {
  completion: ProfileCompletionResult;
  className?: string;
}

export function ProfileProgress({ completion, className }: ProfileProgressProps) {
  const { isComplete, percentage, missingRequiredFields } = completion;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-500" />
          )}
          <span className="font-medium text-sm">
            {isComplete ? "הפרופיל הושלם!" : "השלם את הפרופיל"}
          </span>
        </div>
        <Badge variant={isComplete ? "default" : "secondary"} className="text-xs">
          {percentage}%
        </Badge>
      </div>

      {/* Progress Bar */}
      <Progress 
        value={percentage} 
        className="h-2"
      />

      {/* Missing Fields */}
      {!isComplete && missingRequiredFields.length > 0 && (
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">שדות חובה חסרים: </span>
          {missingRequiredFields.map((field, index) => (
            <span key={field}>
              {getFieldLabel(field)}
              {index < missingRequiredFields.length - 1 && ", "}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
