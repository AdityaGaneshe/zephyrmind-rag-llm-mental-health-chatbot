import { useState } from "react";
import { Leaf, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface WelcomeProps {
  onComplete: (profile: { name: string; reminderTime: string }) => void;
}

const TIPS = [
  "Track your daily stress levels with our visual dashboard",
  "Chat with Serene Mind, your empathetic companion",
  "Practice guided breathing exercises anytime",
  "Discover curated videos for your stress level",
  "Complete evidence-based stress-relief tasks",
];

export default function Welcome({ onComplete }: WelcomeProps) {
  const [name, setName] = useState("");
  const [reminderTime, setReminderTime] = useState("09:00");
  const [step, setStep] = useState<1 | 2>(1);

  const handleSubmit = () => {
    if (step === 1 && name.trim()) {
      setStep(2);
      return;
    }
    if (step === 2) {
      onComplete({ name: name.trim(), reminderTime });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg mb-4 animate-breathe">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Serene Mind</h1>
          <p className="text-muted-foreground text-sm mt-1">Your empathetic AI companion</p>
        </div>

        {step === 1 ? (
          <Card className="border-primary/10 shadow-lg">
            <CardContent className="pt-6 pb-6">
              <div className="space-y-5">
                <div className="text-center mb-2">
                  <h2 className="text-lg font-semibold text-foreground">Welcome! 🌿</h2>
                  <p className="text-sm text-muted-foreground mt-1">Let's personalize your experience</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name-input" className="text-sm font-medium">What should we call you?</Label>
                  <input
                    id="name-input"
                    data-testid="input-welcome-name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>

                <Button
                  data-testid="button-welcome-next"
                  onClick={handleSubmit}
                  disabled={!name.trim()}
                  className="w-full"
                  size="lg"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-primary/10 shadow-lg">
            <CardContent className="pt-6 pb-6">
              <div className="space-y-5">
                <div className="text-center mb-2">
                  <h2 className="text-lg font-semibold text-foreground">
                    Nice to meet you, {name}! ✨
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">Set your daily check-in reminder</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminder-time" className="text-sm font-medium">Preferred reminder time</Label>
                  <input
                    id="reminder-time"
                    data-testid="input-reminder-time"
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                  <p className="text-xs text-muted-foreground">We'll remind you to check in and log your stress</p>
                </div>

                {/* Feature highlights */}
                <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <p className="text-xs font-semibold text-foreground">Here's what you can do:</p>
                  </div>
                  <ul className="space-y-2">
                    {TIPS.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="text-primary mt-0.5">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  data-testid="button-welcome-start"
                  onClick={handleSubmit}
                  className="w-full"
                  size="lg"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <div className={`w-2 h-2 rounded-full transition-all ${step === 1 ? "bg-primary w-6" : "bg-muted"}`} />
          <div className={`w-2 h-2 rounded-full transition-all ${step === 2 ? "bg-primary w-6" : "bg-muted"}`} />
        </div>
      </div>
    </div>
  );
}
