// API Layer for ClinicMatch
// Connects to the Render backend at https://clinicmatch.onrender.com/api

import { 
  MatchCardData, 
  SwipeRequest, 
  SwipeResponse, 
  Match, 
  CurrentUser,
  UserRole,
  AuthResponse
} from "@/types";

const API_BASE_URL = "https://clinicmatch.onrender.com/api";

// Helper function for API calls with timeout and error handling
async function apiCall<T>(
  endpoint: string, 
  options: RequestInit = {},
  timeoutMs: number = 15000
): Promise<T> {
  const token = localStorage.getItem("auth_token");
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "שגיאת שרת" }));
      throw new Error(error.message || `שגיאה ${response.status}`);
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("הבקשה נכשלה - השרת לא מגיב. נסה שוב.");
      }
      throw error;
    }
    throw new Error("שגיאה בתקשורת עם השרת");
  }
}

// GET /api/feed/{userId} - Get profiles for discovery feed
export async function getFeed(currentUser: CurrentUser): Promise<MatchCardData[]> {
  if (!currentUser.profileId || !currentUser.role) {
    return [];
  }

  try {
    const response = await apiCall<{ profiles: MatchCardData[] } | MatchCardData[]>(
      `/feed/${currentUser.profileId}`
    );
    
    // Handle both array and object response formats
    if (Array.isArray(response)) {
      return response;
    }
    return response.profiles || [];
  } catch (error) {
    console.error("Error fetching feed:", error);
    throw error;
  }
}

// POST /api/swipe - Record a swipe action
export async function postSwipe(request: SwipeRequest): Promise<SwipeResponse> {
  try {
    const response = await apiCall<SwipeResponse>("/swipe", {
      method: "POST",
      body: JSON.stringify({
        swiper_id: request.swiperId,
        swiped_id: request.swipedId,
        type: request.type,
      }),
    });

    return {
      success: true,
      isMatch: response.isMatch || false,
      matchId: response.matchId,
    };
  } catch (error) {
    console.error("Error posting swipe:", error);
    throw error;
  }
}

// GET /api/matches/{userId} - Get all matches for current user
export async function getMatches(currentUser: CurrentUser): Promise<Match[]> {
  if (!currentUser.profileId) {
    return [];
  }

  try {
    const response = await apiCall<{ matches: Match[] } | Match[]>(
      `/matches/${currentUser.profileId}`
    );
    
    if (Array.isArray(response)) {
      return response;
    }
    return response.matches || [];
  } catch (error) {
    console.error("Error fetching matches:", error);
    throw error;
  }
}

// Backend profile response structure
interface BackendProfile {
  id: string;
  email: string;
  role: string;
  name: string;
  position?: string;
  location?: string;
  salary_info?: { min?: number; max?: number } | null;
  availability?: { days?: string[]; hours?: string; start_date?: string } | null;
  created_at?: string;
}

// Transform backend profile to CurrentUser
function transformToCurrentUser(profile: BackendProfile): CurrentUser {
  return {
    id: profile.id,
    email: profile.email,
    profileId: profile.id,
    role: profile.role.toLowerCase() as UserRole,
    name: profile.name,
    imageUrl: null,
    isProfileComplete: true,
  };
}

// POST /api/login - Login with email
export async function login(
  email: string, 
  _password: string
): Promise<{ user: CurrentUser | null; error: string | null }> {
  // Backend check:
  // - POST /api/auth/login returned 404 in the client network log
  // - GET /api/profiles and GET /api/profiles/email/:email return 404
  // לכן כרגע אין לנו דרך לבצע Login אמיתי מול השרת.
  return {
    user: null,
    error:
      "השרת כרגע לא תומך בהתחברות (אין endpoint Login פעיל). ניתן להירשם דרך /profiles או להוסיף ב-Backend endpoint כמו POST /api/auth/login או GET /api/profiles/by-email." ,
  };
}

// Profile creation data
export interface ProfileCreateData {
  email: string;
  role: "CLINIC" | "STAFF";
  name: string;
  position?: string;
  location?: string;
  salary_info?: {
    min?: number;
    max?: number;
  };
  availability?: {
    days?: string[];
    hours?: string;
    start_date?: string;
  };
}

// POST /api/profiles - Create a new profile (signup)
export async function createProfile(
  data: ProfileCreateData
): Promise<{ user: CurrentUser | null; error: string | null }> {
  try {
    const response = await apiCall<BackendProfile>("/profiles", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const user = transformToCurrentUser(response);
    localStorage.setItem("current_user", JSON.stringify(user));
    
    return { user, error: null };
  } catch (error) {
    if (error instanceof Error) {
      // Handle duplicate email error
      if (error.message.includes("duplicate") || error.message.includes("unique constraint")) {
        return { user: null, error: "האימייל כבר רשום במערכת. נסה להתחבר במקום להירשם." };
      }
      return { user: null, error: error.message };
    }
    return { user: null, error: "יצירת הפרופיל נכשלה" };
  }
}

// Get current user from localStorage
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const stored = localStorage.getItem("current_user");
  if (!stored) return null;

  try {
    return JSON.parse(stored) as CurrentUser;
  } catch (error) {
    console.error("Error parsing current user:", error);
    localStorage.removeItem("current_user");
    return null;
  }
}

// Logout - clear local storage
export async function logout(): Promise<void> {
  localStorage.removeItem("current_user");
}

// GET /api/messages/{matchId} - Get messages for a match
export async function getMessages(matchId: string): Promise<any[]> {
  try {
    const response = await apiCall<{ messages: any[] } | any[]>(
      `/messages/${matchId}`
    );
    
    if (Array.isArray(response)) {
      return response;
    }
    return response.messages || [];
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

// POST /api/messages - Send a message
export async function sendMessage(
  matchId: string, 
  senderId: string, 
  content: string
): Promise<any> {
  try {
    const response = await apiCall<any>("/messages", {
      method: "POST",
      body: JSON.stringify({ match_id: matchId, sender_id: senderId, content }),
    });
    return response;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}
