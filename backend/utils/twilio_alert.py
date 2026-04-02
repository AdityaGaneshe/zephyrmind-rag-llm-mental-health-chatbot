import os
from twilio.rest import Client

account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")

client = Client(account_sid, auth_token)

def send_alert(message):
    print("Attempting to send Twilio alert for:", message)
    try:
        msg = client.messages.create(
            body=f"URGENT: {message}",
            from_="+18287529758",
            to="+919420586709"
        )
        print("Twilio Success! SID:", msg.sid, "Status:", msg.status)
        return msg.sid
    except Exception as e:
        print("Twilio failed to send:", e)
        return str(e)