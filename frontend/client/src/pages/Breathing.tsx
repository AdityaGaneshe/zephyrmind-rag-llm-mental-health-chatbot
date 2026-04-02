import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wind, Play, Pause, RotateCcw, Timer, Zap, Brain, Heart } from "lucide-react";

interface BreathingPattern {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  inhale: number;
  hold: number;
  exhale: number;
  holdAfter: number;
  color: string;
}

const PATTERNS: BreathingPattern[] = [
  {
    id: "478",
    name: "4-7-8 Calm",
    description: "Best for deep relaxation and sleep. Activates your parasympathetic nervous system.",
    icon: Heart,
    inhale: 4,
    hold: 7,
    exhale: 8,
    holdAfter: 0,
    color: "from-primary to-emerald-500",
  },
  {
    id: "box",
    name: "Box Breathing",
    description: "Used by Navy SEALs for intense focus. Equal timing creates mental clarity.",
    icon: Brain,
    inhale: 4,
    hold: 4,
    exhale: 4,
    holdAfter: 4,
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "quick",
    name: "Quick Relief",
    description: "Rapid stress relief. Short inhale with extended exhale signals safety to your body.",
    icon: Zap,
    inhale: 3,
    hold: 3,
    exhale: 6,
    holdAfter: 0,
    color: "from-teal-500 to-cyan-500",
  },
];

type Phase = "idle" | "inhale" | "hold" | "exhale" | "holdAfter";

const PHASE_LABELS: Record<Phase, string> = {
  idle: "Ready",
  inhale: "Breathe In",
  hold: "Hold",
  exhale: "Breathe Out",
  holdAfter: "Hold",
};

