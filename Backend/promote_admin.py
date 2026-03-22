from pathlib import Path
from dotenv import load_dotenv
import os, psycopg2

load_dotenv(Path(__file__).parent / '.env')

TARGET = "nikhil03@gmail.com"
db_url = os.getenv('DATABASE_URL').replace('postgresql+psycopg2://', 'postgresql://')
conn = psycopg2.connect(db_url)
conn.autocommit = True
cur = conn.cursor()

cur.execute("SELECT email, name, is_superadmin FROM users WHERE email = %s", (TARGET,))
row = cur.fetchone()
if not row:
    print(f"❌ User '{TARGET}' not found in DB.")
    print("Registered emails:")
    cur.execute("SELECT email, name FROM users ORDER BY created_at")
    for r in cur.fetchall():
        print(f"  {r[0]} — {r[1]}")
else:
    cur.execute("UPDATE users SET is_superadmin = TRUE WHERE email = %s", (TARGET,))
    print(f"✅ '{TARGET}' promoted to Super Admin!")

conn.close()
