def get_context(label):

    FILE_MAP = {
        "normal": "rag/normal.txt",
        "anxiety": "rag/anxiety.txt",
        "bipolar": "rag/bipolar.txt",
        "depression": "rag/depression.txt",
        "personality disorder": "rag/personality_disorder.txt",
        "stress": "rag/stress.txt",
        "suicidal": "rag/suicidal.txt"
    }

    with open(FILE_MAP[label], "r", encoding="utf-8") as f:
        return f.read()