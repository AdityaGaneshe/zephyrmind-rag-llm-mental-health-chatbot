import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Chatbot from "@/pages/Chatbot";
import Tasks from "@/pages/Tasks";
import Videos from "@/pages/Videos";
import Breathing from "@/pages/Breathing";
import Welcome from "@/pages/Welcome";
import NotificationBanner from "@/components/NotificationBanner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Leaf } from "lucide-react";

interface UserProfile {
  name: string;
  reminderTime: string;
}

function getUserProfile(): UserProfile | null {
  try {
    const data = localStorage.getItem("serene-user-profile");
    if (data) return JSON.parse(data);
  } catch {}
  return null;
}

function setUserProfile(profile: UserProfile) {
  localStorage.setItem("serene-user-profile", JSON.stringify(profile));
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/chat" component={Chatbot} />
      <Route path="/breathe" component={Breathing} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/videos" component={Videos} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(getUserProfile);

  const handleWelcomeComplete = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    setProfile(newProfile);
  };

  // If no profile, show welcome page
  if (!profile) {
    return (
      <QueryClientProvider client={queryClient}>
        <Welcome onComplete={handleWelcomeComplete} />
        <Toaster />
      </QueryClientProvider>
    );
  }

  const style = {
    "--sidebar-width": "17rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full overflow-hidden">
            <AppSidebar />
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
              <header className="relative flex items-center gap-3 px-4 py-3 border-b border-border flex-shrink-0 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground tracking-tight">Serene Mind</span>
                </div>
                {profile && (
                  <div className="ml-auto text-xs text-muted-foreground">
                    Welcome, <span className="font-medium text-foreground">{profile.name}</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              </header>
              <NotificationBanner userName={profile.name} />
              <main className="flex-1 overflow-hidden">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
