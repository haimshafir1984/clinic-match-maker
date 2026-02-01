import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Swipe from "./pages/Swipe";
import Matches from "./pages/Matches";
import ChatList from "./pages/ChatList";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route
              path="/swipe"
              element={
                <AuthGuard>
                  <Swipe />
                </AuthGuard>
              }
            />
            <Route
              path="/matches"
              element={
                <AuthGuard>
                  <Matches />
                </AuthGuard>
              }
            />
            <Route
              path="/chat"
              element={
                <AuthGuard>
                  <ChatList />
                </AuthGuard>
              }
            />
            <Route
              path="/chat/:matchId"
              element={
                <AuthGuard>
                  <Chat />
                </AuthGuard>
              }
            />
            <Route
              path="/profile"
              element={
                <AuthGuard>
                  <Profile />
                </AuthGuard>
              }
            />

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/swipe" replace />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
