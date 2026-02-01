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

// POST /api/auth/login
export async function login(
  email: string, 
  password: string
): Promise<{ user: CurrentUser | null; token: string | null; error: string | null }> {
  try {
    const response = await apiCall<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.user && response.token) {
      localStorage.setItem("auth_token", response.token);
      return { user: response.user, token: response.token, error: null };
    }

    return { user: null, token: null, error: "התחברות נכשלה" };
  } catch (error) {
    return { 
      user: null, 
      token: null, 
      error: error instanceof Error ? error.message : "התחברות נכשלה" 
    };
  }
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
): Promise<{ user: CurrentUser | null; token: string | null; error: string | null }> {
  try {
    const response = await apiCall<AuthResponse>("/profiles", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (response.user && response.token) {
      localStorage.setItem("auth_token", response.token);
      return { user: response.user, token: response.token, error: null };
    }

    return { user: null, token: null, error: "יצירת הפרופיל נכשלה" };
  } catch (error) {
    return { 
      user: null, 
      token: null, 
      error: error instanceof Error ? error.message : "יצירת הפרופיל נכשלה" 
    };
  }
}

// GET /api/auth/me - Get current user
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = localStorage.getItem("auth_token");
  if (!token) return null;

  try {
    const response = await apiCall<{ user: CurrentUser } | CurrentUser>("/auth/me");
    
    if ("user" in response) {
      return response.user;
    }
    return response;
  } catch (error) {
    console.error("Error fetching current user:", error);
    localStorage.removeItem("auth_token");
    return null;
  }
}

// POST /api/auth/logout
export async function logout(): Promise<void> {
  try {
    await apiCall("/auth/logout", { method: "POST" });
  } catch (error) {
    console.error("Error logging out:", error);
  } finally {
    localStorage.removeItem("auth_token");
  }
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
