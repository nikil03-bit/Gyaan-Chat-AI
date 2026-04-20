import sys
import os

# Add the app directory to the system path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.user import User

def toggle_superadmin(email: str, status: bool):
    session = SessionLocal()
    try:
        user = session.query(User).filter(User.email == email).first()
        if not user:
            print(f"User with email '{email}' not found.")
            return

        user.is_superadmin = status
        session.commit()
        
        status_str = "Superadmin" if status else "Regular User"
        print(f"Successfully updated user '{email}' to {status_str}.")
        
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python make_superadmin.py [email] [optional: --remove]")
        print("Example: python make_superadmin.py user@example.com")
        sys.exit(1)
        
    target_email = sys.argv[1]
    make_superadmin = True
    
    if len(sys.argv) >= 3 and sys.argv[2] == "--remove":
        make_superadmin = False
        
    toggle_superadmin(target_email, make_superadmin)
