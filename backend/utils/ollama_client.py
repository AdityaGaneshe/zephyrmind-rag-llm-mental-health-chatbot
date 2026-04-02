import requests

def ask_ollama(prompt):
    res = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3",
            "prompt": prompt,
            "stream": False,
            "options": {
                "num_predict": 120   # 🔥 limits response length
            }
        }
    )
    return res.json()["response"]