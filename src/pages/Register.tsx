import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CityCombobox } from "@/components/ui/city-combobox";
import { DomainSelector } from "@/components/registration/DomainSelector";
import { RoleMultiSelector } from "@/components/registration/RoleMultiSelector";
import { toast } from "sonner";
import { Loader2, Heart, Stethoscope, Building2, UserRound, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WorkplaceDomain } from "@/constants/domains";

type UserRole = "CLINIC" | "STAFF";

// Registration steps
type RegistrationStep = "role" | "domain" | "positions" | "details";

const stepOrder: RegistrationStep[] = ["role", "domain", "positions", "details"];

export default function Register() {
  const location = useLocation();
  const initialEmail = (location.state as { email?: string })?.email || "";
  
  const [step, setStep] = useState<RegistrationStep>("role");
  const [email, setEmail] = useState(initialEmail);
  const [name, setName] = useState("");
  const [positions, setPositions] = useState<string[]>([]);
  const [workplaceDomain, setWorkplaceDomain] = useState<WorkplaceDomain | null>(null);
  const [city, setCity] = useState("");
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const currentStepIndex = stepOrder.indexOf(step);
  const canGoBack = currentStepIndex > 0;
  const isLastStep = step === "details";

  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < stepOrder.length) {
      setStep(stepOrder[nextIndex]);
    }
  };

  const goToPreviousStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(stepOrder[prevIndex]);
    }
  };

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    goToNextStep();
  };

  const handleDomainSelect = (domain: WorkplaceDomain) => {
    setWorkplaceDomain(domain);
    // Reset positions when domain changes
    setPositions([]);
    goToNextStep();
  };

  const handlePositionsChange = (newPositions: string[]) => {
    setPositions(newPositions);
  };

  const handlePositionsContinue = () => {
    if (positions.length === 0) {
      toast.error("נא לבחור לפחות תפקיד אחד");
      return;
    }
    goToNextStep();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNetworkError(null);
    
    if (!email || !name) {
      toast.error("נא למלא את כל השדות החובה");
      return;
    }

    if (!role) {
      toast.error("נא לבחור סוג משתמש");
      return;
    }

    if (positions.length === 0) {
      toast.error("נא לבחור לפחות תפקיד אחד");
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await signUp({
        email,
        role,
        name,
        positions, // Array of positions
        workplace_types: workplaceDomain ? [workplaceDomain] : [],
        location: city || undefined,
      });

      if (error) {
        if (error.message.includes("לא מגיב") || error.message.includes("תקשורת")) {
          setNetworkError(error.message);
        } else {
          toast.error("שגיאה בהרשמה", {
            description: error.message,
          });
        }
      } else {
        toast.success("נרשמת בהצלחה!");
        // Always redirect to profile page after registration
        navigate("/profile", { state: { isNew: true } });
      }
    } catch (error) {
      setNetworkError("שגיאה בתקשורת עם השרת. נסה שוב.");
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center gap-2 mb-6">
      {stepOrder.map((s, index) => (
        <div
          key={s}
          className={cn(
            "w-2 h-2 rounded-full transition-all",
            index <= currentStepIndex ? "bg-primary" : "bg-muted"
          )}
        />
      ))}
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case "role":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center mb-4">
              <h3 className="font-semibold text-lg text-foreground mb-1">
                איך תרצו להשתמש ב-ClinicMatch?
              </h3>
              <p className="text-sm text-muted-foreground">
                בחרו את הסוג שמתאים לכם
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRoleSelect("CLINIC")}
                className={cn(
                  "flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all",
                  role === "CLINIC"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary/50"
                )}
              >
                <Building2 className="w-10 h-10" />
                <span className="font-semibold">מרפאה</span>
                <span className="text-xs text-muted-foreground text-center">
                  מחפשים עובדים מקצועיים
                </span>
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRoleSelect("STAFF")}
                className={cn(
                  "flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all",
                  role === "STAFF"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary/50"
                )}
              >
                <UserRound className="w-10 h-10" />
                <span className="font-semibold">איש/אשת מקצוע</span>
                <span className="text-xs text-muted-foreground text-center">
                  מחפש/ת הזדמנויות עבודה
                </span>
              </motion.button>
            </div>
          </motion.div>
        );

      case "domain":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <DomainSelector
              value={workplaceDomain}
              onChange={handleDomainSelect}
            />
          </motion.div>
        );

      case "positions":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {workplaceDomain && (
              <RoleMultiSelector
                domain={workplaceDomain}
                selectedRoles={positions}
                onChange={handlePositionsChange}
              />
            )}
            <Button
              type="button"
              className="w-full"
              onClick={handlePositionsContinue}
              disabled={positions.length === 0}
            >
              המשך
              <ArrowLeft className="w-4 h-4 mr-2" />
            </Button>
          </motion.div>
        );

      case "details":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center mb-2">
              <h3 className="font-semibold text-lg text-foreground mb-1">
                כמעט סיימנו! 🎉
              </h3>
              <p className="text-sm text-muted-foreground">
                רק עוד כמה פרטים ותוכלו להתחיל לקבל התאמות
              </p>
            </div>

            {/* Selected Positions Display */}
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {positions.map((pos) => (
                <span
                  key={pos}
                  className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                >
                  {pos}
                </span>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">שם מלא *</Label>
              <Input
                id="name"
                type="text"
                placeholder="השם שיוצג לצד השני"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-right"
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">כתובת אימייל *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                dir="ltr"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">עיר / אזור פעילות *</Label>
              <CityCombobox
                value={city}
                onChange={setCity}
                placeholder="בחרו עיר"
              />
              <p className="text-xs text-muted-foreground">
                המיקום עוזר לנו למצוא התאמות רלוונטיות באזור שלכם
              </p>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-accent/20 to-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo & Value Proposition */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-3">
              <Stethoscope className="w-8 h-8 text-primary-foreground" />
            </div>
            <Heart className="absolute -bottom-1 -left-1 w-5 h-5 text-destructive fill-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">ClinicMatch</h1>
          <p className="text-xs text-muted-foreground mt-1 text-center">
            הפלטפורמה להתאמות בתחום הרפואה
          </p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">הצטרפו ל-ClinicMatch</CardTitle>
            <CardDescription>
              תהליך קצר של 4 שלבים – ותתחילו לקבל התאמות
            </CardDescription>
          </CardHeader>
          
          {networkError && (
            <div className="px-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{networkError}</AlertDescription>
              </Alert>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {renderStepIndicator()}
              <AnimatePresence mode="wait">
                {renderStep()}
              </AnimatePresence>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-4">
              {/* Navigation buttons */}
              <div className="flex gap-2 w-full">
                {canGoBack && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goToPreviousStep}
                    className="flex-1"
                  >
                    <ArrowRight className="w-4 h-4 ml-2" />
                    חזרה
                  </Button>
                )}
                
                {isLastStep && (
                  <Button 
                    type="submit" 
                    className={cn("flex-1", !canGoBack && "w-full")}
                    size="lg"
                    disabled={loading || !role || positions.length === 0}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin ml-2" />
                        יוצר את הפרופיל...
                      </>
                    ) : (
                      "סיום והתחלת התאמות"
                    )}
                  </Button>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground text-center">
                יש לך חשבון?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  התחברות
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
