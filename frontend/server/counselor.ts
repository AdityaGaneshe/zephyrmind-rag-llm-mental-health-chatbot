import type { ChatMessage } from "@shared/schema";

// ─── Configuration ────────────────────────────────────────────────────────────
// URL of your Python FastAPI backend (mental_health_ai/backend/main.py)
const PYTHON_BACKEND_URL = "http://localhost:8000";
// ─────────────────────────────────────────────────────────────────────────────

export type MentalHealthLabel =
  | "normal"
  | "stress"
  | "anxiety"
  | "depression"
  | "bipolar"
  | "personality disorder"
  | "suicidal";

export interface AnalysisResult {
  label: MentalHealthLabel | null;
  source: "python_rag" | "rules";
}

// Call your Python FastAPI RAG backend
async function callPythonBackend(
  userId: string,
  message: string
): Promise<{ response: string; label: MentalHealthLabel } | null> {
  try {
    const res = await fetch(`${PYTHON_BACKEND_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, message }),
      signal: AbortSignal.timeout(60000), // 60s timeout for Ollama generation
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      response: data.response,
      label: (data.label ?? "normal") as MentalHealthLabel,
    };
  } catch {
    return null; // Python backend not running — fall back to rules
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function generateCounselorResponse(
  userMessage: string,
  history: ChatMessage[],
  sessionId: string = "default"
): Promise<{ response: string; analysis: AnalysisResult }> {

  // Call the Python RAG + Ollama backend
  const pythonResult = await callPythonBackend(sessionId, userMessage);

  if (pythonResult) {
    return {
      response: pythonResult.response,
      analysis: { label: pythonResult.label, source: "python_rag" },
    };
  }

  // If the backend is down or times out, return a generic error message
  // so the user knows there is a connection issue, instead of looping.
  return {
    response: "I'm having trouble connecting to my servers right now. Please take a deep breath and try sending your message again in a moment.",
    analysis: { label: null, source: "rules" },
  };
}

