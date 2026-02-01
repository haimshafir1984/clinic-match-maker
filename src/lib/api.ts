// API Layer for ClinicMatch
// This provides a clean API interface while using Supabase under the hood

import { supabase } from "@/integrations/supabase/client";
import { 
  MatchCardData, 
  SwipeRequest, 
  SwipeResponse, 
  Match, 
  CurrentUser,
  UserRole,
  Availability,
  SalaryRange
} from "@/types";
import { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

// Transform database profile to MatchCardData
function transformToMatchCard(profile: Profile): MatchCardData {
  const isClinic = profile.role === "clinic";
  
  const availability: Availability = {
    days: profile.availability_days || [],
    hours: profile.availability_hours,
    startDate: profile.availability_date,
  };

  const salaryRange: SalaryRange = {
    min: profile.salary_min,
    max: profile.salary_max,
  };

  return {
    id: profile.id,
    name: profile.name,
    position: isClinic ? profile.required_position : profile.position,
    location: profile.city || profile.preferred_area,
    availability,
    salaryRange,
    experienceYears: profile.experience_years,
    imageUrl: profile.avatar_url,
    role: profile.role as UserRole,
    description: profile.description,
    jobType: profile.job_type as MatchCardData["jobType"],
    radiusKm: profile.radius_km,
  };
}

// GET /api/feed - Get profiles for discovery feed
export async function getFeed(currentUser: CurrentUser): Promise<MatchCardData[]> {
  if (!currentUser.profileId || !currentUser.role) {
    return [];
  }

  // Get profiles that the user hasn't swiped on yet
  const { data: swipedProfiles } = await supabase
    .from("likes")
    .select("to_user_id")
    .eq("from_user_id", currentUser.profileId);

  const swipedIds = swipedProfiles?.map((l) => l.to_user_id) || [];

  // Get opposite role profiles (CLINIC sees WORKER, WORKER sees CLINIC)
  const oppositeRole = currentUser.role === "clinic" ? "worker" : "clinic";

  let query = supabase
    .from("profiles")
    .select("*")
    .eq("role", oppositeRole)
    .neq("id", currentUser.profileId);

  // Exclude already swiped profiles
  if (swipedIds.length > 0) {
    query = query.not("id", "in", `(${swipedIds.join(",")})`);
  }

  const { data, error } = await query.limit(20);

  if (error) throw error;

  return (data || []).map(transformToMatchCard);
}

// POST /api/swipes - Record a swipe action
export async function postSwipe(request: SwipeRequest): Promise<SwipeResponse> {
  const isLike = request.type === "LIKE";

  // Insert the swipe record
  const { error: swipeError } = await supabase.from("likes").insert({
    from_user_id: request.swiperId,
    to_user_id: request.swipedId,
    is_like: isLike,
  });

  if (swipeError) {
    throw new Error(swipeError.message);
  }

  // Check for match if it was a LIKE
  if (isLike) {
    const { data: match } = await supabase
      .from("matches")
      .select("id")
      .or(
        `and(user1_id.eq.${request.swiperId},user2_id.eq.${request.swipedId}),and(user1_id.eq.${request.swipedId},user2_id.eq.${request.swiperId})`
      )
      .maybeSingle();

    return {
      success: true,
      isMatch: !!match,
      matchId: match?.id,
    };
  }

  return {
    success: true,
    isMatch: false,
  };
}

// GET /api/matches - Get all matches for current user
export async function getMatches(currentUser: CurrentUser): Promise<Match[]> {
  if (!currentUser.profileId) {
    return [];
  }

  const { data: matches, error } = await supabase
    .from("matches")
    .select("*")
    .or(`user1_id.eq.${currentUser.profileId},user2_id.eq.${currentUser.profileId}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!matches || matches.length === 0) return [];

  // Get other users' profiles
  const otherUserIds = matches.map((m) =>
    m.user1_id === currentUser.profileId ? m.user2_id : m.user1_id
  );

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .in("id", otherUserIds);

  if (profilesError) throw profilesError;

  const profilesMap = new Map((profiles || []).map((p) => [p.id, p]));

  return matches.map((m) => {
    const otherId = m.user1_id === currentUser.profileId ? m.user2_id : m.user1_id;
    const otherProfile = profilesMap.get(otherId);

    return {
      id: m.id,
      createdAt: m.created_at,
      isClosed: m.is_closed,
      otherProfile: otherProfile ? transformToMatchCard(otherProfile) : {
        id: otherId,
        name: "Unknown",
        position: null,
        location: null,
        availability: { days: [], hours: null, startDate: null },
        salaryRange: { min: null, max: null },
        experienceYears: null,
        imageUrl: null,
        role: "worker" as UserRole,
        description: null,
        jobType: null,
        radiusKm: null,
      },
    };
  });
}

// POST /api/auth/login - handled by Supabase Auth
// This is just a wrapper for consistency
export async function login(email: string, password: string): Promise<{ user: CurrentUser | null; error: string | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { user: null, error: error.message };
  }

  if (!data.user) {
    return { user: null, error: "Login failed" };
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", data.user.id)
    .maybeSingle();

  const currentUser: CurrentUser = {
    id: data.user.id,
    email: data.user.email || "",
    profileId: profile?.id || null,
    role: (profile?.role as UserRole) || null,
    name: profile?.name || null,
    imageUrl: profile?.avatar_url || null,
    isProfileComplete: !!profile,
  };

  return { user: currentUser, error: null };
}

// Get current user with profile
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email || "",
    profileId: profile?.id || null,
    role: (profile?.role as UserRole) || null,
    name: profile?.name || null,
    imageUrl: profile?.avatar_url || null,
    isProfileComplete: !!profile,
  };
}
