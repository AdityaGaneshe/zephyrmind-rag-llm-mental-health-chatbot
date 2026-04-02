import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Task, UserTaskCompletion } from "@shared/schema";
import {
  Wind, Eye, BookOpen, Footprints, Activity, Droplets, Target, Phone,
  PersonStanding, PenLine, Music, ShieldAlert, CheckCircle2, Circle, Clock, Filter
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Wind, Eye, BookOpen, Footprints, Activity, Droplets, Target, Phone,
  PersonStanding, PenLine, Music, ShieldAlert,
};

const CATEGORIES = ["All", "Breathing", "Mindfulness", "Journaling", "Movement", "Relaxation", "Grounding", "Connection", "Crisis"];

function getStressRangeLabel(min: number, max: number): { label: string; color: string; bg: string } {
  const avg = (min + max) / 2;
  if (avg <= 3) return { label: "Low Stress", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800" };
  if (avg <= 6) return { label: "Moderate Stress", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800" };
  return { label: "High Stress", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800" };
}

function TaskCard({ task, isCompleted, onToggle, isPending }: {
  task: Task;
  isCompleted: boolean;
  onToggle: () => void;
  isPending: boolean;
}) {
  const Icon = ICON_MAP[task.icon] ?? Activity;
  const rangeInfo = getStressRangeLabel(task.minStressLevel, task.maxStressLevel);

  return (
    <Card
      data-testid={`task-card-${task.id}`}
      className={`transition-all duration-200 ${isCompleted ? "opacity-75" : ""}`}
    >
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 ${
            isCompleted
              ? "bg-emerald-50 dark:bg-emerald-950"
              : "bg-primary/10"
          }`}>
            <Icon className={`w-5 h-5 ${isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-primary"}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className={`text-sm font-semibold leading-tight ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {task.title}
              </h3>
              <button
                data-testid={`toggle-task-${task.id}`}
                onClick={onToggle}
                disabled={isPending}
                className="flex-shrink-0 mt-0.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                {isCompleted
                  ? <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  : <Circle className="w-5 h-5" />
                }
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{task.description}</p>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-xs">{task.category}</Badge>
              <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border ${rangeInfo.bg} ${rangeInfo.color}`}>
                <span>Level {task.minStressLevel}–{task.maxStressLevel}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{task.durationMinutes} min</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Tasks() {
  const { toast } = useToast();
  const [filterLevel, setFilterLevel] = useState<number[]>([5]);
  const [useFilter, setUseFilter] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: allTasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: completions = [] } = useQuery<UserTaskCompletion[]>({
    queryKey: ["/api/task-completions"],
  });

  const completeMutation = useMutation({
    mutationFn: (taskId: string) => apiRequest("POST", "/api/task-completions", { taskId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/task-completions"] });
      toast({ title: "Task completed", description: "Great job taking care of yourself!" });
    },
    onError: () => toast({ title: "Error", description: "Failed to mark task.", variant: "destructive" }),
  });

  const uncompleteMutation = useMutation({
    mutationFn: (taskId: string) => apiRequest("DELETE", `/api/task-completions/${taskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/task-completions"] });
    },
  });

  const completedIds = new Set(completions.map(c => c.taskId));

  const filteredTasks = allTasks.filter(task => {
    const levelMatch = !useFilter || (filterLevel[0] >= task.minStressLevel && filterLevel[0] <= task.maxStressLevel);
    const catMatch = selectedCategory === "All" || task.category === selectedCategory;
    return levelMatch && catMatch;
  });

  const completedCount = filteredTasks.filter(t => completedIds.has(t.id)).length;

  const handleToggle = (task: Task) => {
    if (completedIds.has(task.id)) {
      uncompleteMutation.mutate(task.id);
    } else {
      completeMutation.mutate(task.id);
    }
  };

  const stressLevelLabel = filterLevel[0] <= 3 ? "Low" : filterLevel[0] <= 6 ? "Moderate" : filterLevel[0] <= 8 ? "High" : "Very High";

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-6 py-6 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Stress-Relief Tasks</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Evidence-based activities for your stress level</p>
          </div>
          {filteredTasks.length > 0 && (
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{completedCount}</span>/{filteredTasks.length} completed
            </div>
          )}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col gap-4">
              {/* Stress Level Filter */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Filter by Stress Level
                  </Label>
                  <Button
                    variant={useFilter ? "default" : "secondary"}
                    size="sm"
                    data-testid="button-toggle-filter"
                    onClick={() => setUseFilter(!useFilter)}
                  >
                    <Filter className="w-3 h-3 mr-1.5" />
                    {useFilter ? `Level ${filterLevel[0]} (${stressLevelLabel})` : "All Levels"}
                  </Button>
                </div>
                {useFilter && (
                  <div className="space-y-2">
                    <Slider
                      data-testid="slider-filter-level"
                      min={1}
                      max={10}
                      step={1}
                      value={filterLevel}
                      onValueChange={setFilterLevel}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1 — Very Calm</span>
                      <span>10 — Overwhelmed</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    data-testid={`filter-cat-${cat}`}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      selectedCategory === cat
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted border-border text-muted-foreground hover-elevate"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress bar */}
        {filteredTasks.length > 0 && completedCount > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Progress</span>
              <span>{Math.round((completedCount / filteredTasks.length) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / filteredTasks.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="px-6 pb-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-4 pb-4">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-md bg-muted flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
              <Filter className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground mb-1">No tasks match your filters</p>
            <p className="text-muted-foreground text-sm">Try adjusting the stress level or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                isCompleted={completedIds.has(task.id)}
                onToggle={() => handleToggle(task)}
                isPending={completeMutation.isPending || uncompleteMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
