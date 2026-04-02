import sqlite3

conn = sqlite3.connect("database.db", check_same_thread=False)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS chats (
    user_id TEXT,
    user_msg TEXT,
    bot_msg TEXT,
    label TEXT
)
""")

def save_chat(user_id, user_msg, bot_msg, label):
    cursor.execute("INSERT INTO chats VALUES (?, ?, ?, ?)",
                   (user_id, user_msg, bot_msg, label))
    conn.commit()

def get_history(user_id):
    cursor.execute("SELECT user_msg, bot_msg FROM chats WHERE user_id=?", (user_id,))
    return cursor.fetchall()
def get_summary(user_id):
    cursor.execute("SELECT user_msg FROM chats WHERE user_id=? LIMIT 5", (user_id,))
    chats = cursor.fetchall()

    summary = " ".join([msg[0] for msg in chats])
    return summary