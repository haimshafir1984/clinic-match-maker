import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Heart, Stethoscope } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/swipe";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("נא למלא את כל השדות");
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      toast.error("שגיאה בהתחברות", {
        description: error.message === "Invalid login credentials" 
          ? "אימייל או סיסמה שגויים" 
          : error.message,
      });
    } else {
      toast.success("התחברת בהצלחה!");
      navigate(from, { replace: true });
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
              <div className="space-y-2">
                <Label htmlFor="password">סיסמה</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  dir="ltr"
                  autoComplete="current-password"
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
