import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { CurrentUser, UserRole } from "@/types";
import { 
  login as apiLogin, 
  createProfile, 
  getCurrentUser, 
  logout as apiLogout,
  ProfileCreateData 
} from "@/lib/api";

interface AuthContextType {
  user: CurrentUser | null;
  currentUser: CurrentUser | null;
  loading: boolean;
  signUp: (data: ProfileCreateData) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshCurrentUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Error fetching current user:", error);
      setUser(null);
    }
  };

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem("auth_token");
    if (token) {
      fetchCurrentUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = async (data: ProfileCreateData) => {
    const { user: newUser, error } = await createProfile(data);
    
    if (error) {
      return { error: new Error(error) };
    }
    
    if (newUser) {
      setUser(newUser);
    }
    
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { user: loggedInUser, error } = await apiLogin(email, password);
    
    if (error) {
      return { error: new Error(error) };
    }
    
    if (loggedInUser) {
      setUser(loggedInUser);
    }
    
    return { error: null };
  };

  const signOut = async () => {
    await apiLogout();
    setUser(null);
  };

  const refreshCurrentUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      currentUser: user,
      loading, 
      signUp, 
      signIn, 
      signOut,
      refreshCurrentUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
