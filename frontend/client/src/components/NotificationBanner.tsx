import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Bell, Wind, BarChart2, Trophy } from "lucide-react";
import type { StressEntry } from "@shared/schema";

interface NotificationBannerProps {
  userName: string;
}

interface Notification {
  id: string;
  icon: React.ElementType;
  message: string;
  type: "reminder" | "achievement" | "tip";
  color: string;
}

export default function NotificationBanner({ userName }: NotificationBannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [visible, setVisible] = useState(true);

  const { data: entries = [] } = useQuery<StressEntry[]>({
    queryKey: ["/api/stress-entries"],
  });

  const notifications: Notification[] = [];

  // Check if stress logged today
  const today = new Date().toISOString().split("T")[0];
  const hasLoggedToday = entries.some((e) => e.date === today);

  if (!hasLoggedToday) {
    notifications.push({
      id: "log-stress",
      icon: BarChart2,
      message: `Hey ${userName}, you haven't logged your stress today. Take a moment to check in! 🌿`,
      type: "reminder",
      color: "bg-primary/10 border-primary/20 text-primary",
    });
  }

  // Streak detection
  const sortedDates = Array.from(new Set(entries.map((e) => e.date))).sort().reverse();
  let streak = 0;
  const todayDate = new Date();
  for (let i = 0; i < sortedDates.length; i++) {
    const expected = new Date(todayDate);
    expected.setDate(expected.getDate() - i);
    const expectedStr = expected.toISOString().split("T")[0];
    if (sortedDates[i] === expectedStr) {
      streak++;
    } else {
      break;
    }
  }

  if (streak >= 3) {
    notifications.push({
      id: "streak",
      icon: Trophy,
      message: `Amazing ${userName}! You're on a ${streak}-day check-in streak! Keep it going! 🏆`,
      type: "achievement",
      color: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
    });
  }

  // Breathing reminder (show during afternoon)
  const hour = new Date().getHours();
  if (hour >= 14 && hour <= 17) {
    notifications.push({
      id: "breathe-tip",
      icon: Wind,
      message: `Afternoon chai break, ${userName}? Pair it with a quick breathing exercise to reset your energy! 🧘`,
      type: "tip",
      color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    });
  }

  // High stress warning
  const recentEntries = entries.filter((e) => {
    const d = new Date(e.date);
    const diff = (todayDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 2;
  });
  const avgRecent = recentEntries.length > 0
    ? recentEntries.reduce((s, e) => s + e.level, 0) / recentEntries.length
    : 0;

  if (avgRecent >= 7 && recentEntries.length > 0) {
    notifications.push({
      id: "high-stress",
      icon: Bell,
      message: `Your recent stress levels have been high. Remember to take breaks and try some calming activities. 💚`,
      type: "reminder",
      color: "bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400",
    });
  }

  const activeNotifications = notifications.filter((n) => !dismissed.has(n.id));

  useEffect(() => {
    if (activeNotifications.length === 0) setVisible(false);
    else setVisible(true);
  }, [activeNotifications.length]);

  if (!visible || activeNotifications.length === 0) return null;

  const notification = activeNotifications[0];
  const Icon = notification.icon;

  return (
    <div className="px-4 pt-2 flex-shrink-0 animate-fade-in-up">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${notification.color} transition-all`}>
        <Icon className="w-4 h-4 flex-shrink-0" />
        <p className="text-xs font-medium flex-1">{notification.message}</p>
        <button
          data-testid="button-dismiss-notification"
          onClick={() => setDismissed((prev) => new Set(prev).add(notification.id))}
          className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
