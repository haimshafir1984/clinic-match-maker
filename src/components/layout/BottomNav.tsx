import { NavLink, useLocation } from "react-router-dom";
import { Heart, MessageCircle, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  { path: "/swipe", icon: Sparkles, label: "גלישה" },
  { path: "/matches", icon: Heart, label: "התאמות" },
  { path: "/chat", icon: MessageCircle, label: "צ'אט" },
  { path: "/profile", icon: User, label: "פרופיל" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center w-full h-full"
            >
              <motion.div
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </motion.div>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
