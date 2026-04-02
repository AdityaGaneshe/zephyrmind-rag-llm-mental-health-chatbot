import os
from twilio.rest import Client
from dotenv import load_dotenv

load_dotenv()

client = Client(os.getenv("TWILIO_ACCOUNT_SID"), os.getenv("TWILIO_AUTH_TOKEN"))

def send_alert(message):
    client.messages.create(
        body=f"URGENT Mental Health Alert: {message[:160]}",
        from_=os.getenv("TWILIO_FROM"),
        to=os.getenv("COUNSELOR_PHONE")
    )