export default function Breathing() {
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(PATTERNS[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [phaseTime, setPhaseTime] = useState(0);
  const [phaseDuration, setPhaseDuration] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<Phase>("idle");
  const timeRef = useRef(0);

  const getPhaseSequence = useCallback((pattern: BreathingPattern): { phase: Phase; duration: number }[] => {
    const seq: { phase: Phase; duration: number }[] = [
      { phase: "inhale", duration: pattern.inhale },
      { phase: "hold", duration: pattern.hold },
      { phase: "exhale", duration: pattern.exhale },
    ];
    if (pattern.holdAfter > 0) {
      seq.push({ phase: "holdAfter", duration: pattern.holdAfter });
    }
    return seq;
  }, []);

  const [phaseIndex, setPhaseIndex] = useState(0);

  const startExercise = useCallback(() => {
    const seq = getPhaseSequence(selectedPattern);
    setIsRunning(true);
    setPhaseIndex(0);
    setPhase(seq[0].phase);
    setPhaseDuration(seq[0].duration);
    setPhaseTime(0);
    phaseRef.current = seq[0].phase;
    timeRef.current = 0;
  }, [selectedPattern, getPhaseSequence]);

  const stopExercise = useCallback(() => {
    setIsRunning(false);
    setPhase("idle");
    setPhaseTime(0);
    setPhaseDuration(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetExercise = useCallback(() => {
    stopExercise();
    setCycles(0);
    setTotalSeconds(0);
    setPhaseIndex(0);
  }, [stopExercise]);

  useEffect(() => {
    if (!isRunning) return;

    const seq = getPhaseSequence(selectedPattern);

    intervalRef.current = setInterval(() => {
      setPhaseTime((prev) => {
        const newTime = prev + 0.05;
        setTotalSeconds((t) => t + 0.05);

        setPhaseIndex((currentPhaseIndex) => {
          const currentPhase = seq[currentPhaseIndex];
          if (newTime >= currentPhase.duration) {
            const nextIndex = (currentPhaseIndex + 1) % seq.length;
            if (nextIndex === 0) {
              setCycles((c) => c + 1);
            }
            const next = seq[nextIndex];
            setPhase(next.phase);
            setPhaseDuration(next.duration);
            setPhaseTime(0);
            return nextIndex;
          }
          return currentPhaseIndex;
        });

        return newTime;
      });
    }, 50);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, selectedPattern, getPhaseSequence]);

  const progress = phaseDuration > 0 ? Math.min(phaseTime / phaseDuration, 1) : 0;
  const countdown = phaseDuration > 0 ? Math.max(Math.ceil(phaseDuration - phaseTime), 0) : 0;

  const getCircleScale = () => {
    if (phase === "inhale") return 1 + progress * 0.35;
    if (phase === "exhale") return 1.35 - progress * 0.35;
    if (phase === "hold") return 1.35;
    if (phase === "holdAfter") return 1;
    return 1;
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-6 py-6 pb-4 animate-fade-in-up">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Breathing Exercises</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Guided breathing to calm your mind and body</p>
        </div>

        {/* Pattern selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {PATTERNS.map((pattern) => {
            const Icon = pattern.icon;
            const isSelected = selectedPattern.id === pattern.id;
            return (
              <button
                key={pattern.id}
                data-testid={`breathe-pattern-${pattern.id}`}
                onClick={() => {
                  if (!isRunning) {
                    setSelectedPattern(pattern);
                    resetExercise();
                  }
                }}
                disabled={isRunning}
                className={`text-left p-4 rounded-xl border-2 transition-all disabled:opacity-60 ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${pattern.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">{pattern.name}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{pattern.description}</p>
                <div className="flex gap-1 mt-2">
                  <Badge variant="secondary" className="text-[10px]">In {pattern.inhale}s</Badge>
                  <Badge variant="secondary" className="text-[10px]">Hold {pattern.hold}s</Badge>
                  <Badge variant="secondary" className="text-[10px]">Out {pattern.exhale}s</Badge>
                  {pattern.holdAfter > 0 && (
                    <Badge variant="secondary" className="text-[10px]">Hold {pattern.holdAfter}s</Badge>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Breathing Circle */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <div className="relative w-64 h-64 flex items-center justify-center mb-8">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-muted opacity-30" />

          {/* Progress ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 256 256">
            <circle
              cx="128"
              cy="128"
              r="124"
              fill="none"
              stroke="hsl(var(--primary) / 0.15)"
              strokeWidth="4"
            />
            <circle
              cx="128"
              cy="128"
              r="124"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 124}`}
              strokeDashoffset={`${2 * Math.PI * 124 * (1 - progress)}`}
              style={{ transition: "stroke-dashoffset 0.05s linear" }}
            />
          </svg>

          {/* Breathing circle */}
          <div
            className={`w-40 h-40 rounded-full bg-gradient-to-br ${selectedPattern.color} flex items-center justify-center shadow-xl`}
            style={{
              transform: `scale(${getCircleScale()})`,
              transition: "transform 0.15s ease-out",
            }}
          >
            <div className="text-center text-white">
              {phase === "idle" ? (
                <>
                  <Wind className="w-8 h-8 mx-auto mb-1 opacity-80" />
                  <p className="text-xs font-medium opacity-80">Press Start</p>
                </>
              ) : (
                <>
                  <p className="text-4xl font-bold">{countdown}</p>
                  <p className="text-sm font-medium opacity-90 mt-1">{PHASE_LABELS[phase]}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mb-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Timer className="w-4 h-4" />
            <span>{formatTime(totalSeconds)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wind className="w-4 h-4" />
            <span>{cycles} cycle{cycles !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {!isRunning ? (
            <Button
              data-testid="button-breathe-start"
              onClick={startExercise}
              size="lg"
              className="px-8"
            >
              <Play className="w-4 h-4 mr-2" fill="currentColor" />
              {cycles > 0 ? "Resume" : "Start"}
            </Button>
          ) : (
            <Button
              data-testid="button-breathe-pause"
              onClick={stopExercise}
              size="lg"
              variant="secondary"
              className="px-8"
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          )}
          <Button
            data-testid="button-breathe-reset"
            onClick={resetExercise}
            size="lg"
            variant="ghost"
            disabled={cycles === 0 && !isRunning}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
