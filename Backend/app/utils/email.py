import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ..core.config import settings

def send_verification_email(to_email: str, code: str):
    """Send an OTP code to the provided email address via SMTP."""
    
    server = settings.SMTP_SERVER
    port = settings.SMTP_PORT
    username = settings.SMTP_USERNAME
    password = settings.SMTP_PASSWORD
    
    # If no credentials, we can just print it (useful for local testing before setup)
    if not username or not password:
        print(f"==================================================")
        print(f"MOCK EMAIL TO: {to_email}")
        print(f"Verification Code: {code}")
        print(f"==================================================")
        return

    subject = "Verify your GyaanChat Account"
    body = f"""
    <html>
      <body>
        <h2>Welcome to GyaanChat!</h2>
        <p>Please enter the following verification code to complete your registration:</p>
        <h1 style="font-size: 32px; letter-spacing: 4px;">{code}</h1>
        <p>If you did not request this, please ignore this email.</p>
      </body>
    </html>
    """

    msg = MIMEMultipart()
    msg['From'] = username
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'html'))

    try:
        with smtplib.SMTP(server, port) as smtp:
            smtp.starttls()
            smtp.login(username, password)
            smtp.send_message(msg)
    except Exception as e:
        print(f"Failed to send email: {e}")
        # In a real app we might want to log this or raise an exception

def send_reset_password_email(to_email: str, code: str):
    """Send a password reset code to the provided email address via SMTP."""
    
    server = settings.SMTP_SERVER
    port = settings.SMTP_PORT
    username = settings.SMTP_USERNAME
    password = settings.SMTP_PASSWORD
    
    # If no credentials, just print it (useful for local testing before setup)
    if not username or not password:
        print(f"==================================================")
        print(f"MOCK PASSWORD RESET TO: {to_email}")
        print(f"Reset Code: {code}")
        print(f"==================================================")
        return

    subject = "Reset Your GyaanChat Password"
    body = f"""
    <html>
      <body>
        <h2>Password Reset Request</h2>
        <p>You requested to reset your GyaanChat password. Enter this code to proceed:</p>
        <h1 style="font-size: 32px; letter-spacing: 4px;">{code}</h1>
        <p>This code will expire securely in 15 minutes.</p>
        <p>If you did not request a password reset, please safely ignore this email.</p>
      </body>
    </html>
    """

    msg = MIMEMultipart()
    msg['From'] = username
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'html'))

    try:
        with smtplib.SMTP(server, port) as smtp:
            smtp.starttls()
            smtp.login(username, password)
            smtp.send_message(msg)
    except Exception as e:
        print(f"Failed to send reset email: {e}")
