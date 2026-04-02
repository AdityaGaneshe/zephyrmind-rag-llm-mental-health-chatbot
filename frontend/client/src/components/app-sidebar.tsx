import { useLocation, Link } from "wouter";
import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { BarChart2, MessageCircleHeart, CheckSquare, Play, HeartPulse, Phone, Wind, Sun, Moon } from "lucide-react";

const navItems = [
  { title: "Dashboard", url: "/", icon: BarChart2, description: "Weekly overview" },
  { title: "Counselor", url: "/chat", icon: MessageCircleHeart, description: "Talk to Serene" },
  { title: "Breathe", url: "/breathe", icon: Wind, description: "Breathing exercises" },
  { title: "Tasks", url: "/tasks", icon: CheckSquare, description: "Stress-based tasks" },
  { title: "Videos", url: "/videos", icon: Play, description: "Guided content" },
];

export function AppSidebar() {
  const [location] = useLocation();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("serene-dark-mode") === "true";
    }
    return false;
  });

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    localStorage.setItem("serene-dark-mode", String(isDark));
  }, [isDark]);

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-white/20 group overflow-hidden">
            <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors duration-300" />
            <HeartPulse className="w-5 h-5 text-white drop-shadow-lg z-10 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <p className="font-bold text-[17px] bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-300 leading-none tracking-tight">
              Serene Mind
            </p>
            <p className="text-[9px] font-bold text-teal-600/80 dark:text-teal-400/80 uppercase tracking-[0.15em] mt-1.5">
              Empathetic Companion
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location === item.url || (item.url !== "/" && location.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} data-testid={`nav-${item.title.toLowerCase()}`}>
                      <Link href={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-4 space-y-3">
        {/* Dark mode toggle */}
        <button
          data-testid="button-dark-mode-toggle"
          onClick={() => setIsDark(!isDark)}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg bg-muted/50 border border-border text-sm text-foreground hover:bg-muted transition-colors"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Moon className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="text-xs font-medium">{isDark ? "Light Mode" : "Dark Mode"}</span>
        </button>

        {/* Crisis helpline */}
        <div className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Phone className="w-3.5 h-3.5 text-primary" />
            <p className="text-xs font-semibold text-foreground">Need immediate help? 🇮🇳</p>
          </div>
          <p className="text-xs text-muted-foreground">Aditya Helpline: 1800-599-0019</p>
          <p className="text-xs text-muted-foreground">Vandrevala Foundation: 1860-2662-345</p>
          <p className="text-xs text-muted-foreground">iCall: 9152987821</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
