import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Loader2, Heart, Stethoscope, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/swipe";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNetworkError(null);
    
    if (!email) {
      toast.error("נא להזין אימייל");
      return;
    }

    setLoading(true);
    
    try {
      const { error, needsRegistration } = await signIn(email);

      if (error) {
        if (needsRegistration) {
          toast.info("האימייל לא נמצא, מעביר להרשמה");
          navigate("/register", { state: { email } });
          return;
        }
        
        if (error.message.includes("לא מגיב") || error.message.includes("תקשורת")) {
          setNetworkError(error.message);
        } else {
          toast.error("שגיאה בהתחברות", {
            description: error.message,
          });
        }
      } else {
        toast.success("התחברת בהצלחה!");
        // Always redirect to profile first to review details
        navigate("/profile", { replace: true });
      }
    } catch (error) {
      setNetworkError("שגיאה בתקשורת עם השרת. נסה שוב.");
    } finally {
      setLoading(false);
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
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-4">
              <Stethoscope className="w-10 h-10 text-primary-foreground" />
            </div>
            <Heart className="absolute -bottom-1 -left-1 w-6 h-6 text-destructive fill-destructive" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">ClinicMatch</h1>
          <p className="text-muted-foreground mt-1">השמת עובדי רפואה</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">התחברות</CardTitle>
            <CardDescription>ברוכים הבאים! נא להתחבר לחשבון</CardDescription>
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
              <div className="space-y-2">
                <Label htmlFor="email">אימייל</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-right"
                  dir="ltr"
                  autoComplete="email"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                    מתחבר...
                  </>
                ) : (
                  "התחברות"
                )}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                אין לך חשבון?{" "}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  הרשמה
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
