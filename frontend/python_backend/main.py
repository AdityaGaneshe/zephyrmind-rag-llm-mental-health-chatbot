import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from collections import Counter
from f_utils.db import get_summary, get_all_labels
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel
import pickle

from f_utils.prompt_builder import build_prompt
from f_utils.ollama_client import ask_ollama
from f_utils.db import save_chat, get_history
from f_utils.twilio_alert import send_alert
from f_utils.retriever import get_context

def classify_intent(message: str) -> str:
    prompt = f"""Classify the following user message into exactly ONE of the following mental health labels:
normal, stress, anxiety, depression, bipolar, personality disorder, suicidal.
Return ONLY the label as a single lowercase word, with no other text or explanation.

User message: "{message}"
Label:"""
    try:
        label = ask_ollama(prompt).strip().lower()
        valid_labels = ["normal", "stress", "anxiety", "depression", "bipolar", "personality disorder", "suicidal"]
        for valid in valid_labels:
            if valid in label:
                return valid
        return "normal"
    except Exception:
        return "normal"

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# We will use classify_intent() instead of the pickled model
# model = pickle.load(open("model.pkl", "rb"))
class ChatRequest(BaseModel):
    user_id: str
    message: str

@app.post("/chat")
def chat(req: ChatRequest):

    user_input = req.message
    user_id = req.user_id

    history = get_summary(user_id)
    
    label = classify_intent(user_input)
    
    if label == "suicidal":
        send_alert(user_input)

    context = get_context(label)

    prompt = build_prompt(user_input, context, label, history)

    response = ask_ollama(prompt)
    if label in ["depression"]:
        response += "\n\n👉 You can explore guided help here: yourwebsite.com"
    if label == "suicidal":
        response = """
        I'm really sorry you're feeling this much pain. I'm here with you.

        You do not have to go through this alone. Please consider reaching out to someone you trust right now.

        You can also contact Counceller: +91-9420586709. They are available 24/7 to listen and help.

        If you can, tell me what is been hurting you the most?
    """

    save_chat(user_id, user_input, response, label)

    return {"response": response, "label": label}

@app.get("/weekly-trend/{user_id}")
def weekly_trend(user_id: str):
    labels = get_all_labels(user_id)
    counts = Counter(labels)
    return {"trend": dict(counts)}