import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Heart, Stethoscope, Building2, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type UserRole = "clinic" | "worker";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast.error("נא למלא את כל השדות");
      return;
    }

    if (!role) {
      toast.error("נא לבחור סוג משתמש");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("הסיסמאות אינן תואמות");
      return;
    }

    if (password.length < 6) {
      toast.error("הסיסמה חייבת להכיל לפחות 6 תווים");
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);

    if (error) {
      toast.error("שגיאה בהרשמה", {
        description: error.message,
      });
    } else {
      toast.success("נרשמת בהצלחה!", {
        description: "נא לאמת את האימייל שלך לפני ההתחברות",
      });
      // Store role in localStorage to use after email verification
      localStorage.setItem("pendingRole", role);
      navigate("/login");
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
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-3">
              <Stethoscope className="w-8 h-8 text-primary-foreground" />
            </div>
            <Heart className="absolute -bottom-1 -left-1 w-5 h-5 text-destructive fill-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">ClinicMatch</h1>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">הרשמה</CardTitle>
            <CardDescription>צור חשבון חדש והתחל להתאים</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Role Selection */}
              <div className="space-y-2">
                <Label>סוג משתמש</Label>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRole("clinic")}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                      role === "clinic"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Building2 className="w-8 h-8" />
                    <span className="font-medium">מרפאה</span>
                    <span className="text-xs text-muted-foreground">מחפשים עובדים</span>
                  </motion.button>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRole("worker")}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                      role === "worker"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <UserRound className="w-8 h-8" />
                    <span className="font-medium">עובד/ת</span>
                    <span className="text-xs text-muted-foreground">מחפש/ת עבודה</span>
                  </motion.button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">אימייל</Label>
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
                <Label htmlFor="password">סיסמה</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="לפחות 6 תווים"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  dir="ltr"
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">אימות סיסמה</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="הזן שוב את הסיסמה"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  dir="ltr"
                  autoComplete="new-password"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={loading || !role}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                    נרשם...
                  </>
                ) : (
                  "הרשמה"
                )}
              </Button>
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
