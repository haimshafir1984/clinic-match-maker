// API Layer for ClinicMatch
// Connects to the Render backend at https://clinicmatch.onrender.com/api

import { 
  MatchCardData, 
  SwipeRequest, 
  SwipeResponse, 
  Match, 
  Message,
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

// Backend feed profile structure
interface BackendFeedProfile {
  id: string;
  name: string;
  position?: string | null;
  location?: string | null;
  salary_info?: { min?: number; max?: number } | null;
  availability?: { days?: string[]; hours?: string; start_date?: string } | null;
  image_url?: string | null;
  role?: string;
  created_at?: string | null;
}

// Transform backend feed profile to MatchCardData
function transformToMatchCardData(profile: BackendFeedProfile): MatchCardData {
  return {
    id: profile.id,
    name: profile.name,
    position: profile.position || null,
    location: profile.location || null,
    availability: {
      days: profile.availability?.days || [],
      hours: profile.availability?.hours || null,
      startDate: profile.availability?.start_date || null,
    },
    salaryRange: {
      min: profile.salary_info?.min || null,
      max: profile.salary_info?.max || null,
    },
    imageUrl: profile.image_url || null,
    role: (profile.role?.toLowerCase() as "clinic" | "worker") || "worker",
    // These fields may not come from backend, set defaults
    experienceYears: null,
    description: null,
    jobType: null,
    radiusKm: null,
    createdAt: profile.created_at || null,
  };
}

// GET /api/feed/{userId} - Get profiles for discovery feed
export async function getFeed(currentUser: CurrentUser): Promise<MatchCardData[]> {
  if (!currentUser.profileId || !currentUser.role) {
    return [];
  }

  try {
    const response = await apiCall<{ profiles: BackendFeedProfile[] } | BackendFeedProfile[]>(
      `/feed/${currentUser.profileId}`
    );
    
    // Handle both array and object response formats
    const profiles = Array.isArray(response) ? response : (response.profiles || []);
    
    // Transform each profile to frontend format
    return profiles.map(transformToMatchCardData);
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

// Backend match response structure
interface BackendMatch {
  id: string;
  created_at: string;
  is_closed: boolean;
  other_profile: {
    id: string;
    name: string;
    position?: string | null;
    image_url?: string | null;
    role?: string;
    location?: string | null;
  };
}

// Transform backend match to frontend Match
function transformToMatch(match: BackendMatch): Match {
  return {
    id: match.id,
    createdAt: match.created_at,
    isClosed: match.is_closed,
    otherProfile: {
      id: match.other_profile.id,
      name: match.other_profile.name,
      position: match.other_profile.position || null,
      location: match.other_profile.location || null,
      availability: { days: [], hours: null, startDate: null },
      salaryRange: { min: null, max: null },
      experienceYears: null,
      imageUrl: match.other_profile.image_url || null,
      role: (match.other_profile.role?.toLowerCase() as "clinic" | "worker") || "worker",
      description: null,
      jobType: null,
      radiusKm: null,
      createdAt: null,
    },
  };
}

// GET /api/matches/{userId} - Get all matches for current user
export async function getMatches(currentUser: CurrentUser): Promise<Match[]> {
  if (!currentUser.profileId) {
    return [];
  }

  try {
    const response = await apiCall<{ matches: BackendMatch[] } | BackendMatch[]>(
      `/matches/${currentUser.profileId}`
    );
    
    const matches = Array.isArray(response) ? response : (response.matches || []);
    return matches.map(transformToMatch);
  } catch (error) {
    console.error("Error fetching matches:", error);
    throw error;
  }
}

// GET /api/matches/{userId}/{matchId} - Get single match details
export async function getMatchDetails(userId: string, matchId: string): Promise<Match | null> {
  try {
    const response = await apiCall<BackendMatch>(`/matches/${userId}/${matchId}`);
    return transformToMatch(response);
  } catch (error) {
    console.error("Error fetching match details:", error);
    return null;
  }
}

// POST /api/matches/{matchId}/close - Close a match
export async function closeMatch(matchId: string, userId: string): Promise<void> {
  try {
    await apiCall(`/matches/${matchId}/close`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
    });
  } catch (error) {
    console.error("Error closing match:", error);
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

// POST /api/auth/login - Login with email only (no password for MVP)
export async function login(
  email: string
): Promise<{ user: CurrentUser | null; error: string | null; needsRegistration?: boolean }> {
  try {
    const response = await apiCall<{ success: boolean; user: BackendProfile } | BackendProfile>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    // Handle both response formats: { success, user } or direct profile
    const profile = "user" in response ? response.user : response;
    const user = transformToCurrentUser(profile);
    localStorage.setItem("current_user", JSON.stringify(user));
    
    return { user, error: null };
  } catch (error) {
    if (error instanceof Error) {
      // Check if user not found - needs registration
      if (error.message.includes("404") || error.message.includes("not found") || error.message.includes("לא נמצא")) {
        return { user: null, error: "האימייל לא נמצא, אנא הירשם", needsRegistration: true };
      }
      return { user: null, error: error.message };
    }
    return { user: null, error: "התחברות נכשלה" };
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

// Logout - clear all auth-related local storage
export async function logout(): Promise<void> {
  localStorage.removeItem("current_user");
  localStorage.removeItem("auth_token");
}

// Backend message structure
interface BackendMessage {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

// Transform to frontend Message
function transformToMessage(msg: BackendMessage): Message {
  return {
    id: msg.id,
    matchId: msg.match_id,
    senderId: msg.sender_id,
    content: msg.content,
    createdAt: msg.created_at,
  };
}

// GET /api/messages/{matchId} - Get messages for a match
export async function getMessages(matchId: string): Promise<Message[]> {
  try {
    const response = await apiCall<{ messages: BackendMessage[] } | BackendMessage[]>(
      `/messages/${matchId}`
    );
    
    const messages = Array.isArray(response) ? response : (response.messages || []);
    return messages.map(transformToMessage);
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
): Promise<Message> {
  try {
    const response = await apiCall<BackendMessage>("/messages", {
      method: "POST",
      body: JSON.stringify({ match_id: matchId, sender_id: senderId, content }),
    });
    return transformToMessage(response);
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}
