import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def get_context(label):

    FILE_MAP = {
        "normal":               os.path.join(BASE_DIR, "rag/normal.txt"),
        "anxiety":              os.path.join(BASE_DIR, "rag/anxiety.txt"),
        "bipolar":              os.path.join(BASE_DIR, "rag/bipolar.txt"),
        "depression":           os.path.join(BASE_DIR, "rag/depression.txt"),
        "personality disorder": os.path.join(BASE_DIR, "rag/personality disorder.txt"),
        "stress":               os.path.join(BASE_DIR, "rag/stress.txt"),
        "suicidal":             os.path.join(BASE_DIR, "rag/suicidal.txt"),
    }

    with open(FILE_MAP[label], "r", encoding="utf-8") as f:
        return f.read()