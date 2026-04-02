def build_prompt(user_input, context, label, history):

    BEHAVIOR_MAP = {
        "normal": "casual",
        "stress": "supportive",
        "anxiety": "supportive",
        "depression": "deep_support",
        "bipolar": "deep_support",
        "personality disorder": "deep_support",
        "suicidal": "crisis"
    }

    behavior = BEHAVIOR_MAP[label]

    return f"""
    You are a professional mental health counsellor.

    RULES:
    - Talk like a human, not like an AI
    - Keep responses SHORT (3-5 lines max)
    - Ask 1 follow-up question
    - Use simple language
    - Be empathetic and warm
    - Avoid long paragraphs

    Behavior: {behavior}

    Context:
    {context}

    Previous chat:
    {history}

    User:
    {user_input}
    """