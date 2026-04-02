import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { StressEntry } from "@shared/schema";
import { Plus, TrendingDown, TrendingUp, Minus, Activity, Calendar, Info } from "lucide-react";
import { format, parseISO, subDays } from "date-fns";

const MOODS = ["Peaceful", "Calm", "Neutral", "Anxious", "Stressed", "Overwhelmed", "Hopeful", "Tired", "Energetic"];

function getStressLabel(level: number) {
  if (level <= 2) return { label: "Very Low", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950" };
  if (level <= 4) return { label: "Low", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950" };
  if (level <= 6) return { label: "Moderate", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950" };
  if (level <= 8) return { label: "High", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950" };
  return { label: "Very High", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950" };
}

function getStressColor(level: number) {
  if (level <= 2) return "hsl(145, 55%, 45%)";
  if (level <= 4) return "hsl(120, 45%, 45%)";
  if (level <= 6) return "hsl(45, 80%, 48%)";
  if (level <= 8) return "hsl(25, 85%, 50%)";
  return "hsl(0, 72%, 51%)";
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const stressInfo = getStressLabel(value);
    return (
      <div className="bg-card border border-card-border rounded-md px-3 py-2 shadow-md">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-semibold">{value}/10</p>
        <span className={`text-xs font-medium ${stressInfo.color}`}>{stressInfo.label}</span>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stressLevel, setStressLevel] = useState(5);
  const [mood, setMood] = useState("Neutral");
  const [notes, setNotes] = useState("");

  const { data: entries = [], isLoading } = useQuery<StressEntry[]>({
    queryKey: ["/api/stress-entries"],
  });

  const createMutation = useMutation({
    mutationFn: (data: { date: string; level: number; mood: string; notes: string }) =>
      apiRequest("POST", "/api/stress-entries", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stress-entries"] });
      setDialogOpen(false);
      setStressLevel(5);
      setMood("Neutral");
      setNotes("");
      toast({ title: "Stress entry logged", description: "Your daily check-in has been saved." });
    },
    onError: () => toast({ title: "Error", description: "Failed to save entry.", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/stress-entries/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stress-entries"] });
      toast({ title: "Entry removed" });
    },
  });

  const handleSubmit = () => {
    const today = new Date().toISOString().split("T")[0];
    createMutation.mutate({ date: today, level: stressLevel, mood, notes });
  };

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = date.toISOString().split("T")[0];
    const entry = entries.find(e => e.date === dateStr);
    return {
      day: format(date, "EEE"),
      date: dateStr,
      level: entry?.level ?? null,
      mood: entry?.mood ?? null,
    };
  });

  const chartData = last7.map(d => ({ ...d, level: d.level }));

  const validEntries = entries.filter(e => e.level !== null);
  const avgLevel = validEntries.length > 0
    ? Math.round(validEntries.reduce((s, e) => s + e.level, 0) / validEntries.length * 10) / 10
    : 0;

  const todayEntry = entries.find(e => e.date === new Date().toISOString().split("T")[0]);
  const currentStress = todayEntry?.level ?? null;
  const currentInfo = currentStress ? getStressLabel(currentStress) : null;

  const recentEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const trend = (() => {
    if (validEntries.length < 2) return null;
    const sorted = [...validEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const last = sorted[sorted.length - 1].level;
    const prev = sorted[sorted.length - 2].level;
    if (last < prev) return "down";
    if (last > prev) return "up";
    return "same";
  })();

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-6 pb-0">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Stress Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Track your wellbeing over time</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-log-stress">
                <Plus className="w-4 h-4 mr-2" />
                Log Today's Stress
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Daily Stress Check-in</DialogTitle>
              </DialogHeader>
              <div className="space-y-5 pt-2">
                <div className="space-y-3">
                  <Label>Stress Level: <span className="font-bold text-foreground">{stressLevel}/10</span></Label>
                  <div className={`rounded-md px-4 py-2 text-center ${getStressLabel(stressLevel).bg}`}>
                    <span className={`text-sm font-semibold ${getStressLabel(stressLevel).color}`}>
                      {getStressLabel(stressLevel).label}
                    </span>
                  </div>
                  <Slider
                    data-testid="slider-stress-level"
                    min={1}
                    max={10}
                    step={1}
                    value={[stressLevel]}
                    onValueChange={([v]) => setStressLevel(v)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Very Calm</span>
                    <span>Overwhelming</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mood-select">Current Mood</Label>
                  <Select value={mood} onValueChange={setMood}>
                    <SelectTrigger data-testid="select-mood" id="mood-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MOODS.map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes-input">Notes (optional)</Label>
                  <Textarea
                    data-testid="input-notes"
                    id="notes-input"
                    placeholder="What's contributing to your stress today?"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                </div>

                <Button
                  data-testid="button-save-entry"
                  onClick={handleSubmit}
                  disabled={createMutation.isPending}
                  className="w-full"
                >
                  {createMutation.isPending ? "Saving..." : "Save Check-in"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card data-testid="card-today-stress">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-1">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Today</p>
                  {currentStress ? (
                    <>
                      <p className="text-2xl font-bold text-foreground">{currentStress}<span className="text-sm text-muted-foreground">/10</span></p>
                      <Badge variant="secondary" className={`text-xs mt-1 ${currentInfo?.color}`}>{currentInfo?.label}</Badge>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Not logged</p>
                  )}
                </div>
                <Activity className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-weekly-avg">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-1">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Weekly Avg</p>
                  <p className="text-2xl font-bold text-foreground">{avgLevel || "—"}<span className="text-sm text-muted-foreground">{avgLevel ? "/10" : ""}</span></p>
                  {avgLevel > 0 && <Badge variant="secondary" className={`text-xs mt-1 ${getStressLabel(avgLevel).color}`}>{getStressLabel(Math.round(avgLevel)).label}</Badge>}
                </div>
                <Calendar className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-trend">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-1">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Trend</p>
                  {trend === "down" && <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Improving</p>}
                  {trend === "up" && <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">Rising</p>}
                  {trend === "same" && <p className="text-sm font-semibold text-muted-foreground">Stable</p>}
                  {!trend && <p className="text-sm text-muted-foreground italic">No data</p>}
                </div>
                {trend === "down" ? <TrendingDown className="w-4 h-4 text-emerald-500 mt-1 flex-shrink-0" /> :
                  trend === "up" ? <TrendingUp className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" /> :
                    <Minus className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-entries-count">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-1">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Entries</p>
                  <p className="text-2xl font-bold text-foreground">{entries.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total check-ins</p>
                </div>
                <Info className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2" data-testid="card-stress-chart">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Weekly Stress Levels</CardTitle>
            <CardDescription>Your stress pattern over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="text-muted-foreground text-sm">Loading chart...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(265, 60%, 55%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(265, 60%, 55%)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={5} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" strokeOpacity={0.4} />
                  <Area
                    type="monotone"
                    dataKey="level"
                    stroke="hsl(265, 60%, 55%)"
                    strokeWidth={2.5}
                    fill="url(#stressGradient)"
                    dot={(props: any) => {
                      const { cx, cy, payload } = props;
                      if (payload.level === null) return <circle key={props.key} />;
                      return (
                        <circle
                          key={props.key}
                          cx={cx}
                          cy={cy}
                          r={4}
                          fill={getStressColor(payload.level)}
                          stroke="hsl(var(--card))"
                          strokeWidth={2}
                        />
                      );
                    }}
                    activeDot={{ r: 6, fill: "hsl(265, 60%, 55%)" }}
                    connectNulls={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Entries */}
        <Card data-testid="card-recent-entries">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Check-ins</CardTitle>
            <CardDescription>Your latest stress logs</CardDescription>
          </CardHeader>
          <CardContent>
            {recentEntries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">No entries yet.</p>
                <p className="text-muted-foreground text-xs mt-1">Log your first stress check-in!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentEntries.map(entry => {
                  const info = getStressLabel(entry.level);
                  return (
                    <div
                      key={entry.id}
                      data-testid={`entry-item-${entry.id}`}
                      className="flex items-start gap-3 p-3 rounded-md bg-muted/40"
                    >
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${info.bg} ${info.color}`}>
                        {entry.level}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-medium truncate">{entry.mood}</p>
                          <p className="text-xs text-muted-foreground flex-shrink-0">
                            {format(parseISO(entry.date), "MMM d")}
                          </p>
                        </div>
                        {entry.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{entry.notes}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
