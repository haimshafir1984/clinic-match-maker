// API Layer for ClinicMatch
// This connects to the Render backend at https://clinicmatch.onrender.com

import { 
  MatchCardData, 
  SwipeRequest, 
  SwipeResponse, 
  Match, 
  CurrentUser,
  UserRole,
  AuthResponse
} from "@/types";

const API_BASE_URL = "https://clinicmatch.onrender.com";

// Helper function for API calls
async function apiCall<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("auth_token");
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "API Error" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// GET /api/feed - Get profiles for discovery feed
export async function getFeed(currentUser: CurrentUser): Promise<MatchCardData[]> {
  if (!currentUser.profileId || !currentUser.role) {
    return [];
  }

  try {
    const response = await apiCall<{ profiles: MatchCardData[] }>(
      `/api/feed?userId=${currentUser.profileId}&role=${currentUser.role}`
    );
    return response.profiles || [];
  } catch (error) {
    console.error("Error fetching feed:", error);
    return [];
  }
}

// POST /api/swipe - Record a swipe action
export async function postSwipe(request: SwipeRequest): Promise<SwipeResponse> {
  try {
    const response = await apiCall<SwipeResponse>("/api/swipe", {
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

// GET /api/matches - Get all matches for current user
export async function getMatches(currentUser: CurrentUser): Promise<Match[]> {
  if (!currentUser.profileId) {
    return [];
  }

  try {
    const response = await apiCall<{ matches: Match[] }>(
      `/api/matches?userId=${currentUser.profileId}`
    );
    return response.matches || [];
  } catch (error) {
    console.error("Error fetching matches:", error);
    return [];
  }
}

// POST /api/auth/login
export async function login(
  email: string, 
  password: string
): Promise<{ user: CurrentUser | null; token: string | null; error: string | null }> {
  try {
    const response = await apiCall<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.user && response.token) {
      localStorage.setItem("auth_token", response.token);
      return { user: response.user, token: response.token, error: null };
    }

    return { user: null, token: null, error: "Login failed" };
  } catch (error) {
    return { 
      user: null, 
      token: null, 
      error: error instanceof Error ? error.message : "Login failed" 
    };
  }
}

// POST /api/auth/register
export async function register(
  email: string, 
  password: string,
  role: UserRole,
  name: string
): Promise<{ user: CurrentUser | null; token: string | null; error: string | null }> {
  try {
    const response = await apiCall<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, role, name }),
    });

    if (response.user && response.token) {
      localStorage.setItem("auth_token", response.token);
      return { user: response.user, token: response.token, error: null };
    }

    return { user: null, token: null, error: "Registration failed" };
  } catch (error) {
    return { 
      user: null, 
      token: null, 
      error: error instanceof Error ? error.message : "Registration failed" 
    };
  }
}

// GET /api/auth/me - Get current user
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = localStorage.getItem("auth_token");
  if (!token) return null;

  try {
    const response = await apiCall<{ user: CurrentUser }>("/api/auth/me");
    return response.user;
  } catch (error) {
    console.error("Error fetching current user:", error);
    localStorage.removeItem("auth_token");
    return null;
  }
}

// POST /api/auth/logout
export async function logout(): Promise<void> {
  try {
    await apiCall("/api/auth/logout", { method: "POST" });
  } catch (error) {
    console.error("Error logging out:", error);
  } finally {
    localStorage.removeItem("auth_token");
  }
}

// GET /api/messages - Get messages for a match
export async function getMessages(matchId: string): Promise<any[]> {
  try {
    const response = await apiCall<{ messages: any[] }>(
      `/api/messages?matchId=${matchId}`
    );
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
    const response = await apiCall<any>("/api/messages", {
      method: "POST",
      body: JSON.stringify({ match_id: matchId, sender_id: senderId, content }),
    });
    return response;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}
